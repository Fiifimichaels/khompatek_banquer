package com.khompatek.ussd

import android.content.Context
import android.webkit.JavascriptInterface
import android.util.Log
import org.json.JSONObject

/**
 * JavaScript bridge for USSD automation integration with WebView
 */
class UssdBridge(private val context: Context) {

    companion object {
        private const val TAG = "UssdBridge"
    }

    private val automationHelper = UssdAutomationHelper(context)

    @JavascriptInterface
    fun isAccessibilityServiceEnabled(): Boolean {
        val enabled = automationHelper.isAccessibilityServiceEnabled()
        Log.d(TAG, "Accessibility service enabled: $enabled")
        return enabled
    }

    @JavascriptInterface
    fun openAccessibilitySettings() {
        Log.d(TAG, "Opening accessibility settings")
        automationHelper.openAccessibilitySettings()
    }

    @JavascriptInterface
    fun setupTransaction(
        transactionType: String,
        phoneNumber: String,
        amount: String,
        pin: String
    ): Boolean {
        Log.d(TAG, "Setting up transaction: $transactionType")
        return automationHelper.setupTransaction(transactionType, phoneNumber, amount, pin)
    }

    @JavascriptInterface
    fun dialUssdWithAutomation(
        ussdCode: String,
        transactionType: String,
        phoneNumber: String,
        amount: String,
        pin: String
    ): Boolean {
        Log.d(TAG, "Dialing USSD with automation: $ussdCode")
        return automationHelper.dialUssdWithAutomation(
            ussdCode, transactionType, phoneNumber, amount, pin
        )
    }

    @JavascriptInterface
    fun enableAutomation() {
        Log.d(TAG, "Enabling automation")
        automationHelper.enableAutomation()
    }

    @JavascriptInterface
    fun disableAutomation() {
        Log.d(TAG, "Disabling automation")
        automationHelper.disableAutomation()
    }

    @JavascriptInterface
    fun isAutomationEnabled(): Boolean {
        val enabled = automationHelper.isAutomationEnabled()
        Log.d(TAG, "Automation enabled: $enabled")
        return enabled
    }

    @JavascriptInterface
    fun resetAutomation() {
        Log.d(TAG, "Resetting automation")
        automationHelper.resetAutomation()
    }

    @JavascriptInterface
    fun getAutomationStatus(): String {
        val status = automationHelper.getAutomationStatus()
        val json = JSONObject(status)
        Log.d(TAG, "Automation status: $json")
        return json.toString()
    }

    @JavascriptInterface
    fun log(message: String) {
        Log.d(TAG, "WebView: $message")
    }
}