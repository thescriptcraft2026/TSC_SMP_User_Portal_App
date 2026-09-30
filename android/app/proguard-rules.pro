# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# -------------------------------------------------------------------
# react-native-config
# -------------------------------------------------------------------
-keep class com.reactnativeconfig.** { *; }
-keep class com.rnscriptcarft.BuildConfig { *; }
-dontwarn com.reactnativeconfig.**

# -------------------------------------------------------------------
# Networking (OkHttp3 & Okio)
# -------------------------------------------------------------------
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# -------------------------------------------------------------------
# Firebase & Google Services
# -------------------------------------------------------------------
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }

# -------------------------------------------------------------------
# React Native & Native Modules
# -------------------------------------------------------------------
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }

