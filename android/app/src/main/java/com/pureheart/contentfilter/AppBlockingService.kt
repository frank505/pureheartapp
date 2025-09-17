package com.pureheart.contentfilter

import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import java.util.concurrent.TimeUnit

class AppBlockingService : Service() {

    private val handler = Handler(Looper.getMainLooper())
    private var monitoringRunnable: Runnable? = null
    private lateinit var contentFilterManager: ContentFilterManager
    private lateinit var usageStatsManager: UsageStatsManager
    
    companion object {
        private const val TAG = "AppBlockingService"
        private const val MONITORING_INTERVAL = 2000L // Check every 2 seconds
    }

    override fun onCreate() {
        super.onCreate()
        contentFilterManager = ContentFilterManager(this)
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        Log.d(TAG, "AppBlockingService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startMonitoring()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun startMonitoring() {
        if (monitoringRunnable != null) {
            return // Already monitoring
        }
        
        monitoringRunnable = object : Runnable {
            override fun run() {
                try {
                    checkRunningApps()
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking running apps", e)
                } finally {
                    handler.postDelayed(this, MONITORING_INTERVAL)
                }
            }
        }
        
        handler.post(monitoringRunnable!!)
        Log.d(TAG, "Started app monitoring")
    }

    private fun stopMonitoring() {
        monitoringRunnable?.let { runnable ->
            handler.removeCallbacks(runnable)
            monitoringRunnable = null
        }
        Log.d(TAG, "Stopped app monitoring")
    }

    private fun checkRunningApps() {
        if (!contentFilterManager.isFilterEnabled()) {
            return
        }
        
        val currentTime = System.currentTimeMillis()
        val startTime = currentTime - TimeUnit.MINUTES.toMillis(1) // Check last minute
        
        try {
            val usageEvents = usageStatsManager.queryEvents(startTime, currentTime)
            val event = UsageEvents.Event()
            
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event)
                
                if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    val packageName = event.packageName
                    
                    // Check if this is a social media app that should be blocked
                    if (contentFilterManager.shouldBlockApp(packageName)) {
                        blockApp(packageName)
                    }
                    // Check if this is a browser that should be monitored
                    else if (contentFilterManager.shouldMonitorApp(packageName)) {
                        monitorBrowserApp(packageName)
                    }
                }
            }
        } catch (e: SecurityException) {
            Log.w(TAG, "No usage stats permission", e)
        } catch (e: Exception) {
            Log.e(TAG, "Error querying usage events", e)
        }
    }

    private fun blockApp(packageName: String) {
        Log.d(TAG, "Blocking social media app: $packageName")
        
        val appName = getAppName(packageName)
        val message = "Social media app '$appName' is blocked by PureHeart accountability"
        
        // Show blocking overlay
        contentFilterManager.showContentOverlay(message)
        
        // Send user to home screen
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        
        // Log the blocked attempt
        Log.d(TAG, "Blocked attempt to open: $packageName")
    }

    private fun monitorBrowserApp(packageName: String) {
        Log.d(TAG, "Monitoring browser app: $packageName")
        
        // The actual content monitoring is handled by the AccessibilityService
        // This just logs that a browser was opened
        val appName = getAppName(packageName)
        Log.d(TAG, "Browser opened for monitoring: $appName")
    }

    private fun getAppName(packageName: String): String {
        return try {
            val packageManager = applicationContext.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName // Fallback to package name
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
        Log.d(TAG, "AppBlockingService destroyed")
    }
}

class SocialMediaBlocker(private val context: Context) {
    
    private val contentFilterManager = ContentFilterManager(context)
    
    companion object {
        private const val TAG = "SocialMediaBlocker"
        
        // Social media apps to block completely
        private val BLOCKED_SOCIAL_APPS = mapOf(
            "com.instagram.android" to "Instagram",
            "com.zhiliaoapp.musically" to "TikTok",
            "com.tiktok.global" to "TikTok",
            "com.snapchat.android" to "Snapchat",
            "com.facebook.katana" to "Facebook",
            "com.twitter.android" to "Twitter",
            "com.reddit.frontpage" to "Reddit",
            "com.pinterest" to "Pinterest",
            "com.discord" to "Discord",
            "com.google.android.youtube" to "YouTube",
            "musical.ly" to "TikTok",
            "com.ss.android.ugc.trill" to "TikTok Lite"
        )
        
        // Messaging apps (could be configurable)
        private val MESSAGING_APPS = mapOf(
            "com.whatsapp" to "WhatsApp",
            "com.telegram.messenger" to "Telegram",
            "org.telegram.messenger" to "Telegram",
            "com.viber.voip" to "Viber",
            "com.skype.raider" to "Skype"
        )
    }
    
    fun isAppBlocked(packageName: String): Boolean {
        return BLOCKED_SOCIAL_APPS.containsKey(packageName)
    }
    
    fun getBlockedApps(): Map<String, String> {
        return BLOCKED_SOCIAL_APPS
    }
    
    fun getMessagingApps(): Map<String, String> {
        return MESSAGING_APPS
    }
    
    fun blockApp(packageName: String, reason: String = "Social media access blocked") {
        val appName = BLOCKED_SOCIAL_APPS[packageName] ?: packageName
        val message = "$appName is blocked by your accountability settings. $reason"
        
        Log.d(TAG, "Blocking app: $appName ($packageName)")
        contentFilterManager.showContentOverlay(message)
    }
    
    fun shouldAllowMessaging(packageName: String): Boolean {
        // Check if messaging apps should be allowed
        // This could be configurable in the future
        return MESSAGING_APPS.containsKey(packageName)
    }
}
