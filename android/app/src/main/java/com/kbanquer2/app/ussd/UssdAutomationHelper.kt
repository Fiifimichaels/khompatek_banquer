package com.kbanquer2.app.ussd

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import android.widget.Toast

class UssdAutomationHelper(private val context: Context) {
    
    companion object {
        private const val TAG = "UssdAutomationHelper"
        private const val PREFS_NAME = "ussd_automation_prefs"
        private const val KEY_AUTOMATION_ENABLED = "automation_enabled"
    }
    
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    fun isAccessibilityServiceEnabled(): Boolean {
        val accessibilityEnabled = try {
            Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.ACCESSIBILITY_ENABLED
            )
        } catch (e: Settings.SettingNotFoundException) {
            0
        }
        
        if (accessibilityEnabled == 1) {
            val services = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            
            if (!services.isNullOrEmpty()) {
                val colonSplitter = TextUtils.SimpleStringSplitter(':')
                colonSplitter.setString(services)
                
                while (colonSplitter.hasNext()) {
                    val service = colonSplitter.next()
                    if (service.contains("UssdAccessibilityService")) {
                        return true
                    }
                }
            }
        }
        
        return false
    }
    
    fun openAccessibilitySettings() {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error opening accessibility settings", e)
            Toast.makeText(context, "Could not open accessibility settings", Toast.LENGTH_SHORT).show()
        }
    }
    
    fun setupTransaction(type: String, phone: String, amount: String, pin: String, useCustomPin: Boolean = false): Boolean {
        return try {
            val service = UssdAccessibilityService.instance
            if (service != null) {
                service.setupTransaction(type, phone, amount, pin, useCustomPin)
                Log.d(TAG, "Transaction setup successful")
                true
            } else {
                Log.w(TAG, "Accessibility service not available")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up transaction", e)
            false
        }
    }
    
    fun dialUssdWithAutomation(ussd: String, type: String, phone: String, amount: String, pin: String, useCustomPin: Boolean = false): Boolean {
        return try {
            if (!isAccessibilityServiceEnabled()) {
                Toast.makeText(context, "Please enable accessibility service first", Toast.LENGTH_LONG).show()
                openAccessibilitySettings()
                return false
            }
            
            // Setup transaction parameters
            setupTransaction(type, phone, amount, pin, useCustomPin)
            
            // Enable automation
            enableAutomation()
            
            // Dial USSD
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:${Uri.encode(ussd)}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            
            context.startActivity(intent)
            
            Toast.makeText(context, "USSD automation started", Toast.LENGTH_SHORT).show()
            Log.d(TAG, "USSD dialed with automation: $ussd")
            true
            
        } catch (e: Exception) {
            Log.e(TAG, "Error dialing USSD with automation", e)
            Toast.makeText(context, "Failed to dial USSD: ${e.message}", Toast.LENGTH_SHORT).show()
            false
        }
    }
    
    fun enableAutomation() {
        prefs.edit().putBoolean(KEY_AUTOMATION_ENABLED, true).apply()
        UssdAccessibilityService.instance?.enableAutomation()
        Log.d(TAG, "Automation enabled")
    }
    
    fun disableAutomation() {
        prefs.edit().putBoolean(KEY_AUTOMATION_ENABLED, false).apply()
        UssdAccessibilityService.instance?.disableAutomation()
        Log.d(TAG, "Automation disabled")
    }
    
    fun isAutomationEnabled(): Boolean {
        return prefs.getBoolean(KEY_AUTOMATION_ENABLED, false)
    }
    
    fun resetAutomation() {
        UssdAccessibilityService.instance?.let { service ->
            service.setupTransaction("", "", "", "", false)
            service.disableAutomation()
        }
        Log.d(TAG, "Automation reset")
    }
    
    fun getServiceStatus(): Map<String, Any> {
        val service = UssdAccessibilityService.instance
        return mapOf(
            "serviceEnabled" to isAccessibilityServiceEnabled(),
            "automationEnabled" to isAutomationEnabled(),
            "serviceInstance" to (service != null),
            "currentState" to (service?.getCurrentState() ?: 0),
            "pinPromptActive" to (service?.isPinPromptActive() ?: false)
        )
    }
}