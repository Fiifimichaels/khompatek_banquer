# Complete Guide: Converting Khompatek to Android App

## Overview
This guide will walk you through converting your React-based Khompatek web app into a native Android application with USSD automation capabilities.

## Prerequisites

### Development Environment Setup
1. **Install Android Studio**
   ```bash
   # Download from: https://developer.android.com/studio
   # Install Android SDK, Platform Tools, and Build Tools
   ```

2. **Install Node.js and Capacitor**
   ```bash
   npm install -g @capacitor/cli
   npm install @capacitor/core @capacitor/android
   ```

3. **Java Development Kit (JDK)**
   ```bash
   # Install JDK 11 or higher
   # Set JAVA_HOME environment variable
   ```

## Step 1: Initialize Capacitor in Your Project

### 1.1 Add Capacitor to Your Existing Project
```bash
# In your project root directory
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init khompatek com.khompatek.app

# Add Android platform
npx cap add android
```

### 1.2 Configure Capacitor
Create/update `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khompatek.app',
  appName: 'Khompatek',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
```

## Step 2: Build Your Web App

### 2.1 Update Build Configuration
Update your `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### 2.2 Build the Web App
```bash
npm run build
npx cap sync android
```

## Step 3: Set Up Android Project Structure

### 3.1 Copy Android Files
Copy all the Android files I provided earlier to your project:

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/khompatek/
│   │   │   ├── MainActivity.kt
│   │   │   └── ussd/
│   │   │       ├── UssdAccessibilityService.kt
│   │   │       ├── AccessibilitySettingsActivity.kt
│   │   │       ├── UssdAutomationHelper.kt
│   │   │       └── UssdBridge.kt
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_accessibility_settings.xml
│   │   │   ├── values/
│   │   │   │   ├── strings.xml
│   │   │   │   └── themes.xml
│   │   │   └── xml/
│   │   │       └── accessibility_service_config.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle
```

### 3.2 Create MainActivity.kt
```kotlin
package com.khompatek

import android.os.Bundle
import android.webkit.WebView
import com.getcapacitor.BridgeActivity
import com.khompatek.ussd.UssdBridge

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
```

## Step 4: Configure Android Manifest

### 4.1 Update AndroidManifest.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.khompatek">

    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE"
        tools:ignore="ProtectedPermissions" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Accessibility Settings Activity -->
        <activity
            android:name="com.khompatek.ussd.AccessibilitySettingsActivity"
            android:exported="true"
            android:label="USSD Automation Settings"
            android:theme="@style/AppTheme">
        </activity>

        <!-- USSD Accessibility Service -->
        <service
            android:name="com.khompatek.ussd.UssdAccessibilityService"
            android:exported="true"
            android:label="@string/accessibility_service_label"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>
