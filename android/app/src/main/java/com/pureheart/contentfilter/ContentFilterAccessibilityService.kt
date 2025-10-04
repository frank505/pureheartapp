package com.pureheart.contentfilter

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.app.NotificationCompat
import com.pureheart.R
import java.util.regex.Pattern

class ContentFilterAccessibilityService : AccessibilityService() {

    private lateinit var contentFilterManager: ContentFilterManager
    private var currentPackage: String = ""
    private var currentUrl: String = ""
    private var isServiceReady: Boolean = false
    private var lastBlockedPackage: String = ""
    private var isBrowserInForeground = false
    private var overlayCheckRunnable: Runnable? = null
    private val overlayCheckHandler = Handler(Looper.getMainLooper())

    companion object {
        private const val TAG = "ContentFilterService"
        private const val NOTIFICATION_ID = 1002
        private const val CHANNEL_ID = "content_filter_service"

        // Generate patterns dynamically from comprehensive CSV data (3000+ entries)
        private val INAPPROPRIATE_PATTERNS = BlockedContent.domains.map { domain ->
            Pattern.compile(".*${Pattern.quote(domain.replace(".", "\\."))}.*", Pattern.CASE_INSENSITIVE)
        }

        // Text content patterns
        private val INAPPROPRIATE_TEXT_PATTERNS = listOf(
            Pattern.compile(".*\\b(porn|sex|nude|naked|xxx)\\b.*", Pattern.CASE_INSENSITIVE),
            Pattern.compile(".*\\b(adult content|mature content|18\\+)\\b.*", Pattern.CASE_INSENSITIVE),
            Pattern.compile(".*\\b(erotic|fetish|cam girl|webcam)\\b.*", Pattern.CASE_INSENSITIVE)
        )
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "ContentFilterAccessibilityService onCreate started")
        
        try {
            contentFilterManager = ContentFilterManager(this)
            
            // Auto-enable the filter when service starts
            if (!contentFilterManager.isFilterEnabled()) {
                Log.d(TAG, "🔧 Auto-enabling content filter...")
                val enabled = contentFilterManager.enableFilter()
                Log.d(TAG, "🔧 Filter auto-enable result: $enabled")
            }
            
            createNotificationChannel()
            isServiceReady = true
            Log.d(TAG, "ContentFilterAccessibilityService created successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreate", e)
            isServiceReady = false
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "ContentFilterAccessibilityService onServiceConnected started")

