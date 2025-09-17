package com.pureheart.webviewscreenshot

import android.graphics.Bitmap
import android.util.Base64
import android.view.View
import android.webkit.WebView
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentLinkedQueue

class WebViewScreenshotManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val screenshotQueue = ConcurrentLinkedQueue<String>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val client = OkHttpClient()
    private var currentWebView: WebView? = null
    
    companion object {
        private const val BATCH_SIZE = 5
        private const val API_ENDPOINT = "https://your-api-endpoint.com/api/screenshots/scrutinized"
        private const val MODULE_NAME = "WebViewScreenshotManager"
    }

    override fun getName(): String {
        return MODULE_NAME
    }

    @ReactMethod
    fun setWebView(webViewTag: Int) {
        UiThreadUtil.runOnUiThread {
            try {
                val webView = reactApplicationContext.getCurrentActivity()?.findViewById<WebView>(webViewTag)
                currentWebView = webView
            } catch (e: Exception) {
                sendEvent("screenshot_error", "Failed to set WebView: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun captureWebViewScreenshot(promise: Promise? = null) {
        UiThreadUtil.runOnUiThread {
            try {
                val webView = currentWebView
                if (webView == null) {
                    // Fallback: try to find WebView in current activity
                    val activity = reactApplicationContext.getCurrentActivity()
                    if (activity != null) {
                        val webViewFound = findWebViewInActivity(activity.findViewById(android.R.id.content))
                        if (webViewFound != null) {
                            currentWebView = webViewFound
                            captureScreenshotFromWebView(webViewFound, promise)
                        } else {
                            promise?.reject("NO_WEBVIEW", "WebView not found")
                            sendEvent("screenshot_error", "WebView not found")
                        }
                    } else {
                        promise?.reject("NO_ACTIVITY", "Activity not found")
                        sendEvent("screenshot_error", "Activity not found")
                    }
                } else {
                    captureScreenshotFromWebView(webView, promise)
                }
            } catch (e: Exception) {
                promise?.reject("CAPTURE_ERROR", "Failed to capture screenshot: ${e.message}")
                sendEvent("screenshot_error", "Failed to capture screenshot: ${e.message}")
            }
        }
    }

    private fun findWebViewInActivity(view: View): WebView? {
        if (view is WebView) {
            return view
        }
        if (view is android.view.ViewGroup) {
            for (i in 0 until view.childCount) {
                val child = view.getChildAt(i)
                val webView = findWebViewInActivity(child)
                if (webView != null) {
                    return webView
                }
            }
        }
        return null
    }

    private fun captureScreenshotFromWebView(webView: WebView, promise: Promise?) {
        try {
            // Create bitmap from WebView
            val bitmap = Bitmap.createBitmap(
                webView.width,
                webView.height,
                Bitmap.Config.ARGB_8888
            )
            
            val canvas = android.graphics.Canvas(bitmap)
            webView.draw(canvas)
            
            // Convert bitmap to base64
            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
            val byteArray = outputStream.toByteArray()
            val base64String = Base64.encodeToString(byteArray, Base64.DEFAULT)
            
            // Add to queue
            screenshotQueue.offer("data:image/jpeg;base64,$base64String")
            
            // Check if we should send batch
            if (screenshotQueue.size >= BATCH_SIZE) {
                sendScreenshotBatch()
            }
            
            promise?.resolve("Screenshot captured successfully")
            sendEvent("screenshot_captured", "Screenshot captured and queued")
            
            // Cleanup
            bitmap.recycle()
            outputStream.close()
            
        } catch (e: Exception) {
            promise?.reject("BITMAP_ERROR", "Failed to create bitmap: ${e.message}")
            sendEvent("screenshot_error", "Failed to create bitmap: ${e.message}")
        }
    }

    @ReactMethod
    fun sendScreenshotBatch(promise: Promise? = null) {
        coroutineScope.launch {
            try {
                val screenshots = mutableListOf<String>()
                
                // Drain the queue
                while (screenshots.size < BATCH_SIZE && screenshotQueue.isNotEmpty()) {
                    screenshotQueue.poll()?.let { screenshots.add(it) }
                }
                
                if (screenshots.isEmpty()) {
                    promise?.resolve("No screenshots to send")
                    return@launch
                }
                
                // Create JSON payload
                val jsonObject = JSONObject()
                val imagesArray = JSONArray()
                screenshots.forEach { imagesArray.put(it) }
                jsonObject.put("images", imagesArray)
                
                // Get auth token from React Native storage/context
                val authToken = getAuthToken()
                
                // Create request
                val requestBody = jsonObject.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url(API_ENDPOINT)
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .apply {
                        if (authToken.isNotEmpty()) {
                            addHeader("Authorization", "Bearer $authToken")
                        }
                    }
                    .build()
                
                // Execute request
                val response = client.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    promise?.resolve("Screenshots sent successfully: $responseBody")
                    sendEvent("screenshots_sent", "Batch of ${screenshots.size} screenshots sent successfully")
                } else {
                    val errorBody = response.body?.string()
                    promise?.reject("HTTP_ERROR", "HTTP ${response.code}: $errorBody")
                    sendEvent("screenshot_error", "Failed to send screenshots: HTTP ${response.code}")
                }
                
            } catch (e: Exception) {
                promise?.reject("NETWORK_ERROR", "Failed to send screenshots: ${e.message}")
                sendEvent("screenshot_error", "Network error: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun flushScreenshotQueue(promise: Promise) {
        coroutineScope.launch {
            try {
                val screenshots = mutableListOf<String>()
                
                // Drain all screenshots from queue
                while (screenshotQueue.isNotEmpty()) {
                    screenshotQueue.poll()?.let { screenshots.add(it) }
                }
                
                if (screenshots.isEmpty()) {
                    promise.resolve("No screenshots to flush")
                    return@launch
                }
                
                // Send in batches
                val batches = screenshots.chunked(BATCH_SIZE)
                var successCount = 0
                
                for (batch in batches) {
                    try {
                        val jsonObject = JSONObject()
                        val imagesArray = JSONArray()
                        batch.forEach { imagesArray.put(it) }
                        jsonObject.put("images", imagesArray)
                        
                        val authToken = getAuthToken()
                        val requestBody = jsonObject.toString().toRequestBody("application/json".toMediaType())
                        val request = Request.Builder()
                            .url(API_ENDPOINT)
                            .post(requestBody)
                            .addHeader("Content-Type", "application/json")
                            .apply {
                                if (authToken.isNotEmpty()) {
                                    addHeader("Authorization", "Bearer $authToken")
                                }
                            }
                            .build()
                        
                        val response = client.newCall(request).execute()
                        
                        if (response.isSuccessful) {
                            successCount += batch.size
                        }
                        
                    } catch (e: Exception) {
                        // Continue with next batch
                        sendEvent("screenshot_error", "Failed to send batch: ${e.message}")
                    }
                }
                
                promise.resolve("Flushed $successCount screenshots successfully")
                sendEvent("screenshots_flushed", "Flushed $successCount screenshots")
                
            } catch (e: Exception) {
                promise.reject("FLUSH_ERROR", "Failed to flush screenshots: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun getQueueSize(promise: Promise) {
        promise.resolve(screenshotQueue.size)
    }

    private fun getAuthToken(): String {
        // This should be implemented to get auth token from your app's storage
        // You can use SharedPreferences or get it from React Native bridge
        return ""
    }

    private fun sendEvent(eventName: String, data: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        coroutineScope.cancel()
    }
}
