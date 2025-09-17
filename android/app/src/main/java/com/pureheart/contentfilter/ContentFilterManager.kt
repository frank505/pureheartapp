package com.pureheart.contentfilter

import android.accessibilityservice.AccessibilityService
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import com.pureheart.R
import java.util.*

data class UsageStats(
    val blockedAttempts: Int,
    val flaggedContent: Int,
    val lastActivity: Long
)

class ContentFilterManager(private val context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "content_filter_prefs", Context.MODE_PRIVATE
    )
    
    private val accountabilityLogger: AccountabilityLogger by lazy {
        AccountabilityLogger(context)
    }
    
    companion object {
        private const val FILTER_ENABLED_KEY = "filter_enabled"
        private const val BLOCKED_DOMAINS_KEY = "blocked_domains"
        private const val BLOCKED_ATTEMPTS_KEY = "blocked_attempts"
        private const val FLAGGED_CONTENT_KEY = "flagged_content"
        private const val LAST_ACTIVITY_KEY = "last_activity"
        
        private val DEFAULT_BLOCKED_DOMAINS = listOf(
            // Adult content domains
            "pornhub.com", "xvideos.com", "xnxx.com", "redtube.com", "youporn.com",
            "tube8.com", "spankbang.com", "chaturbate.com", "cam4.com", "livejasmin.com",
            "stripchat.com", "xhamster.com", "beeg.com", "sex.com", "xxx.com",
            "porn.com", "adult.com", "playboy.com", "penthouse.com", "bangbros.com",
            "brazzers.com", "realitykings.com", "naughtyamerica.com", "mofos.com",
            "digitalplayground.com", "twistys.com", "evilangel.com", "kink.com",
            
            // Gambling domains
            "bet365.com", "pokerstars.com", "888casino.com", "williamhill.com",
            "ladbrokes.com", "betfair.com", "paddy-power.com", "coral.co.uk",
            
            // Dating/hookup domains  
            "tinder.com", "bumble.com", "ashleymadison.com", "adultfriendfinder.com",
            "match.com", "eharmony.com", "plenty-of-fish.com", "okcupid.com"
        )
        
        private val SOCIAL_MEDIA_PACKAGES = listOf(
            "com.instagram.android",
            "com.zhiliaoapp.musically", // TikTok
            "com.tiktok.global",
            "com.snapchat.android",
            "com.facebook.katana", // Facebook
            "com.twitter.android",
            "com.reddit.frontpage",
            "com.pinterest",
            "com.linkedin.android",
            "com.discord",
            "com.whatsapp",
            "com.telegram.messenger",
            "org.telegram.messenger",
            "com.viber.voip",
            "com.skype.raider",
            "com.google.android.youtube",
            "com.vimeo.android.videoapp",
            "musical.ly", // Old TikTok
            "com.ss.android.ugc.trill" // TikTok Lite
        )
        
        private val BROWSER_PACKAGES = listOf(
            "com.android.chrome",
            "org.mozilla.firefox",
            "com.microsoft.emmx", // Edge
            "com.opera.browser",
            "com.brave.browser",
            "com.duckduckgo.mobile.android",
            "com.UCMobile.intl", // UC Browser
            "com.sec.android.app.sbrowser", // Samsung Internet
            "org.chromium.chrome"
        )
    }

    fun isFilterEnabled(): Boolean {
        val enabled = prefs.getBoolean(FILTER_ENABLED_KEY, false)
        Log.d("ContentFilter", "🔍 isFilterEnabled() = $enabled")
        return enabled
    }

    fun enableFilter(): Boolean {
        Log.d("ContentFilter", "🔧 enableFilter() called")
        
        // Check if we have all required permissions
        val hasAccessibility = checkAccessibilityPermission()
        val hasUsageStats = checkUsageStatsPermission()
        val hasOverlay = checkOverlayPermission()
        
        Log.d("ContentFilter", "🔧 Permission check: accessibility=$hasAccessibility, usageStats=$hasUsageStats, overlay=$hasOverlay")
        
        if (!hasAccessibility) {
            Log.d("ContentFilter", "🔧 Requesting accessibility permission")
            requestAccessibilityPermission()
            return false
        }
        
        if (!hasUsageStats) {
            Log.d("ContentFilter", "🔧 Requesting usage stats permission")
            requestUsageStatsPermission()
            return false
        }
        
        if (!hasOverlay) {
            Log.d("ContentFilter", "🔧 Requesting overlay permission")
            requestOverlayPermission()
            return false
        }
        
        Log.d("ContentFilter", "🔧 All permissions granted, enabling filter")
        prefs.edit().putBoolean(FILTER_ENABLED_KEY, true).apply()
        
        // Start the accessibility service
        startAccessibilityService()
        
        // Show notification that filtering is active
        showFilterActiveNotification()
        
        Log.d("ContentFilter", "🔧 Filter enabled successfully")
        return true
    }

    fun disableFilter(): Boolean {
        prefs.edit().putBoolean(FILTER_ENABLED_KEY, false).apply()
        
        // Stop accessibility service
        stopAccessibilityService()
        
        // Hide any active overlays
        hideContentOverlay()
        
        // Cancel notification
        cancelFilterActiveNotification()
        
        return true
    }

    fun forceEnableFilter(): Boolean {
        Log.d("ContentFilter", "🔧 forceEnableFilter() called - bypassing permission checks")
        
        prefs.edit().putBoolean(FILTER_ENABLED_KEY, true).apply()
        
        // Start the accessibility service
        startAccessibilityService()
        
        // Show notification that filtering is active
        showFilterActiveNotification()
        
        Log.d("ContentFilter", "🔧 Filter force-enabled successfully")
        return true
    }

    fun reloadContentBlocker(): Boolean {
        if (!isFilterEnabled()) return false
        
        // Restart accessibility service to reload rules
        stopAccessibilityService()
        Thread.sleep(500) // Brief delay
        startAccessibilityService()
        
        return true
    }

    fun addBlockedDomain(domain: String): Boolean {
        val domains = getBlockedDomains().toMutableSet()
        domains.add(domain.lowercase())
        saveBlockedDomains(domains.toList())
        
        // Reload content blocker with new rules
        reloadContentBlocker()
        
        return true
    }

    fun removeBlockedDomain(domain: String): Boolean {
        val domains = getBlockedDomains().toMutableSet()
        domains.remove(domain.lowercase())
        saveBlockedDomains(domains.toList())
        
        // Reload content blocker with new rules
        reloadContentBlocker()
        
        return true
    }

    fun getBlockedDomains(): List<String> {
        val defaultDomains = DEFAULT_BLOCKED_DOMAINS
        val customDomains = prefs.getStringSet(BLOCKED_DOMAINS_KEY, emptySet())?.toList() ?: emptyList()
        return (defaultDomains + customDomains).distinct()
    }

    fun getDefaultBlockedDomains(): List<String> {
        return DEFAULT_BLOCKED_DOMAINS
    }

    private fun saveBlockedDomains(domains: List<String>) {
        val customDomains = domains.filter { !DEFAULT_BLOCKED_DOMAINS.contains(it) }
        prefs.edit().putStringSet(BLOCKED_DOMAINS_KEY, customDomains.toSet()).apply()
    }

    fun openContentBlockerSettings(): Boolean {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun checkAccessibilityPermission(): Boolean {
        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        val serviceName = "${context.packageName}/.contentfilter.ContentFilterAccessibilityService"
        val alternateServiceName = "${context.packageName}/com.pureheart.contentfilter.ContentFilterAccessibilityService"
        
        Log.d("ContentFilter", "🔍 === ACCESSIBILITY PERMISSION DEBUG ===")
        Log.d("ContentFilter", "📱 Package name: ${context.packageName}")
        Log.d("ContentFilter", "🎯 Looking for service: $serviceName")
        Log.d("ContentFilter", "🎯 Alternate format: $alternateServiceName")
        Log.d("ContentFilter", "📋 ALL enabled services: $enabledServices")
        
        if (enabledServices.isNullOrEmpty()) {
            Log.w("ContentFilter", "❌ No accessibility services enabled at all")
            return false
        }
        
        // Split and check each service individually
        val servicesList = enabledServices.split(":")
        Log.d("ContentFilter", "📝 Individual services:")
        servicesList.forEachIndexed { index, service ->
            Log.d("ContentFilter", "   [$index] '$service'")
            if (service.contains("pureheart", ignoreCase = true) || 
                service.contains("ContentFilter", ignoreCase = true)) {
                Log.d("ContentFilter", "   ⭐ ^ This one contains our app!")
            }
        }
        
        // Check multiple possible formats
        val isEnabled = enabledServices.contains(serviceName) || 
                       enabledServices.contains(alternateServiceName) ||
                       servicesList.any { it.contains("pureheart", ignoreCase = true) && 
                                         it.contains("ContentFilter", ignoreCase = true) }
        
        Log.d("ContentFilter", "✅ Final result: Accessibility service enabled = $isEnabled")
        Log.d("ContentFilter", "🔍 === END ACCESSIBILITY DEBUG ===")
        
        return isEnabled
    }

    fun isAccessibilityServiceRunning(): Boolean {
        try {
            val runningServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ACCESSIBILITY_ENABLED
            )
            Log.d("ContentFilter", "🏃 Accessibility services running: $runningServices")
            return runningServices == "1"
        } catch (e: Exception) {
            Log.e("ContentFilter", "Error checking if accessibility is running", e)
            return false
        }
    }

    fun requestAccessibilityPermission(): Boolean {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun checkUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )
        }
        return mode == android.app.AppOpsManager.MODE_ALLOWED
    }

    fun requestUsageStatsPermission(): Boolean {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }

    fun requestOverlayPermission(): Boolean {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                intent.data = Uri.parse("package:${context.packageName}")
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun showContentOverlay(message: String): Boolean {
        try {
            Log.d("ContentFilter", "🛡️ showContentOverlay called with message: $message")
            
            val intent = Intent(context, ContentOverlayService::class.java)
            intent.putExtra("message", message)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Log.d("ContentFilter", "🛡️ Starting foreground service")
                context.startForegroundService(intent)
            } else {
                Log.d("ContentFilter", "🛡️ Starting service")
                context.startService(intent)
            }
            
            // Log the blocked attempt
            incrementBlockedAttempts()
            
            Log.d("ContentFilter", "🛡️ Content overlay service started successfully")
            return true
        } catch (e: Exception) {
            Log.e("ContentFilter", "🛡️ Error showing content overlay", e)
            return false
        }
    }

    fun hideContentOverlay(): Boolean {
        try {
            val intent = Intent(context, ContentOverlayService::class.java)
            context.stopService(intent)
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    fun blockSocialMediaApps(): Boolean {
        // For Android, we use the accessibility service to detect and block social media apps
        // This is handled in the AccessibilityService
        return true
    }

    fun unblockSocialMediaApps(): Boolean {
        // Handled in the AccessibilityService
        return true
    }

    fun getUsageStats(): UsageStats {
        val blockedAttempts = prefs.getInt(BLOCKED_ATTEMPTS_KEY, 0)
        val flaggedContent = prefs.getInt(FLAGGED_CONTENT_KEY, 0)
        val lastActivity = prefs.getLong(LAST_ACTIVITY_KEY, 0)
        
        return UsageStats(blockedAttempts, flaggedContent, lastActivity)
    }

    fun incrementBlockedAttempts() {
        val current = prefs.getInt(BLOCKED_ATTEMPTS_KEY, 0)
        prefs.edit()
            .putInt(BLOCKED_ATTEMPTS_KEY, current + 1)
            .putLong(LAST_ACTIVITY_KEY, System.currentTimeMillis())
            .apply()
        
        // Log to accountability system
        accountabilityLogger.logEvent(
            AccountabilityLogger.TYPE_DOMAIN_BLOCK,
            "Unknown domain",
            AccountabilityLogger.ACTION_BLOCKED,
            "Content blocked by overlay"
        )
    }

    fun incrementFlaggedContent() {
        val current = prefs.getInt(FLAGGED_CONTENT_KEY, 0)
        prefs.edit()
            .putInt(FLAGGED_CONTENT_KEY, current + 1)
            .putLong(LAST_ACTIVITY_KEY, System.currentTimeMillis())
            .apply()
        
        // Log to accountability system
        accountabilityLogger.logEvent(
            AccountabilityLogger.TYPE_CONTENT_FLAG,
            "Flagged content",
            AccountabilityLogger.ACTION_FLAGGED,
            "Inappropriate content detected"
        )
    }

    private fun startAccessibilityService() {
        try {
            val intent = Intent(context, ContentFilterAccessibilityService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopAccessibilityService() {
        try {
            val intent = Intent(context, ContentFilterAccessibilityService::class.java)
            context.stopService(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun showFilterActiveNotification() {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "content_filter",
                "Content Filter",
                NotificationManager.IMPORTANCE_LOW
            )
            channel.description = "Content filtering notifications"
            notificationManager.createNotificationChannel(channel)
        }
        
        val notification = NotificationCompat.Builder(context, "content_filter")
            .setContentTitle("Content Filter Active")
            .setContentText("PureHeart is monitoring and filtering inappropriate content")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        
        notificationManager.notify(1001, notification)
    }

    private fun cancelFilterActiveNotification() {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(1001)
    }

    fun isDomainBlocked(url: String): Boolean {
        if (!isFilterEnabled()) return false
        
        val blockedDomains = getBlockedDomains()
        val isBlocked = blockedDomains.any { domain ->
            url.lowercase().contains(domain.lowercase())
        }
        
        if (isBlocked) {
            // Log the blocked domain
            accountabilityLogger.logDomainBlock(url, "Domain blocked by filter")
        }
        
        return isBlocked
    }

    fun isSocialMediaApp(packageName: String): Boolean {
        return SOCIAL_MEDIA_PACKAGES.contains(packageName)
    }

    fun isBrowserApp(packageName: String): Boolean {
        return BROWSER_PACKAGES.contains(packageName)
    }

    fun shouldBlockApp(packageName: String): Boolean {
        return isFilterEnabled() && isSocialMediaApp(packageName)
    }

    fun shouldMonitorApp(packageName: String): Boolean {
        val filterEnabled = isFilterEnabled()
        val isBrowser = isBrowserApp(packageName)
        val isSocial = isSocialMediaApp(packageName)
        val result = filterEnabled && (isBrowser || isSocial)
        
        Log.d("ContentFilter", "🔍 shouldMonitorApp($packageName): filterEnabled=$filterEnabled, isBrowser=$isBrowser, isSocial=$isSocial, result=$result")
        
        return result
    }
}
