package com.kbanquer2.app

import android.os.Bundle
import android.webkit.WebView
import com.getcapacitor.BridgeActivity
import com.kbanquer2.app.ussd.UssdBridge

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable WebView debugging in development
        WebView.setWebContentsDebuggingEnabled(true)
        
        // Add USSD Bridge to WebView
        val webView = bridge.webView
        webView.addJavascriptInterface(UssdBridge(this), "UssdBridge")
    }
}