```

## Step 5: Configure Build Files

### 5.1 Update app/build.gradle
```gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.khompatek'
    compileSdk 34

    defaultConfig {
        applicationId "com.khompatek.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.webkit:webkit:1.9.0'
    
    // Capacitor
    implementation project(':capacitor-android')
    implementation 'com.capacitorjs:core:5.5.1'
    implementation 'com.capacitorjs:haptics:5.0.6'
    implementation 'com.capacitorjs:keyboard:5.0.6'
    implementation 'com.capacitorjs:status-bar:5.0.6'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

### 5.2 Update project-level build.gradle
```gradle
buildscript {
    ext.kotlin_version = '1.9.10'
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

## Step 6: Integrate USSD Bridge with Web App

### 6.1 Update Your React Components
Modify your existing components to use the native bridge:

```typescript
// src/utils/ussdDialer.ts - Update for Android
export const dialUSSD = async (ussdCode: string, simSlot: number = 1): Promise<USSDDialResult> => {
  try {
    // Check if we're in Android app with bridge
    if (window.UssdBridge) {
      const success = window.UssdBridge.dialUssdWithAutomation(
        ussdCode, 
        'cash_in', // transaction type
        '0244123456', // phone number
        '100', // amount
        '1234' // pin
      );
      
      return {
        success,
        message: success ? 'USSD automation started' : 'Failed to start automation',
        reference: success ? `USSD_${Date.now()}` : undefined
      };
    }
    
    // Fallback for web
    const encodedUSSD = ussdCode.replace(/#/g, '%23');
    window.location.href = `tel:${encodedUSSD}`;
    
    return {
      success: true,
      message: 'USSD code sent to dialer',
      reference: `USSD_${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to dial USSD code'
    };
  }
};
```

### 6.2 Add Type Definitions
Create `src/types/android.d.ts`:
```typescript
declare global {
  interface Window {
    UssdBridge: {
      isAccessibilityServiceEnabled(): boolean;
      openAccessibilitySettings(): void;
      setupTransaction(type: string, phone: string, amount: string, pin: string): boolean;
      dialUssdWithAutomation(ussd: string, type: string, phone: string, amount: string, pin: string): boolean;
      enableAutomation(): void;
      disableAutomation(): void;
      isAutomationEnabled(): boolean;
      resetAutomation(): void;
      getAutomationStatus(): string;
      log(message: string): void;
    };
  }
}

export {};
```

## Step 7: Build and Test

### 7.1 Build the App
```bash
# Build web assets
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 7.2 Configure Android Studio
1. Open the project in Android Studio
2. Wait for Gradle sync to complete
3. Connect an Android device or start an emulator
4. Build and run the app

### 7.3 Test USSD Automation
1. Install the app on a device with SIM card
2. Grant necessary permissions:
   - Phone permission for USSD dialing
   - Accessibility service permission
3. Configure automation settings
4. Test USSD transactions

## Step 8: App Store Preparation

### 8.1 Generate Signed APK
```bash
# In Android Studio:
# Build > Generate Signed Bundle/APK
# Choose APK, create/use keystore
# Build release APK
```

### 8.2 Prepare Store Listing
- App description highlighting USSD automation
- Screenshots showing the interface
- Privacy policy for accessibility service usage
- Feature list and permissions explanation

### 8.3 Google Play Console Setup
1. Create developer account
2. Upload APK/AAB
3. Complete store listing
4. Submit for review (note: accessibility services require special review)

## Step 9: Advanced Features

### 9.1 Add Push Notifications
```bash
npm install @capacitor/push-notifications
npx cap sync android
```

### 9.2 Add Biometric Authentication
```bash
npm install @capacitor-community/biometric-auth
npx cap sync android
```

### 9.3 Add Local Storage
```bash
npm install @capacitor/preferences
npx cap sync android
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are properly installed
   - Check Android SDK versions
   - Verify Gradle configuration

2. **Accessibility Service Not Working**
   - Check service is enabled in Android settings
   - Verify permissions in manifest
   - Test on different Android versions

3. **WebView Issues**
   - Enable WebView debugging
   - Check console logs
   - Verify bridge integration

4. **USSD Dialing Problems**
   - Ensure CALL_PHONE permission granted
   - Test on device with active SIM
   - Check network provider compatibility

### Debug Commands
```bash
# View device logs
adb logcat | grep Khompatek

# Install debug APK
adb install app-debug.apk

# Check app permissions
adb shell dumpsys package com.khompatek.app
```

## Security Considerations

### Data Protection
- Store sensitive data in Android Keystore
- Use encrypted SharedPreferences
- Implement certificate pinning for API calls

### Permission Management
- Request permissions at runtime
- Explain permission usage to users
- Implement graceful degradation

### Code Obfuscation
- Enable ProGuard/R8 for release builds
- Obfuscate sensitive methods
- Remove debug logs in production

## Performance Optimization

### App Size Reduction
- Enable code shrinking
- Remove unused resources
- Optimize images and assets

### Runtime Performance
- Implement lazy loading
- Optimize WebView performance
- Use efficient data structures

### Battery Optimization
- Minimize background processing
- Use efficient accessibility event filtering
- Implement proper lifecycle management

This comprehensive guide will help you successfully convert your Khompatek web app into a fully functional Android application with advanced USSD automation capabilities.