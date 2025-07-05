package com.khompatek.ussd

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.provider.Settings
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.khompatek.R

class AccessibilitySettingsActivity : AppCompatActivity() {

    private lateinit var sharedPrefs: SharedPreferences
    private lateinit var enableSwitch: Switch
    private lateinit var phoneNumberEdit: EditText
    private lateinit var amountEdit: EditText
    private lateinit var pinEdit: EditText
    private lateinit var transactionTypeSpinner: Spinner
    private lateinit var testButton: Button
    private lateinit var openSettingsButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_accessibility_settings)

        sharedPrefs = getSharedPreferences(UssdAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        
        initializeViews()
        setupListeners()
        loadSavedSettings()
    }

    private fun initializeViews() {
        enableSwitch = findViewById(R.id.enableSwitch)
        phoneNumberEdit = findViewById(R.id.phoneNumberEdit)
        amountEdit = findViewById(R.id.amountEdit)
        pinEdit = findViewById(R.id.pinEdit)
        transactionTypeSpinner = findViewById(R.id.transactionTypeSpinner)
        testButton = findViewById(R.id.testButton)
        openSettingsButton = findViewById(R.id.openSettingsButton)

        // Setup spinner
        val transactionTypes = arrayOf(
            "Cash In",
            "Cash Out", 
            "Airtime Transfer",
            "Balance Check"
        )
        
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, transactionTypes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        transactionTypeSpinner.adapter = adapter
    }

    private fun setupListeners() {
        enableSwitch.setOnCheckedChangeListener { _, isChecked ->
            sharedPrefs.edit().putBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, isChecked).apply()
            updateUIState(isChecked)
        }

        testButton.setOnClickListener {
            saveCurrentSettings()
            Toast.makeText(this, "Settings saved. Ready for USSD automation.", Toast.LENGTH_SHORT).show()
        }

        openSettingsButton.setOnClickListener {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            startActivity(intent)
        }
    }

    private fun loadSavedSettings() {
        val isEnabled = sharedPrefs.getBoolean(UssdAccessibilityService.KEY_AUTOMATION_ENABLED, false)
        enableSwitch.isChecked = isEnabled
        
        phoneNumberEdit.setText(sharedPrefs.getString(UssdAccessibilityService.KEY_PHONE_NUMBER, ""))
        amountEdit.setText(sharedPrefs.getString(UssdAccessibilityService.KEY_AMOUNT, ""))
        pinEdit.setText(sharedPrefs.getString(UssdAccessibilityService.KEY_PIN, ""))
        
        val transactionType = sharedPrefs.getString(UssdAccessibilityService.KEY_TRANSACTION_TYPE, "")
        val position = when (transactionType) {
            UssdAccessibilityService.TRANSACTION_CASH_IN -> 0
            UssdAccessibilityService.TRANSACTION_CASH_OUT -> 1
            UssdAccessibilityService.TRANSACTION_AIRTIME -> 2
            UssdAccessibilityService.TRANSACTION_BALANCE -> 3
            else -> 0
        }
        transactionTypeSpinner.setSelection(position)
        
        updateUIState(isEnabled)
    }

    private fun saveCurrentSettings() {
        val transactionType = when (transactionTypeSpinner.selectedItemPosition) {
            0 -> UssdAccessibilityService.TRANSACTION_CASH_IN
            1 -> UssdAccessibilityService.TRANSACTION_CASH_OUT
            2 -> UssdAccessibilityService.TRANSACTION_AIRTIME
            3 -> UssdAccessibilityService.TRANSACTION_BALANCE
            else -> UssdAccessibilityService.TRANSACTION_CASH_IN
        }

        sharedPrefs.edit().apply {
            putString(UssdAccessibilityService.KEY_PHONE_NUMBER, phoneNumberEdit.text.toString())
            putString(UssdAccessibilityService.KEY_AMOUNT, amountEdit.text.toString())
            putString(UssdAccessibilityService.KEY_PIN, pinEdit.text.toString())
            putString(UssdAccessibilityService.KEY_TRANSACTION_TYPE, transactionType)
            putInt(UssdAccessibilityService.KEY_CURRENT_STEP, 0)
            apply()
        }
    }

    private fun updateUIState(enabled: Boolean) {
        phoneNumberEdit.isEnabled = enabled
        amountEdit.isEnabled = enabled
        pinEdit.isEnabled = enabled
        transactionTypeSpinner.isEnabled = enabled
        testButton.isEnabled = enabled
    }
}