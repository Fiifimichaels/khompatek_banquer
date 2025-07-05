# USSD Accessibility Service Implementation

This implementation provides a comprehensive Android AccessibilityService for automating USSD interactions in the Khompatek mobile money application.

## Features

### Core Functionality
- **Automatic USSD Dialog Detection**: Detects USSD popups from various dialer applications
- **Menu Navigation**: Automatically selects appropriate menu options based on transaction type
- **Text Input Automation**: Inputs phone numbers, amounts, and PINs automatically
- **Multi-Step Transaction Flow**: Handles complete transaction flows from start to finish
- **Error Handling**: Robust error handling and recovery mechanisms

### Supported Transaction Types
- **Cash In**: Automated merchant payment flows
- **Cash Out**: Automated withdrawal from agent flows  
- **Airtime Transfer**: Automated airtime purchase and transfer
- **Balance Check**: Automated balance inquiry
- **Commission Check**: Automated commission inquiry

### Device Compatibility
- **Android 7.0+ (API 24+)**: Targets modern Android versions
- **Multi-Dialer Support**: Works with various dialer applications
- **Dual SIM Support**: Handles dual SIM scenarios
- **Multiple Networks**: Supports MTN, Vodafone, AirtelTigo

## Implementation Details

### Core Components

#### 1. UssdAccessibilityService.kt
The main accessibility service that:
- Listens for USSD dialog events
- Processes dialog content and extracts menu options
- Automatically inputs responses based on transaction type
- Manages transaction state and flow progression

#### 2. AccessibilitySettingsActivity.kt
Configuration interface that allows users to:
- Enable/disable the accessibility service
- Configure transaction parameters
- Test automation settings
- Access Android accessibility settings

#### 3. UssdAutomationHelper.kt
Utility class providing:
- Service status checking
- Transaction setup methods
- USSD dialing with automation
- State management functions

#### 4. UssdBridge.kt
JavaScript bridge for WebView integration:
- Exposes automation functions to web interface
- Handles communication between web app and native service
- Provides status reporting to web interface

### Configuration Files

#### accessibility_service_config.xml
Defines service capabilities:
- Event types to monitor
- Target package names (dialer apps)
- Permissions and flags
- Service description

#### AndroidManifest.xml
Declares:
- Accessibility service with proper intent filters
- Required permissions (CALL_PHONE, BIND_ACCESSIBILITY_SERVICE)
- Settings activity registration

## Usage Instructions

### 1. Service Setup
```kotlin
// Check if accessibility service is enabled
val helper = UssdAutomationHelper(context)
if (!helper.isAccessibilityServiceEnabled()) {
    helper.openAccessibilitySettings()
}
```

### 2. Transaction Configuration
```kotlin
// Setup transaction parameters
helper.setupTransaction(
    transactionType = "cash_in",
    phoneNumber = "0244123456", 
    amount = "100",
    pin = "1234"
)
```

### 3. USSD Automation
```kotlin
// Dial USSD with automation
helper.dialUssdWithAutomation(
    ussdCode = "*171#",
    transactionType = "cash_in",
    phoneNumber = "0244123456",
    amount = "100", 
    pin = "1234"
)
```

### 4. WebView Integration
```javascript
// Enable automation from web interface
window.UssdBridge.enableAutomation();

// Setup and dial with automation
window.UssdBridge.dialUssdWithAutomation(
    "*171#", "cash_in", "0244123456", "100", "1234"
);

// Check automation status
const status = JSON.parse(window.UssdBridge.getAutomationStatus());
```

## Security Considerations

### Privacy Protection
- All sensitive data (PINs, phone numbers) stored in private SharedPreferences
- No data transmitted over network
- Local processing only

### Permission Management
- Requires explicit user consent for accessibility service
- CALL_PHONE permission for USSD dialing
- No unnecessary permissions requested

### Data Handling
- PINs are masked in logs and UI
- Automatic cleanup of sensitive data after transactions
- No persistent storage of financial information

## Testing and Validation

### Test Scenarios
1. **Service Detection**: Verify USSD dialog detection across different dialer apps
2. **Menu Navigation**: Test automatic menu option selection
3. **Input Automation**: Validate text input for various field types
4. **Error Recovery**: Test handling of unexpected dialog states
5. **Multi-Step Flows**: Verify complete transaction flows

### Debugging Features
- Comprehensive logging with configurable levels
- Toast notifications for user feedback
- State tracking for troubleshooting
- Service status reporting

## Integration with Khompatek App

### WebView Bridge
The service integrates seamlessly with the existing React-based web interface through the UssdBridge class, allowing:
- Service status checking from web interface
- Transaction parameter configuration
- Real-time automation control
- Status updates and feedback

### Existing Component Enhancement
The service enhances existing components:
- **AndroidDialerModal**: Can trigger real automation instead of simulation
- **USSDProcessorModal**: Can use real service status for UI updates
- **Dashboard**: Can check service availability before transactions

### Configuration Integration
- Leverages existing transaction type configurations
- Uses existing network detection logic
- Integrates with existing USSD code management

## Deployment Considerations

### App Store Compliance
- Accessibility services require special review on Google Play
- Clear description of accessibility features required
- User consent and education essential

### User Experience
- Clear onboarding flow for accessibility service setup
- Fallback to manual USSD when service unavailable
- Progressive enhancement approach

### Performance
- Minimal battery impact through efficient event filtering
- Optimized text processing algorithms
- Automatic cleanup and resource management

This implementation provides a robust, secure, and user-friendly solution for USSD automation while maintaining compatibility with the existing Khompatek application architecture.