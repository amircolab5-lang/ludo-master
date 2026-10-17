# =========================================================================
# LUDO MASTER - PRODUCTION PROGUARD / R8 OPTIMIZATION RULES
# =========================================================================

# 1. WebView & JavaScript Interface Preservation
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.ludomaster.ticno.AndroidBridge { *; }
-keep class com.ludomaster.ticno.MainActivity { *; }

# 2. Keep Android Activity & Application
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application

# 3. Google Play Billing SDK
-keep class com.android.billingclient.api.** { *; }

# 4. Unity Ads SDK
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keep class com.unity3d.ads.** { *; }
-keep interface com.unity3d.ads.** { *; }
-keep class com.unity3d.services.** { *; }
-keep interface com.unity3d.services.** { *; }
-dontwarn com.unity3d.services.**
-dontwarn com.unity3d.ads.**

# 5. Moshi & JSON Parsing
-keepclassmembers class * {
    @com.squareup.moshi.Json <fields>;
}
-dontwarn com.squareup.moshi.**

# 6. OkHttp & Coroutines
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn kotlinx.coroutines.**

# 7. Jetpack Compose Rules
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**
