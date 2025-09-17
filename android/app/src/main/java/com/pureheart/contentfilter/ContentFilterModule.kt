package com.pureheart.contentfilter

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ContentFilterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val contentFilterManager: ContentFilterManager by lazy {
        ContentFilterManager(reactContext)
    }

    override fun getName(): String {
        return "ContentFilterManager"
    }

    @ReactMethod
    fun isFilterEnabled(promise: Promise) {
        try {
            val isEnabled = contentFilterManager.isFilterEnabled()
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check filter status", e)
        }
    }

    @ReactMethod
    fun enableFilter(promise: Promise) {
        try {
            val result = contentFilterManager.enableFilter()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to enable filter", e)
        }
    }

    @ReactMethod
    fun forceEnableFilter(promise: Promise) {
        try {
            val result = contentFilterManager.forceEnableFilter()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to force enable filter", e)
        }
    }

    @ReactMethod
    fun testBlocking(promise: Promise) {
        try {
            // This will trigger the overlay to test if it's working
            val result = contentFilterManager.showContentOverlay("🚫 TEST BLOCK: Content filtering is working!")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to test blocking", e)
        }
    }

    @ReactMethod
    fun disableFilter(promise: Promise) {
        try {
            val result = contentFilterManager.disableFilter()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to disable filter", e)
        }
    }

    @ReactMethod
    fun reloadContentBlocker(promise: Promise) {
        try {
            val result = contentFilterManager.reloadContentBlocker()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to reload content blocker", e)
        }
    }

    @ReactMethod
    fun addBlockedDomain(domain: String, promise: Promise) {
        try {
            val result = contentFilterManager.addBlockedDomain(domain)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to add blocked domain", e)
        }
    }

    @ReactMethod
    fun removeBlockedDomain(domain: String, promise: Promise) {
        try {
            val result = contentFilterManager.removeBlockedDomain(domain)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to remove blocked domain", e)
        }
    }

    @ReactMethod
    fun getBlockedDomains(promise: Promise) {
        try {
            val domains = contentFilterManager.getBlockedDomains()
            val array = Arguments.createArray()
            domains.forEach { domain ->
                array.pushString(domain)
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get blocked domains", e)
        }
    }

    @ReactMethod
    fun getDefaultBlockedDomains(promise: Promise) {
        try {
            val domains = contentFilterManager.getDefaultBlockedDomains()
            val array = Arguments.createArray()
            domains.forEach { domain ->
                array.pushString(domain)
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get default blocked domains", e)
        }
    }

    @ReactMethod
    fun openContentBlockerSettings(promise: Promise) {
        try {
            val result = contentFilterManager.openContentBlockerSettings()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open settings", e)
        }
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        try {
            // Check both if permission is granted AND if service is running
            val hasPermission = contentFilterManager.checkAccessibilityPermission()
            val isRunning = contentFilterManager.isAccessibilityServiceRunning()
            
            android.util.Log.d("ContentFilterModule", "🔍 Accessibility Permission Check:")
            android.util.Log.d("ContentFilterModule", "   Permission granted: $hasPermission")
            android.util.Log.d("ContentFilterModule", "   Service running: $isRunning")
            
            // Return true only if both permission is granted AND service is running
            val result = hasPermission && isRunning
            android.util.Log.d("ContentFilterModule", "   Final result: $result")
            
            promise.resolve(result)
        } catch (e: Exception) {
            android.util.Log.e("ContentFilterModule", "Failed to check accessibility permission", e)
            promise.reject("ERROR", "Failed to check accessibility permission", e)
        }
    }

    @ReactMethod
    fun getAccessibilityDebugInfo(promise: Promise) {
        try {
            val enabledServices = android.provider.Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            val accessibilityEnabled = android.provider.Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                android.provider.Settings.Secure.ACCESSIBILITY_ENABLED
            )
            
            val debugInfo = WritableNativeMap().apply {
                putString("packageName", reactApplicationContext.packageName)
                putString("enabledServices", enabledServices ?: "null")
                putString("accessibilityEnabled", accessibilityEnabled ?: "null")
                putBoolean("hasPermission", contentFilterManager.checkAccessibilityPermission())
                putBoolean("isRunning", contentFilterManager.isAccessibilityServiceRunning())
            }
            
            android.util.Log.d("ContentFilterModule", "🐛 DEBUG INFO: $debugInfo")
            promise.resolve(debugInfo)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get debug info", e)
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val result = contentFilterManager.requestAccessibilityPermission()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to request accessibility permission", e)
        }
    }

    @ReactMethod
    fun checkUsageStatsPermission(promise: Promise) {
        try {
            val hasPermission = contentFilterManager.checkUsageStatsPermission()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check usage stats permission", e)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val result = contentFilterManager.requestUsageStatsPermission()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to request usage stats permission", e)
        }
    }

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            val hasPermission = contentFilterManager.checkOverlayPermission()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check overlay permission", e)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            val result = contentFilterManager.requestOverlayPermission()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to request overlay permission", e)
        }
    }

    @ReactMethod
    fun showContentOverlay(message: String, promise: Promise) {
        try {
            val result = contentFilterManager.showContentOverlay(message)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to show content overlay", e)
        }
    }

    @ReactMethod
    fun hideContentOverlay(promise: Promise) {
        try {
            val result = contentFilterManager.hideContentOverlay()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to hide content overlay", e)
        }
    }

    @ReactMethod
    fun blockSocialMediaApps(promise: Promise) {
        try {
            val result = contentFilterManager.blockSocialMediaApps()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to block social media apps", e)
        }
    }

    @ReactMethod
    fun unblockSocialMediaApps(promise: Promise) {
        try {
            val result = contentFilterManager.unblockSocialMediaApps()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to unblock social media apps", e)
        }
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val stats = contentFilterManager.getUsageStats()
            val map = Arguments.createMap()
            map.putInt("blockedAttempts", stats.blockedAttempts)
            map.putInt("flaggedContent", stats.flaggedContent)
            map.putDouble("lastActivity", stats.lastActivity.toDouble())
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get usage stats", e)
        }
    }

    // Send events to React Native
    fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
