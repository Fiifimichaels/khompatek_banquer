package com.khompatek.ussd

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import java.util.regex.Pattern

class UssdAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "UssdAccessibilityService"
        private const val PREFS_NAME = "ussd_automation_prefs"
        
        // SharedPreferences keys
        const val KEY_AUTOMATION_ENABLED = "automation_enabled"
        const val KEY_TARGET_OPTION = "target_option"
        const val KEY_PHONE_NUMBER = "phone_number"
        const val KEY_AMOUNT = "amount"
        const val KEY_PIN = "pin"
        const val KEY_TRANSACTION_TYPE = "transaction_type"
        const val KEY_CURRENT_STEP = "current_step"
        
        // Transaction types
        const val TRANSACTION_CASH_IN = "cash_in"
        const val TRANSACTION_CASH_OUT = "cash_out"
        const val TRANSACTION_AIRTIME = "airtime"
        const val TRANSACTION_BALANCE = "balance"
        
        // USSD dialog detection patterns
        private val USSD_DIALOG_PATTERNS = arrayOf(
            "USSD",
            "Mobile Money",
            "MTN",
            "Vodafone",
            "AirtelTigo",
            "*171#",
            "*110#",
            "*133#"
        )
        
        // Common USSD menu patterns
        private val MENU_PATTERNS = mapOf(
            "send_money" to arrayOf("1.*Send Money", "1.*Transfer Money", "1.*Send"),
            "withdraw" to arrayOf("2.*Withdraw", "2.*Cash Out", "2.*Get Cash"),
            "airtime" to arrayOf("3.*Airtime", "4.*Airtime", ".*Buy Airtime"),
            "balance" to arrayOf("5.*Balance", "1.*Check Balance", ".*Balance"),
            "merchant" to arrayOf("3.*Merchant", ".*Pay Merchant", ".*Buy Goods"),
            "confirm" to arrayOf("1.*Confirm", "1.*Yes", ".*Confirm"),
            "cancel" to arrayOf("2.*Cancel", "0.*Cancel", ".*Cancel")
        )
        
        // Button text patterns
        private val BUTTON_PATTERNS = arrayOf(
            "Send", "OK", "Submit", "Continue", "Next", "Confirm"
        )
    }

    private lateinit var sharedPrefs: SharedPreferences
    private val handler = Handler(Looper.getMainLooper())
    private var isProcessingUssd = false
    private var currentStep = 0
    private var lastDialogText = ""

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "USSD Accessibility Service connected")
        
        sharedPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        // Configure service info
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                        AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                        AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED
            
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                   AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            
            notificationTimeout = 100
        }
        
        serviceInfo = info
        showToast("USSD Automation Service Started")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event?.let { handleAccessibilityEvent(it) }
    }

    override fun onInterrupt() {
        Log.d(TAG, "USSD Accessibility Service interrupted")
        isProcessingUssd = false
    }

    private fun handleAccessibilityEvent(event: AccessibilityEvent) {
        if (!isAutomationEnabled()) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChanged(event)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED,
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> {
                if (isProcessingUssd) {
                    handleContentChanged(event)
                }
            }
        }
    }

    private fun handleWindowStateChanged(event: AccessibilityEvent) {
        val rootNode = rootInActiveWindow ?: return
        
        // Check if this is a USSD dialog
        if (isUssdDialog(rootNode, event)) {
            Log.d(TAG, "USSD dialog detected")
            isProcessingUssd = true
            currentStep = sharedPrefs.getInt(KEY_CURRENT_STEP, 0)
            
            // Delay processing to ensure dialog is fully loaded
            handler.postDelayed({
                processUssdDialog(rootNode)
            }, 500)
        }
    }

    private fun handleContentChanged(event: AccessibilityEvent) {
        if (!isProcessingUssd) return
        
        val rootNode = rootInActiveWindow ?: return
        
        // Process content changes in USSD dialogs
        handler.postDelayed({
            processUssdDialog(rootNode)
        }, 300)
    }

    private fun isUssdDialog(rootNode: AccessibilityNodeInfo, event: AccessibilityEvent): Boolean {
        val className = event.className?.toString() ?: ""
        val packageName = event.packageName?.toString() ?: ""
        
        // Check for common USSD dialog characteristics
        if (className.contains("AlertDialog") || 
            packageName.contains("phone") || 
            packageName.contains("dialer") ||
            packageName.contains("telecom")) {
            
            val dialogText = extractAllText(rootNode).lowercase()
            
            return USSD_DIALOG_PATTERNS.any { pattern ->
                dialogText.contains(pattern.lowercase())
            }
        }
        
        return false
    }

    private fun processUssdDialog(rootNode: AccessibilityNodeInfo) {
        try {
            val dialogText = extractAllText(rootNode)
            
            // Avoid processing the same dialog multiple times
            if (dialogText == lastDialogText) return
            lastDialogText = dialogText
            
            Log.d(TAG, "Processing USSD dialog: $dialogText")
            
            val transactionType = sharedPrefs.getString(KEY_TRANSACTION_TYPE, "") ?: ""
            
            when (currentStep) {
                0 -> handleMainMenu(rootNode, dialogText, transactionType)
                1 -> handleSubMenu(rootNode, dialogText, transactionType)
                2 -> handlePhoneNumberInput(rootNode, dialogText)
                3 -> handlePhoneNumberConfirmation(rootNode, dialogText)
                4 -> handleAmountInput(rootNode, dialogText)
                5 -> handleConfirmation(rootNode, dialogText)
                6 -> handlePinInput(rootNode, dialogText)
                else -> handleGenericResponse(rootNode, dialogText)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing USSD dialog", e)
            isProcessingUssd = false
        }
    }

    private fun handleMainMenu(rootNode: AccessibilityNodeInfo, dialogText: String, transactionType: String) {
        val option = when (transactionType) {
            TRANSACTION_CASH_IN -> findMenuOption(dialogText, "send_money") ?: "3" // Merchant payment
            TRANSACTION_CASH_OUT -> findMenuOption(dialogText, "withdraw") ?: "2"
            TRANSACTION_AIRTIME -> findMenuOption(dialogText, "airtime") ?: "4"
            TRANSACTION_BALANCE -> findMenuOption(dialogText, "balance") ?: "5"
            else -> "1"
        }
        
        if (inputTextAndSend(rootNode, option)) {
            incrementStep()
        }
    }

    private fun handleSubMenu(rootNode: AccessibilityNodeInfo, dialogText: String, transactionType: String) {
        val option = when (transactionType) {
            TRANSACTION_CASH_IN -> "3" // Send Money option
            TRANSACTION_CASH_OUT -> "1" // Withdraw from Agent
            TRANSACTION_AIRTIME -> "3" // Transfer Airtime
            else -> "1"
        }
        
        if (inputTextAndSend(rootNode, option)) {
            incrementStep()
        }
    }

    private fun handlePhoneNumberInput(rootNode: AccessibilityNodeInfo, dialogText: String) {
        val phoneNumber = sharedPrefs.getString(KEY_PHONE_NUMBER, "") ?: ""
        
        if (phoneNumber.isNotEmpty() && inputTextAndSend(rootNode, phoneNumber)) {
            incrementStep()
        }
    }

    private fun handlePhoneNumberConfirmation(rootNode: AccessibilityNodeInfo, dialogText: String) {
        val phoneNumber = sharedPrefs.getString(KEY_PHONE_NUMBER, "") ?: ""
        
        if (phoneNumber.isNotEmpty() && inputTextAndSend(rootNode, phoneNumber)) {
            incrementStep()
        }
    }

    private fun handleAmountInput(rootNode: AccessibilityNodeInfo, dialogText: String) {
        val amount = sharedPrefs.getString(KEY_AMOUNT, "") ?: ""
        
        if (amount.isNotEmpty() && inputTextAndSend(rootNode, amount)) {
            incrementStep()
        }
    }

    private fun handleConfirmation(rootNode: AccessibilityNodeInfo, dialogText: String) {
        val confirmOption = findMenuOption(dialogText, "confirm") ?: "1"
        
        if (inputTextAndSend(rootNode, confirmOption)) {
            incrementStep()
        }
    }

    private fun handlePinInput(rootNode: AccessibilityNodeInfo, dialogText: String) {
        val pin = sharedPrefs.getString(KEY_PIN, "") ?: ""
        
        if (pin.isNotEmpty() && inputTextAndSend(rootNode, pin)) {
            incrementStep()
            // Transaction complete
            completeTransaction()
        }
    }

    private fun handleGenericResponse(rootNode: AccessibilityNodeInfo, dialogText: String) {
        // Handle any remaining steps or completion messages
        if (dialogText.contains("successful", ignoreCase = true) ||
            dialogText.contains("completed", ignoreCase = true)) {
            completeTransaction()
        }
    }

    private fun findMenuOption(dialogText: String, optionType: String): String? {
        val patterns = MENU_PATTERNS[optionType] ?: return null
        
        for (pattern in patterns) {
            val regex = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE)
            val matcher = regex.matcher(dialogText)
            
            if (matcher.find()) {
                // Extract the number from the matched text
                val numberRegex = Pattern.compile("(\\d+)")
                val numberMatcher = numberRegex.matcher(matcher.group())
                
                if (numberMatcher.find()) {
                    return numberMatcher.group(1)
                }
            }
        }
        
        return null
    }

    private fun inputTextAndSend(rootNode: AccessibilityNodeInfo, text: String): Boolean {
        try {
            // Find EditText field
            val editText = findEditText(rootNode)
            if (editText != null) {
                // Clear existing text and input new text
                editText.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
                editText.performAction(AccessibilityNodeInfo.ACTION_SELECT_ALL)
                
                val arguments = android.os.Bundle().apply {
                    putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
                }
                editText.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
                
                Log.d(TAG, "Input text: $text")
                
                // Find and click send button
                handler.postDelayed({
                    val sendButton = findSendButton(rootNode)
                    if (sendButton != null && sendButton.isClickable) {
                        sendButton.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                        Log.d(TAG, "Clicked send button")
                    }
                }, 200)
                
                return true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error inputting text and sending", e)
        }
        
        return false
    }

    private fun findEditText(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.className?.toString()?.contains("EditText") == true && node.isEditable) {
            return node
        }
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val result = findEditText(child)
            if (result != null) {
                child.recycle()
                return result
            }
            child.recycle()
        }
        
        return null
    }

    private fun findSendButton(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val nodeText = node.text?.toString()?.lowercase() ?: ""
        val nodeContentDesc = node.contentDescription?.toString()?.lowercase() ?: ""
        
        if (node.isClickable && 
            (BUTTON_PATTERNS.any { pattern -> 
                nodeText.contains(pattern.lowercase()) || 
                nodeContentDesc.contains(pattern.lowercase()) 
            })) {
            return node
        }
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val result = findSendButton(child)
            if (result != null) {
                child.recycle()
                return result
            }
            child.recycle()
        }
        
        return null
    }

    private fun extractAllText(node: AccessibilityNodeInfo): String {
        val textBuilder = StringBuilder()
        extractTextRecursive(node, textBuilder)
        return textBuilder.toString()
    }

    private fun extractTextRecursive(node: AccessibilityNodeInfo, textBuilder: StringBuilder) {
        val nodeText = node.text?.toString()
        if (!nodeText.isNullOrEmpty()) {
            textBuilder.append(nodeText).append(" ")
        }
        
        val contentDesc = node.contentDescription?.toString()
        if (!contentDesc.isNullOrEmpty()) {
            textBuilder.append(contentDesc).append(" ")
        }
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            extractTextRecursive(child, textBuilder)
            child.recycle()
        }
    }

    private fun incrementStep() {
        currentStep++
        sharedPrefs.edit().putInt(KEY_CURRENT_STEP, currentStep).apply()
        Log.d(TAG, "Advanced to step: $currentStep")
    }

    private fun completeTransaction() {
        Log.d(TAG, "Transaction completed")
        isProcessingUssd = false
        currentStep = 0
        lastDialogText = ""
        
        // Reset step counter
        sharedPrefs.edit().putInt(KEY_CURRENT_STEP, 0).apply()
        
        showToast("USSD Transaction Completed")
    }

    private fun isAutomationEnabled(): Boolean {
        return sharedPrefs.getBoolean(KEY_AUTOMATION_ENABLED, false)
    }

    private fun showToast(message: String) {
        handler.post {
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        }
    }

    // Public methods for external control
    fun setAutomationParameters(
        transactionType: String,
        phoneNumber: String,
        amount: String,
        pin: String
    ) {
        sharedPrefs.edit().apply {
            putString(KEY_TRANSACTION_TYPE, transactionType)
            putString(KEY_PHONE_NUMBER, phoneNumber)
            putString(KEY_AMOUNT, amount)
            putString(KEY_PIN, pin)
            putInt(KEY_CURRENT_STEP, 0)
            putBoolean(KEY_AUTOMATION_ENABLED, true)
            apply()
        }
        
        Log.d(TAG, "Automation parameters set for transaction: $transactionType")
    }

    fun enableAutomation() {
        sharedPrefs.edit().putBoolean(KEY_AUTOMATION_ENABLED, true).apply()
        Log.d(TAG, "USSD automation enabled")
    }

    fun disableAutomation() {
        sharedPrefs.edit().putBoolean(KEY_AUTOMATION_ENABLED, false).apply()
        isProcessingUssd = false
        currentStep = 0
        Log.d(TAG, "USSD automation disabled")
    }
}