package com.pureheart.contentfilter

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.pureheart.R

class ContentOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var isOverlayShowing = false
    private var currentMessage: String = ""
    
    companion object {
        private const val TAG = "ContentOverlayService"
        private const val NOTIFICATION_ID = 1003
        private const val CHANNEL_ID = "content_overlay_service"
        private const val STOP_FOREGROUND_REMOVE = 1
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        Log.d(TAG, "ContentOverlayService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val message = intent?.getStringExtra("message") ?: "Content blocked by PureHeart"
        
        Log.d(TAG, "🛡️ ContentOverlayService onStartCommand called with message: $message")
        
        if (intent?.action == "HIDE_OVERLAY") {
            Log.d(TAG, "🛡️ Hiding overlay")
            hideOverlay()
        } else {
            Log.d(TAG, "🛡️ Showing overlay")
            showOverlay(message)
        }
        
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun showOverlay(message: String) {
        // If overlay is already showing with the same message, don't hide and reshow
        if (isOverlayShowing && currentMessage == message) {
            Log.d(TAG, "🛡️ Overlay already showing with same message, skipping")
            return
        }

        // Hide existing overlay if showing different message
        if (isOverlayShowing) {
            hideOverlay()
        }

        try {
            Log.d(TAG, "🛡️ Attempting to show overlay with message: $message")
            currentMessage = message

            // Check if we have overlay permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!android.provider.Settings.canDrawOverlays(this)) {
                    Log.e(TAG, "🛡️ ERROR: Overlay permission not granted!")
                    return
                }
            }

            // Start as foreground service
            startForeground(NOTIFICATION_ID, createNotification())

            // Create overlay view
            overlayView = createOverlayView(message)

            if (overlayView == null) {
                Log.e(TAG, "🛡️ ERROR: Failed to create overlay view")
                return
            }

            // Set up window parameters
            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                } else {
                    @Suppress("DEPRECATION")
                    WindowManager.LayoutParams.TYPE_PHONE
                },
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                PixelFormat.TRANSLUCENT
            )

            params.gravity = Gravity.TOP or Gravity.START

            // Add overlay to window manager
            windowManager?.addView(overlayView, params)
            isOverlayShowing = true

            Log.d(TAG, "🛡️ Overlay successfully shown with message: $message")

        } catch (e: Exception) {
            Log.e(TAG, "🛡️ Error showing overlay", e)
            e.printStackTrace()
        }
    }

    private fun hideOverlay() {
        try {
            if (isOverlayShowing && overlayView != null) {
                windowManager?.removeView(overlayView)
                overlayView = null
                isOverlayShowing = false
                currentMessage = ""
                Log.d(TAG, "Overlay hidden")
            }
            
            stopForeground(Service.STOP_FOREGROUND_REMOVE)
            stopSelf()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error hiding overlay", e)
        }
    }

    private fun createOverlayView(message: String): View {
        try {
            Log.d(TAG, "🛡️ Creating overlay view with message: $message")

            val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
            val overlayView = inflater.inflate(R.layout.content_block_overlay, null)

            if (overlayView == null) {
                Log.e(TAG, "🛡️ ERROR: Inflater returned null view")
                return createFallbackOverlay(message)
            }

            // Set message
            val messageText = overlayView.findViewById<TextView>(R.id.block_message)
            if (messageText != null) {
                messageText.text = message
                Log.d(TAG, "🛡️ Message text set successfully")
            } else {
                Log.e(TAG, "🛡️ ERROR: Could not find block_message TextView")
            }

            Log.d(TAG, "🛡️ Overlay view created successfully")
            return overlayView

        } catch (e: Exception) {
            Log.e(TAG, "🛡️ Error creating overlay view", e)
            return createFallbackOverlay(message)
        }
    }

    private fun createFallbackOverlay(message: String): View {
        Log.d(TAG, "🛡️ Creating fallback overlay")

        val textView = TextView(this).apply {
            text = message
            setBackgroundColor(android.graphics.Color.parseColor("#E6000000"))
            setTextColor(android.graphics.Color.WHITE)
            textSize = 20f
            gravity = android.view.Gravity.CENTER
            setPadding(50, 50, 50, 50)
        }

        // Remove click listener to make overlay non-interactive
        Log.d(TAG, "🛡️ Fallback overlay created (non-interactive)")

        return textView
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Content Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows content blocking overlays"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification() = NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("Content Blocked")
        .setContentText("Inappropriate content has been blocked")
        .setSmallIcon(R.mipmap.ic_launcher)
        .setPriority(NotificationCompat.PRIORITY_LOW)
        .setCategory(NotificationCompat.CATEGORY_SERVICE)
        .build()

    override fun onDestroy() {
        super.onDestroy()
        hideOverlay()
        Log.d(TAG, "ContentOverlayService destroyed")
    }
}
