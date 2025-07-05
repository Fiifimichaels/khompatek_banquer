package com.kbanquer2.app.ussd

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import kotlinx.coroutines.*

class UssdAccessibilityService : AccessibilityService() {
    
    companion object {
        private const val TAG = "UssdAccessibilityService"
        private const val PREFS_NAME = "ussd_automation_prefs"
        private const val KEY_AUTOMATION_ENABLED = "automation_enabled"
        private const val KEY_TRANSACTION_TYPE = "transaction_type"
        private const val KEY_PHONE_NUMBER = "phone_number"
        private const val KEY_AMOUNT = "amount"
        private const val KEY_PIN = "pin"
        private const val KEY_USE_CUSTOM_PIN = "use_custom_pin"
        private const val KEY_CURRENT_STEP = "current_step"
        private const val KEY_PIN_ATTEMPTS = "pin_attempts"
        
        // Transaction states
        private const val STATE_IDLE = 0
        private const val STATE_MAIN_MENU = 1
        private const val STATE_SUB_MENU = 2
        private const val STATE_PHONE_INPUT = 3
        private const val STATE_PHONE_CONFIRM = 4
        private const val STATE_AMOUNT_INPUT = 5
        private const val STATE_CONFIRMATION = 6
        private const val STATE_PIN_INPUT = 7
        private const val STATE_PROCESSING = 8
        private const val STATE_COMPLETED = 9
        private const val STATE_PIN_PROMPT = 10 // New state for PIN prompting
        
        var instance: UssdAccessibilityService? = null
    }
    
