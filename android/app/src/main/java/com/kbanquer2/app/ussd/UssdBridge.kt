package com.kbanquer2.app.ussd

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONObject

class UssdBridge(private val context: Context) {
    
    companion object {
        private const val TAG = "UssdBridge"
    }
    
    private val helper = UssdAutomationHelper(context)
    
    @JavascriptInterface
    fun isAccessibilityServiceEnabled(): Boolean {
        return helper.isAccessibilityServiceEnabled()
    }
    
    @JavascriptInterface
    fun openAccessibilitySettings() {
        helper.openAccessibilitySettings()
    }
    
    @JavascriptInterface
    fun setupTransaction(type: String, phone: String, amount: String, pin: String): Boolean {
        return try {
            val useCustomPin = pin != "1234" && pin.isNotEmpty()
            helper.setupTransaction(type, phone, amount, pin, useCustomPin)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up transaction", e)
            false
        }
    }
    
    @JavascriptInterface
    fun dialUssdWithAutomation(ussd: String, type: String, phone: String, amount: String, pin: String): Boolean {
        return try {
            val useCustomPin = pin != "1234" && pin.isNotEmpty()
            helper.dialUssdWithAutomation(ussd, type, phone, amount, pin, useCustomPin)
        } catch (e: Exception) {
            Log.e(TAG, "Error dialing USSD with automation", e)
            false
        }
    }
    
    @JavascriptInterface
    fun enableAutomation() {
        helper.enableAutomation()
    }
    
    @JavascriptInterface
    fun disableAutomation() {
        helper.disableAutomation()
    }
    
    @JavascriptInterface
    fun isAutomationEnabled(): Boolean {
        return helper.isAutomationEnabled()
    }
    
    @JavascriptInterface
    fun resetAutomation() {
        helper.resetAutomation()
    }
    
    @JavascriptInterface
    fun getAutomationStatus(): String {
        return try {
            val service = UssdAccessibilityService.instance
            val status = JSONObject().apply {
                put("serviceEnabled", helper.isAccessibilityServiceEnabled())
                put("automationEnabled", helper.isAutomationEnabled())
                put("currentState", service?.getCurrentState() ?: 0)
                put("pinPromptActive", service?.isPinPromptActive() ?: false)
            }
            status.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting automation status", e)
            "{\"error\": \"${e.message}\"}"
        }
    }
    
    @JavascriptInterface
    fun isPinPromptActive(): Boolean {
        return UssdAccessibilityService.instance?.isPinPromptActive() ?: false
    }
    
    @JavascriptInterface
    fun submitPin(pin: String): Boolean {
        return try {
            UssdAccessibilityService.instance?.submitPin(pin)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error submitting PIN", e)
            false
        }
    }
    
    @JavascriptInterface
    fun log(message: String) {
        Log.d(TAG, "WebView: $message")
    }
}