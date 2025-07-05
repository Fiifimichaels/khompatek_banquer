package com.khompatek.ussd

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.provider.Settings
import android.text.TextUtils
import android.util.Log

class UssdAutomationHelper(private val context: Context) {

    companion object {
        private const val TAG = "UssdAutomationHelper"
    }

    private val sharedPrefs: SharedPreferences = 
        context.getSharedPreferences(UssdAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * Check if accessibility service is enabled
     */
    fun isAccessibilityServiceEnabled(): Boolean {
        val accessibilityEnabled = Settings.Secure.getInt(
            context.contentResolver,
            Settings.Secure.ACCESSIBILITY_ENABLED,
            0
        )

        if (accessibilityEnabled == 1) {
            val services = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )

            val serviceName = "${context.packageName}/${UssdAccessibilityService::class.java.name}"
            return services?.contains(serviceName) == true
        }

        return false
    }

    /**
     * Open accessibility settings
     */
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(intent)
    }

    /**
     * Setup automation for a transaction
     */
    fun setupTransaction(
        transactionType: String,
        phoneNumber: String,
        amount: String,
        pin: String
    ): Boolean {
        if (!isAccessibilityServiceEnabled()) {
            Log.w(TAG, "Accessibility service not enabled")
            return false
        }

        sharedPrefs.edit().apply {
            putString(UssdAccessibilityService.KEY_TRANSACTION_TYPE, transactionType)
            putString(UssdAccessibilityService.KEY_PHONE_NUMBER, phoneNumber)
            putString(UssdAccessibilityService.KEY_AMOUNT, amount)
            putString(UssdAccessibilityService.KEY_PIN, pin)
            putInt(UssdAccessibilityService.KEY_CURRENT_STEP, 0)
            putBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, true)
            apply()
        }

        Log.d(TAG, "Transaction setup completed for type: $transactionType")
        return true
    }

    /**
     * Start USSD dial with automation
     */
    fun dialUssdWithAutomation(
        ussdCode: String,
        transactionType: String,
        phoneNumber: String,
        amount: String,
        pin: String
    ): Boolean {
        // Setup the transaction first
        if (!setupTransaction(transactionType, phoneNumber, amount, pin)) {
            return false
        }

        // Dial the USSD code
        try {
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:${Uri.encode(ussdCode)}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            
            Log.d(TAG, "USSD dial initiated: $ussdCode")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to dial USSD code", e)
            return false
        }
    }

    /**
     * Enable automation
     */
    fun enableAutomation() {
        sharedPrefs.edit().putBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, true).apply()
    }

    /**
     * Disable automation
     */
    fun disableAutomation() {
        sharedPrefs.edit().putBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, false).apply()
    }

    /**
     * Check if automation is enabled
     */
    fun isAutomationEnabled(): Boolean {
        return sharedPrefs.getBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, false)
    }

    /**
     * Reset automation state
     */
    fun resetAutomation() {
        sharedPrefs.edit().apply {
            putInt(UssdAccessibilityService.KEY_CURRENT_STEP, 0)
            putBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, false)
            apply()
        }
    }

    /**
     * Get current automation status
     */
    fun getAutomationStatus(): Map<String, Any> {
        return mapOf(
            "enabled" to isAutomationEnabled(),
            "serviceEnabled" to isAccessibilityServiceEnabled(),
            "currentStep" to sharedPrefs.getInt(UssdAccessibilityService.KEY_CURRENT_STEP, 0),
            "transactionType" to (sharedPrefs.getString(UssdAccessibilityService.KEY_TRANSACTION_TYPE, "") ?: ""),
            "phoneNumber" to (sharedPrefs.getString(UssdAccessibilityService.KEY_PHONE_NUMBER, "") ?: ""),
            "amount" to (sharedPrefs.getString(UssdAccessibilityService.KEY_AMOUNT, "") ?: "")
        )
    }
}