        try {
            // Start foreground service only when connected
            startForeground(NOTIFICATION_ID, createNotification())

            val info = AccessibilityServiceInfo().apply {
                eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED or
                            AccessibilityEvent.TYPE_VIEW_FOCUSED or
                            AccessibilityEvent.TYPE_VIEW_CLICKED or
                            AccessibilityEvent.TYPE_WINDOWS_CHANGED

                feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
                flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                       AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS

                // Monitor all packages
                packageNames = null
            }

            serviceInfo = info
            Log.d(TAG, "ContentFilterAccessibilityService connected successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error in onServiceConnected", e)
        }
    }

    private fun startOverlayCheck() {
        stopOverlayCheck() // Stop any existing check
        overlayCheckRunnable = Runnable {
            if (!isBrowserInForeground && lastBlockedPackage.isNotEmpty()) {
                Log.d(TAG, "Browser no longer in foreground, hiding overlay")
                contentFilterManager.hideContentOverlay()
                lastBlockedPackage = ""
            }
            // Schedule next check in 2 seconds
            overlayCheckHandler.postDelayed(overlayCheckRunnable!!, 2000)
        }
        overlayCheckHandler.postDelayed(overlayCheckRunnable!!, 2000)
    }

    private fun stopOverlayCheck() {
        overlayCheckRunnable?.let {
            overlayCheckHandler.removeCallbacks(it)
            overlayCheckRunnable = null
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        try {
            if (!isServiceReady || !::contentFilterManager.isInitialized) {
                Log.w(TAG, "Service not ready yet, skipping event")
                return
            }

            if (!contentFilterManager.isFilterEnabled()) return

            when (event.eventType) {
                AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                    handleWindowStateChanged(event)
                }
                AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED,
                AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> {
                    handleContentChanged(event)
                }
                AccessibilityEvent.TYPE_VIEW_FOCUSED,
                AccessibilityEvent.TYPE_VIEW_CLICKED -> {
                    handleUserInteraction(event)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling accessibility event", e)
        }
    }

    private fun handleWindowStateChanged(event: AccessibilityEvent) {
        try {
            val packageName = event.packageName?.toString() ?: return
            val wasBrowserInForeground = isBrowserInForeground
            val previousPackage = currentPackage
            
            currentPackage = packageName

            Log.d(TAG, "Window state changed: $packageName (previous: $previousPackage)")

            // Check if this is a social media app that should be blocked
            if (contentFilterManager.shouldBlockApp(packageName)) {
                blockCurrentApp("Social media apps are blocked by PureHeart accountability")
                return
            }

            // Track browser foreground/background state
            val isCurrentBrowser = contentFilterManager.isBrowserApp(packageName)
            isBrowserInForeground = isCurrentBrowser

            // If we switched away from a browser that had blocked content, hide the overlay
            if (wasBrowserInForeground && !isCurrentBrowser && lastBlockedPackage.isNotEmpty()) {
                Log.d(TAG, "🔄 Switched away from browser with blocked content, hiding overlay")
                contentFilterManager.hideContentOverlay()
                lastBlockedPackage = ""
                stopOverlayCheck()
            }

            // If user goes to home screen/launcher, hide overlay
            if (packageName.contains("launcher") || packageName.contains("home") || 
                packageName == "com.android.systemui") {
                if (lastBlockedPackage.isNotEmpty()) {
                    Log.d(TAG, "🏠 User went to home screen, hiding overlay")
                    contentFilterManager.hideContentOverlay()
                    lastBlockedPackage = ""
                    stopOverlayCheck()
                }
            }

            // If it's a browser, log the detection (simplified monitoring)
            if (isCurrentBrowser) {
                Log.d(TAG, "Browser detected: $packageName - Basic monitoring active")
                // Simple monitoring will happen through content changed events
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in handleWindowStateChanged", e)
        }
    }

    private fun testBlocking() {
        Log.w(TAG, "🧪 TEST BLOCKING: Manually triggering content block")
        blockCurrentContent("🚫 TEST BLOCK: Content filtering is working!")
    }

    private fun handleContentChanged(event: AccessibilityEvent) {
        try {
            // Extract package name from the event itself as backup
            val eventPackage = event.packageName?.toString() ?: ""
            Log.d(TAG, "🔍 Event package: '$eventPackage', currentPackage: '$currentPackage'")
            
            if (eventPackage.isNotEmpty() && eventPackage != currentPackage) {
                currentPackage = eventPackage
                Log.d(TAG, "🔄 Updated currentPackage from event: $currentPackage")
            }

            val shouldMonitor = contentFilterManager.shouldMonitorApp(currentPackage)
            val filterEnabled = contentFilterManager.isFilterEnabled()

            Log.d(TAG, "🔍 handleContentChanged: ready=$isServiceReady, shouldMonitor=$shouldMonitor, filterEnabled=$filterEnabled, package=$currentPackage")

            if (!isServiceReady || !shouldMonitor || !filterEnabled) {
                Log.d(TAG, "🔍 Skipping content check: serviceReady=$isServiceReady, shouldMonitor=$shouldMonitor, filterEnabled=$filterEnabled")
                return
            }

            // Check if browser is being used and monitor for URLs
            if (currentPackage.contains("chrome") || currentPackage.contains("firefox") ||
                currentPackage.contains("browser") || currentPackage.contains("edge") ||
                currentPackage == "com.android.chrome" || currentPackage == "org.mozilla.firefox") {

                Log.d(TAG, "🌐 Browser content changed, checking for URLs in package: $currentPackage")

                // Use the existing checkNodeForUrls function
                checkNodeForUrls(rootInActiveWindow)
            }

            // Get event text and content for analysis
            val eventText = event.text.joinToString(" ") { it.toString() }
            val contentDescription = event.contentDescription?.toString() ?: ""
            val className = event.className?.toString() ?: ""
            val packageName = event.packageName?.toString() ?: ""

            // Combine all available text for checking
            val allText = "$eventText $contentDescription $className $packageName".lowercase()

            Log.d(TAG, "📝 Checking combined text: ${allText.take(200)}...")

            // AGGRESSIVE blocking - check immediately for any blocked content
            if (containsBlockedUrl(allText)) {
                Log.w(TAG, "🚫🚫🚫 IMMEDIATE BLOCK: Blocked content detected!")
                Log.w(TAG, "🚫 Full text that triggered block: $allText")
                blockCurrentContent("🚫 BLOCKED WEBSITE: This site is not allowed by PureHeart accountability")
                contentFilterManager.incrementBlockedAttempts()
                return
            }

            // Check for URL patterns in any text (more aggressive)
            if (containsUrlPattern(allText)) {
                Log.d(TAG, "🔗 URL pattern detected, checking if blocked...")
                if (containsBlockedUrl(allText)) {
                    Log.w(TAG, "🚫🚫🚫 URL BLOCK: Blocked URL detected in content!")
                    blockCurrentContent("🚫 BLOCKED URL: This website is not allowed")
                    contentFilterManager.incrementBlockedAttempts()
                    return
                }
            }

            // Check for explicit content keywords
            if (containsExplicitContent(allText)) {
                Log.w(TAG, "🚫🚫🚫 EXPLICIT CONTENT: Inappropriate content detected!")
                blockCurrentContent("🚫 INAPPROPRIATE CONTENT: This content is blocked")
                contentFilterManager.incrementFlaggedContent()
                return
            }

            // Check for URLs in the accessibility event nodes
            checkForBlockedUrls(event)

            // Additional text-based inappropriate content check
            if (containsInappropriateText(allText)) {
                Log.w(TAG, "🚫 Inappropriate content detected in text")
                blockCurrentContent("Inappropriate content detected")
                contentFilterManager.incrementFlaggedContent()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in handleContentChanged", e)
        }
    }    private fun checkForBlockedUrls(event: AccessibilityEvent) {
        try {
            // Try to get the root node to find URL elements
            val rootNode = rootInActiveWindow ?: return

            // Also check the event itself for URL content
            val eventText = event.text.joinToString(" ") { it.toString() }
            if (eventText.isNotEmpty() && containsBlockedUrl(eventText)) {
                Log.w(TAG, "🚫 BLOCKED URL in event text: $eventText")
                blockCurrentContent("🚫 BLOCKED URL: This website is not allowed")
                contentFilterManager.incrementBlockedAttempts()
                return
            }

            checkNodeForUrls(rootNode)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking URLs in nodes", e)
        }
    }

    private fun checkNodeForUrls(node: AccessibilityNodeInfo?) {
        try {
            if (node == null) return

            // Check if this node contains URL-like content
            val text = node.text?.toString() ?: ""
            val contentDescription = node.contentDescription?.toString() ?: ""

            Log.d(TAG, "🔍 Checking node: text='$text', description='$contentDescription', viewId='${node.viewIdResourceName}', className='${node.className}'")

            // Check for URLs in common browser UI elements
            if (node.viewIdResourceName?.contains("url_bar") == true ||
                node.viewIdResourceName?.contains("address") == true ||
                node.className?.contains("EditText") == true) {

                val urlToCheck = if (text.contains("http")) text else contentDescription
                if (urlToCheck.isNotEmpty()) {
                    Log.d(TAG, "🔍 Found potential URL: $urlToCheck")

                    if (containsBlockedUrl(urlToCheck)) {
                        Log.w(TAG, "🚫 Blocking URL: $urlToCheck")
                        blockCurrentContent("Blocked website: ${extractDomain(urlToCheck)} is not allowed")
                        contentFilterManager.incrementBlockedAttempts()
                        return
                    }
                }
            }

            // Also check any text content for blocked domains
            val allTextContent = "$text $contentDescription"
            if (allTextContent.isNotEmpty() && containsBlockedUrl(allTextContent)) {
                Log.w(TAG, "🚫 Blocking content containing blocked domain: $allTextContent")
                blockCurrentContent("Blocked inappropriate content detected")
                contentFilterManager.incrementBlockedAttempts()
                return
            }

            // Recursively check child nodes (but limit depth to prevent crashes)
            for (i in 0 until minOf(node.childCount, 10)) {
                try {
                    val child = node.getChild(i)
                    if (child != null) {
                        checkNodeForUrls(child)
                        // Note: recycle() is deprecated and no longer needed in modern Android
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking child node $i", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in checkNodeForUrls", e)
        }
    }

    private fun containsUrlPattern(text: String): Boolean {
        // Check for common URL patterns
        val urlPatterns = listOf(
            "http://", "https://", "www.", ".com", ".org", ".net", ".edu",
            "porn", "sex", "xxx", "adult", "nude", "naked"
        )

        return urlPatterns.any { pattern ->
            text.contains(pattern, ignoreCase = true)
        }
    }

    private fun containsExplicitContent(text: String): Boolean {
        // Check for explicit content keywords
        val explicitKeywords = listOf(
            "porn", "sex", "fuck", "shit", "damn", "bitch", "asshole",
            "nude", "naked", "tits", "pussy", "dick", "cock", "cum",
            "xxx", "adult", "erotic", "fetish", "cam girl", "webcam",
            "strip", "masturbat", "orgasm", "blowjob", "handjob"
        )

        return explicitKeywords.any { keyword ->
            text.contains(keyword, ignoreCase = true)
        }
    }

    private fun containsBlockedUrl(text: String): Boolean {
        Log.d(TAG, "🔍 Checking text for blocked domains (text length: ${text.length})")
        Log.d(TAG, "🔍 Text sample: ${text.take(100)}...")

        val lowerText = text.lowercase()

        // Check against comprehensive CSV data (3000+ URLs and domains)
        val blockedDomains = BlockedContent.domains + BlockedContent.domains.map { "www.$it" }
        val blockedUrls = BlockedContent.urls

        // Check if text contains any blocked domain or URL (comprehensive matching)
        for (domain in blockedDomains) {
            if (lowerText.contains(domain)) {
                Log.w(TAG, "🚫 BLOCKED DOMAIN DETECTED: '$domain' found in: $lowerText")
                return true
            }
        }
        
        // Also check against full URLs for more comprehensive blocking
        for (url in blockedUrls) {
            if (lowerText.contains(url.lowercase())) {
                Log.w(TAG, "🚫 BLOCKED URL DETECTED: '$url' found in: $lowerText")
                return true
            }
        }

        // Also check custom blocked domains from storage
        try {
            val customDomains = contentFilterManager.getBlockedDomains()
            for (domain in customDomains) {
                if (lowerText.contains(domain.lowercase())) {
                    Log.w(TAG, "🚫 CUSTOM BLOCKED DOMAIN DETECTED: '$domain' found in: $lowerText")
                    return true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking custom blocked domains", e)
        }

        return false
    }

    private fun extractDomain(url: String): String {
        return try {
            val cleanUrl = if (url.startsWith("http")) url else "https://$url"
            val uri = Uri.parse(cleanUrl)
            uri.host ?: url
        } catch (e: Exception) {
            url
        }
    }

    private fun handleUserInteraction(event: AccessibilityEvent) {
        try {
            if (!isServiceReady || !contentFilterManager.shouldMonitorApp(currentPackage)) return

            // Simple check on the event text without deep node traversal
            event.text.forEach { text ->
                if (containsInappropriateText(text.toString())) {
                    blockCurrentContent("Inappropriate content interaction blocked")
                    contentFilterManager.incrementFlaggedContent()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in handleUserInteraction", e)
        }
    }

    private fun isInappropriateUrl(url: String): Boolean {
        return INAPPROPRIATE_PATTERNS.any { pattern ->
            pattern.matcher(url).matches()
        }
    }

    private fun containsInappropriateText(text: String): Boolean {
        return INAPPROPRIATE_TEXT_PATTERNS.any { pattern ->
            pattern.matcher(text).matches()
        }
    }

    private fun blockCurrentApp(message: String) {
        Log.d(TAG, "Blocking current app: $message")
        try {
            contentFilterManager.showContentOverlay(message)
            // Try to go home
            performGlobalAction(GLOBAL_ACTION_HOME)
        } catch (e: Exception) {
            Log.e(TAG, "Error blocking current app", e)
        }
    }

    private fun blockCurrentContent(message: String) {
        Log.d(TAG, "Blocking current content: $message")
        try {
            // Track which package was blocked for overlay management
            if (contentFilterManager.isBrowserApp(currentPackage)) {
                lastBlockedPackage = currentPackage
                Log.d(TAG, "📝 Recorded blocked package: $lastBlockedPackage")
            }

            if (contentFilterManager.showContentOverlay(message)) {
                isBrowserInForeground = true
                startOverlayCheck()
                Log.d(TAG, "Overlay shown and periodic check started")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error blocking current content", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Content Filter Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors content for inappropriate material"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PureHeart Content Filter")
            .setContentText("Monitoring content for accountability")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onInterrupt() {
        Log.d(TAG, "ContentFilterAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        stopOverlayCheck()
        Log.d(TAG, "ContentFilterAccessibilityService destroyed")
    }
}