    private lateinit var prefs: SharedPreferences
    private var currentState = STATE_IDLE
    private var transactionType = ""
    private var phoneNumber = ""
    private var amount = ""
    private var pin = ""
    private var useCustomPin = false
    private var pinAttempts = 0
    private var isAutomationEnabled = false
    private var pendingPinInput = false
    
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onCreate() {
        super.onCreate()
        instance = this
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        loadSettings()
        Log.d(TAG, "USSD Accessibility Service created")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        instance = null
        serviceScope.cancel()
        Log.d(TAG, "USSD Accessibility Service destroyed")
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || !isAutomationEnabled) return
        
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                handleUssdDialog(event)
            }
        }
    }
    
    override fun onInterrupt() {
        Log.d(TAG, "Service interrupted")
        resetAutomation()
    }
    
    private fun loadSettings() {
        isAutomationEnabled = prefs.getBoolean(KEY_AUTOMATION_ENABLED, false)
        transactionType = prefs.getString(KEY_TRANSACTION_TYPE, "") ?: ""
        phoneNumber = prefs.getString(KEY_PHONE_NUMBER, "") ?: ""
        amount = prefs.getString(KEY_AMOUNT, "") ?: ""
        pin = prefs.getString(KEY_PIN, "1234") ?: "1234"
        useCustomPin = prefs.getBoolean(KEY_USE_CUSTOM_PIN, false)
        currentState = prefs.getInt(KEY_CURRENT_STEP, STATE_IDLE)
        pinAttempts = prefs.getInt(KEY_PIN_ATTEMPTS, 0)
        
        Log.d(TAG, "Settings loaded - Automation: $isAutomationEnabled, Type: $transactionType")
    }
    
    private fun saveSettings() {
        prefs.edit().apply {
            putBoolean(KEY_AUTOMATION_ENABLED, isAutomationEnabled)
            putString(KEY_TRANSACTION_TYPE, transactionType)
            putString(KEY_PHONE_NUMBER, phoneNumber)
            putString(KEY_AMOUNT, amount)
            putString(KEY_PIN, pin)
            putBoolean(KEY_USE_CUSTOM_PIN, useCustomPin)
            putInt(KEY_CURRENT_STEP, currentState)
            putInt(KEY_PIN_ATTEMPTS, pinAttempts)
            apply()
        }
    }
    
    private fun handleUssdDialog(event: AccessibilityEvent) {
        val rootNode = rootInActiveWindow ?: return
        
        try {
            val dialogText = extractDialogText(rootNode)
            Log.d(TAG, "USSD Dialog detected: $dialogText")
            
            if (dialogText.isNotEmpty()) {
                processUssdDialog(dialogText, rootNode)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling USSD dialog", e)
        } finally {
            rootNode.recycle()
        }
    }
    
    private fun extractDialogText(node: AccessibilityNodeInfo): String {
        val textBuilder = StringBuilder()
        
        fun traverseNode(currentNode: AccessibilityNodeInfo) {
            val text = currentNode.text?.toString()
            if (!text.isNullOrEmpty()) {
                textBuilder.append(text).append("\n")
            }
            
            for (i in 0 until currentNode.childCount) {
                currentNode.getChild(i)?.let { child ->
                    traverseNode(child)
                    child.recycle()
                }
            }
        }
        
        traverseNode(node)
        return textBuilder.toString().trim()
    }
    
    private fun processUssdDialog(dialogText: String, rootNode: AccessibilityNodeInfo) {
        when (currentState) {
            STATE_IDLE -> {
                if (isMainMenu(dialogText)) {
                    currentState = STATE_MAIN_MENU
                    handleMainMenu(dialogText, rootNode)
                }
            }
            STATE_MAIN_MENU -> handleMainMenu(dialogText, rootNode)
            STATE_SUB_MENU -> handleSubMenu(dialogText, rootNode)
            STATE_PHONE_INPUT -> handlePhoneInput(rootNode)
            STATE_PHONE_CONFIRM -> handlePhoneConfirm(rootNode)
            STATE_AMOUNT_INPUT -> handleAmountInput(rootNode)
            STATE_CONFIRMATION -> handleConfirmation(dialogText, rootNode)
            STATE_PIN_INPUT -> handlePinInput(dialogText, rootNode)
            STATE_PIN_PROMPT -> handlePinPrompt(rootNode)
            STATE_PROCESSING -> handleProcessing(dialogText)
        }
        
        saveSettings()
    }
    
    private fun isMainMenu(text: String): Boolean {
        val mainMenuIndicators = listOf(
            "Mobile Money", "MoMo", "Transfer Money", "Cash Out", 
            "Merchant Payment", "Airtime", "Financial Services"
        )
        return mainMenuIndicators.any { text.contains(it, ignoreCase = true) }
    }
    
    private fun handleMainMenu(dialogText: String, rootNode: AccessibilityNodeInfo) {
        val menuOption = when (transactionType) {
            "cash_in" -> findMenuOption(dialogText, listOf("Merchant Payment", "Transfer Money", "Send Money"))
            "cash_out" -> findMenuOption(dialogText, listOf("Cash Out", "Withdraw"))
            "airtime_transfer" -> findMenuOption(dialogText, listOf("Airtime", "Bundle"))
            "balance" -> findMenuOption(dialogText, listOf("Financial Services", "Balance", "Check Balance"))
            "commission" -> findMenuOption(dialogText, listOf("Financial Services", "Mini Statement"))
            else -> null
        }
        
        if (menuOption != null) {
            inputText(rootNode, menuOption)
            currentState = STATE_SUB_MENU
            showToast("Selected: $menuOption")
        }
    }
    
    private fun handleSubMenu(dialogText: String, rootNode: AccessibilityNodeInfo) {
        val menuOption = when (transactionType) {
            "cash_in" -> findMenuOption(dialogText, listOf("Send Money", "Buy Goods", "Pay Bill"))
            "cash_out" -> findMenuOption(dialogText, listOf("Withdraw from Agent", "ATM Withdrawal"))
            "airtime_transfer" -> findMenuOption(dialogText, listOf("Transfer Airtime", "Buy Airtime"))
            "balance" -> findMenuOption(dialogText, listOf("Check Balance", "Balance Inquiry"))
            "commission" -> findMenuOption(dialogText, listOf("Mini Statement", "Statement"))
            else -> null
        }
        
        if (menuOption != null) {
            inputText(rootNode, menuOption)
            currentState = if (transactionType == "balance" || transactionType == "commission") {
                STATE_PROCESSING
            } else {
                STATE_PHONE_INPUT
            }
            showToast("Selected: $menuOption")
        }
    }
    
    private fun handlePhoneInput(rootNode: AccessibilityNodeInfo) {
        if (phoneNumber.isNotEmpty()) {
            inputText(rootNode, phoneNumber)
            currentState = STATE_PHONE_CONFIRM
            showToast("Entered phone number")
        }
    }
    
    private fun handlePhoneConfirm(rootNode: AccessibilityNodeInfo) {
        inputText(rootNode, phoneNumber)
        currentState = STATE_AMOUNT_INPUT
        showToast("Confirmed phone number")
    }
    
    private fun handleAmountInput(rootNode: AccessibilityNodeInfo) {
        if (amount.isNotEmpty()) {
            inputText(rootNode, amount)
            currentState = STATE_CONFIRMATION
            showToast("Entered amount")
        }
    }
    
    private fun handleConfirmation(dialogText: String, rootNode: AccessibilityNodeInfo) {
        if (dialogText.contains("Confirm", ignoreCase = true) || 
            dialogText.contains("1", ignoreCase = true)) {
            inputText(rootNode, "1")
            currentState = STATE_PIN_INPUT
            showToast("Confirmed transaction")
        }
    }
    
    private fun handlePinInput(dialogText: String, rootNode: AccessibilityNodeInfo) {
        if (dialogText.contains("PIN", ignoreCase = true) || 
            dialogText.contains("password", ignoreCase = true)) {
            
            // Check if we should prompt for PIN
            if (useCustomPin && pin.isEmpty()) {
                currentState = STATE_PIN_PROMPT
                promptForPin()
                return
            }
            
            // Check if PIN is not default and we haven't prompted yet
            if (pin == "1234" && !useCustomPin && pinAttempts == 0) {
                currentState = STATE_PIN_PROMPT
                promptForPin()
                return
            }
            
            // Use the PIN we have
            if (pin.isNotEmpty()) {
                inputText(rootNode, pin)
                currentState = STATE_PROCESSING
                pinAttempts++
                showToast("PIN entered")
            }
        }
    }
    
    private fun handlePinPrompt(rootNode: AccessibilityNodeInfo) {
        // Wait for user to enter PIN through the prompt
        if (pendingPinInput && pin.isNotEmpty()) {
            inputText(rootNode, pin)
            currentState = STATE_PROCESSING
            pendingPinInput = false
            showToast("Custom PIN entered")
        }
    }
    
    private fun handleProcessing(dialogText: String) {
        if (dialogText.contains("successful", ignoreCase = true) ||
            dialogText.contains("completed", ignoreCase = true) ||
            dialogText.contains("failed", ignoreCase = true) ||
            dialogText.contains("error", ignoreCase = true)) {
            
            currentState = STATE_COMPLETED
            showToast("Transaction completed")
            
            // Reset after a delay
            serviceScope.launch {
                delay(3000)
                resetAutomation()
            }
        }
    }
    
    private fun promptForPin() {
        pendingPinInput = true
        
        // Create a notification or use the web interface to prompt for PIN
        serviceScope.launch {
            try {
                // Send message to web interface to show PIN prompt
                showToast("Please enter your PIN in the app")
                
                // You can also create a system notification here
                // or use an overlay dialog if needed
                
            } catch (e: Exception) {
                Log.e(TAG, "Error prompting for PIN", e)
                // Fallback to default PIN
                pin = "1234"
                pendingPinInput = false
                currentState = STATE_PIN_INPUT
            }
        }
    }
    
    private fun findMenuOption(text: String, options: List<String>): String? {
        val lines = text.split("\n")
        
        for (line in lines) {
            for (option in options) {
                if (line.contains(option, ignoreCase = true)) {
                    // Extract the number before the option
                    val regex = """(\d+)\.?\s*${Regex.escape(option)}""".toRegex(RegexOption.IGNORE_CASE)
                    val match = regex.find(line)
                    return match?.groupValues?.get(1)
                }
            }
        }
        
        return null
    }
    
    private fun inputText(rootNode: AccessibilityNodeInfo, text: String) {
        val editText = findEditText(rootNode)
        if (editText != null) {
            val arguments = android.os.Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            }
            editText.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
            editText.recycle()
            
            // Also try to click Send/OK button
            serviceScope.launch {
                delay(500)
                clickSendButton(rootNode)
            }
        }
    }
    
    private fun findEditText(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.className == "android.widget.EditText") {
            return node
        }
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val result = findEditText(child)
                if (result != null) {
                    child.recycle()
                    return result
                }
                child.recycle()
            }
        }
        
        return null
    }
    
    private fun clickSendButton(rootNode: AccessibilityNodeInfo) {
        val sendButton = findSendButton(rootNode)
        if (sendButton != null) {
            sendButton.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            sendButton.recycle()
        }
    }
    
    private fun findSendButton(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val buttonTexts = listOf("Send", "OK", "Submit", "Continue", "Next")
        
        fun searchNode(currentNode: AccessibilityNodeInfo): AccessibilityNodeInfo? {
            val text = currentNode.text?.toString()
            if (currentNode.isClickable && text != null && 
                buttonTexts.any { text.contains(it, ignoreCase = true) }) {
                return currentNode
            }
            
            for (i in 0 until currentNode.childCount) {
                val child = currentNode.getChild(i)
                if (child != null) {
                    val result = searchNode(child)
                    if (result != null) {
                        child.recycle()
                        return result
                    }
                    child.recycle()
                }
            }
            
            return null
        }
        
        return searchNode(node)
    }
    
    private fun showToast(message: String) {
        serviceScope.launch {
            Toast.makeText(this@UssdAccessibilityService, message, Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun resetAutomation() {
        currentState = STATE_IDLE
        pinAttempts = 0
        pendingPinInput = false
        saveSettings()
        Log.d(TAG, "Automation reset")
    }
    
    // Public methods for external control
    fun setupTransaction(type: String, phone: String, amt: String, userPin: String, customPin: Boolean = false) {
        transactionType = type
        phoneNumber = phone
        amount = amt
        pin = userPin
        useCustomPin = customPin
        currentState = STATE_IDLE
        pinAttempts = 0
        pendingPinInput = false
        saveSettings()
        Log.d(TAG, "Transaction setup: $type, $phone, $amt, PIN: ${if (userPin.isNotEmpty()) "***" else "empty"}")
    }
    
    fun enableAutomation() {
        isAutomationEnabled = true
        saveSettings()
        Log.d(TAG, "Automation enabled")
    }
    
    fun disableAutomation() {
        isAutomationEnabled = false
        resetAutomation()
        saveSettings()
        Log.d(TAG, "Automation disabled")
    }
    
    fun isAutomationEnabled(): Boolean = isAutomationEnabled
    
    fun getCurrentState(): Int = currentState
    
    fun isPinPromptActive(): Boolean = currentState == STATE_PIN_PROMPT && pendingPinInput
    
    fun submitPin(userPin: String) {
        if (pendingPinInput) {
            pin = userPin
            useCustomPin = true
            saveSettings()
            Log.d(TAG, "PIN submitted by user")
        }
    }
}