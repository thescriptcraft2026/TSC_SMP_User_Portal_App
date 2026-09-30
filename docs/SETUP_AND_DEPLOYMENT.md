# Setup, Build & Deployment Guide

This guide covers local environment setup, configuration variables, building Android (APK & AAB), building iOS (Simulator, TestFlight, App Store), and resolving common build issues for **TheScriptCraft User Portal**.

---

## 🛠️ System Prerequisites

| Tool | Version Requirement | Description |
| :--- | :--- | :--- |
| **Node.js** | `>= 22.11.0` | JavaScript Runtime (LTS) |
| **npm** | `>= 10.0.0` | Package manager |
| **JDK** | `17` or `21` (Temurin / OpenJDK) | Java Development Kit for Android builds |
| **Android Studio** | Ladybug / Meerkat (2024.2+) | Android SDK Platform 34/35, Android Build Tools 35.0.0 |
| **Xcode** | `15.0` or `16.0+` | macOS required for iOS builds |
| **CocoaPods** | `1.15.0+` | iOS dependency manager (via Ruby Bundler) |
| **Ruby** | `3.1+` | For CocoaPods bundler |

---

## 💻 Local Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/TSC_SMP_User_Portal_App.git
cd TSC_SMP_User_Portal_App

# Install dependencies
npm install
```

### 2. Configure `.env` File

Create a `.env` file in the root directory:

```env
# ----------------------------------------------------
# Staging Environment (Default for development)
# ----------------------------------------------------
API_BASE_URL=https://betatscapi.thescriptcraft.com/v1/user
SOCKET_URL=https://betatscapi.thescriptcraft.com

# ----------------------------------------------------
# Production Environment (Release builds)
# ----------------------------------------------------
# API_BASE_URL=https://tscapi.thescriptcraft.com/v1/user
# SOCKET_URL=https://tscapi.thescriptcraft.com

# ----------------------------------------------------
# Local / Dev Tunnel Environment (Backend debugging)
# ----------------------------------------------------
# API_BASE_URL=https://dggsgrw6-3000.inc1.devtunnels.ms/v1/user
# SOCKET_URL=https://betatscapi.thescriptcraft.com
```

---

## 🤖 Android Setup & Build

### 1. Configure Android SDK & Environment Variables

Add the following to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 2. Run Debug on Android

Ensure an Android emulator is running or a physical device is connected with USB Debugging enabled:

```bash
# Start Metro bundler
npm start

# In a separate terminal, deploy debug build
npm run android
```

### 3. Generate Android Release Builds (APK / AAB)

#### Step 1: Generate a Keystore (if not already present)
```bash
keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
Place `my-upload-key.keystore` in `android/app/`.

#### Step 2: Configure `android/gradle.properties`
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

#### Step 3: Build Android App Bundle (AAB for Google Play Store)
Make sure `.env` is loaded by passing `ENVFILE`:
```bash
cd android
./gradlew clean
ENVFILE=.env ./gradlew bundleRelease
```
The resulting bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

> [!NOTE]
> Current Android App Version: **`versionName 1.9.3`** | **`versionCode 42`**

#### Step 4: Build Standalone Release APK
```bash
cd android
ENVFILE=.env ./gradlew assembleRelease
```
The APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🛡️ ProGuard & Release Minification Rules

When `minifyEnabled true` is enabled in `android/app/build.gradle`, R8 requires explicit keep rules in `android/app/proguard-rules.pro` to prevent stripping environment variables (`react-native-config`) and network dependencies (`okhttp3`):

```proguard
# react-native-config & BuildConfig
-keep class com.reactnativeconfig.** { *; }
-keep class com.rnscriptcarft.BuildConfig { *; }
-dontwarn com.reactnativeconfig.**

# Networking (OkHttp3 & Okio)
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Firebase & Google Services
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
```

In addition, `android/app/build.gradle` must include:
```groovy
defaultConfig {
    ...
    resValue "string", "build_config_package", "com.rnscriptcarft"
}
```

---

## 🍏 iOS Setup & Build (macOS)

### 1. Install CocoaPods Dependencies

```bash
# Install Ruby dependencies
bundle install

# Install CocoaPods
bundle exec pod install --project-directory=ios
```

### 2. Run on iOS Simulator

```bash
npm run ios
```

Or specify a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 16 Pro"
```

### 3. Firebase Setup for iOS
- Ensure `GoogleService-Info.plist` is downloaded from Firebase Console.
- Drag and drop `GoogleService-Info.plist` into the `TheScriptCraft` project via Xcode (ensure *Copy items if needed* is checked).

### 4. Build Archive for TestFlight / App Store
1. Open `ios/TheScriptCraft.xcworkspace` in Xcode.
2. Select **TheScriptCraft** target ➔ **Signing & Capabilities**.
3. Choose your **Team** and set the bundle identifier (`com.thescriptcraft.app` or similar).
4. Set the build scheme to **Any iOS Device (arm64)**.
5. In Xcode menu: **Product** ➔ **Archive**.
6. When the Organizer opens, click **Distribute App** ➔ **App Store Connect** ➔ **Upload**.

---

## 🔧 Deep Linking Configuration

### Android Setup (`android/app/src/main/AndroidManifest.xml`)
Ensure intent filters are configured:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="tsc" />
    <data android:scheme="https" android:host="thescriptcraft.com" />
    <data android:scheme="https" android:host="www.thescriptcraft.com" />
</intent-filter>
```
Host your Digital Asset Links file at:
`https://thescriptcraft.com/.well-known/assetlinks.json`

### iOS Setup (`ios/TheScriptCraft/Info.plist`)
Ensure URL Schemes and Associated Domains are configured:
- URL Scheme: `tsc`
- Associated Domains capability: `applinks:thescriptcraft.com`
- Host your Apple App Site Association file at:
  `https://thescriptcraft.com/.well-known/apple-app-site-association`

---

## 🔍 Troubleshooting & FAQs

### 1. "Network Error" on Google Play Store / Testing Release Builds
If downloading from Google Play Console produces a `Network Error` upon login:
- **Cause**: R8 / ProGuard stripped `BuildConfig` or `Config.API_BASE_URL` was `undefined`.
- **Solution**:
  1. Ensure `android/app/proguard-rules.pro` contains the `-keep class com.reactnativeconfig.** { *; }` rules.
  2. Verify `resValue "string", "build_config_package", "com.rnscriptcarft"` is inside `defaultConfig` in `android/app/build.gradle`.
  3. Ensure `Instance/Instance.tsx` uses the fallback `DEFAULT_API_BASE_URL`.
  4. Always build release bundles with `ENVFILE=.env ./gradlew bundleRelease`.

### 2. Metro Bundler Cache Issues
If you encounter module resolution errors or cache corruption:
```bash
npm start -- --reset-cache
```

### 3. Android Gradle Build Failures
Clean and rebuild gradle:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 4. iOS Pod Conflicts
Reinstall pods from scratch:
```bash
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
cd ..
```

### 5. Vector Icons Missing / Red Screen on Android
Ensure font assets are linked:
```bash
npx react-native-asset
```

---

© **TheScriptCraft**. All rights reserved.
