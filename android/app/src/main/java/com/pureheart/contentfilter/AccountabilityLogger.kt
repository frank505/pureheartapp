package com.pureheart.contentfilter

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

data class ContentBlockEvent(
    val timestamp: Long,
    val type: String, // "domain", "app", "content", "social_media"
    val target: String, // URL, app package, or content description
    val action: String, // "blocked", "flagged", "allowed_with_warning"
    val reason: String,
    val appContext: String = "" // Which app/browser this occurred in
)

data class AccountabilityReport(
    val startDate: Long,
    val endDate: Long,
    val totalBlocked: Int,
    val totalFlagged: Int,
    val socialMediaBlocked: Int,
    val inappropriateContentBlocked: Int,
    val events: List<ContentBlockEvent>
)

class AccountabilityLogger(private val context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "accountability_logs", Context.MODE_PRIVATE
    )
    
    companion object {
        private const val TAG = "AccountabilityLogger"
        private const val EVENTS_KEY = "logged_events"
        private const val MAX_EVENTS = 1000 // Keep last 1000 events
        
        // Event types
        const val TYPE_DOMAIN_BLOCK = "domain"
        const val TYPE_APP_BLOCK = "app"
        const val TYPE_CONTENT_FLAG = "content"
        const val TYPE_SOCIAL_MEDIA = "social_media"
        
        // Actions
        const val ACTION_BLOCKED = "blocked"
        const val ACTION_FLAGGED = "flagged"
        const val ACTION_WARNING = "allowed_with_warning"
    }
    
    fun logEvent(
        type: String,
        target: String,
        action: String,
        reason: String,
        appContext: String = ""
    ) {
        val event = ContentBlockEvent(
            timestamp = System.currentTimeMillis(),
            type = type,
            target = target,
            action = action,
            reason = reason,
            appContext = appContext
        )
        
        saveEvent(event)
        Log.d(TAG, "Logged event: $type - $target - $action")
    }
    
    private fun saveEvent(event: ContentBlockEvent) {
        try {
            val events = getStoredEvents().toMutableList()
            events.add(event)
            
            // Keep only the last MAX_EVENTS
            if (events.size > MAX_EVENTS) {
                events.removeAt(0)
            }
            
            // Convert to JSON and save
            val jsonArray = JSONArray()
            events.forEach { evt ->
                val jsonEvent = JSONObject().apply {
                    put("timestamp", evt.timestamp)
                    put("type", evt.type)
                    put("target", evt.target)
                    put("action", evt.action)
                    put("reason", evt.reason)
                    put("appContext", evt.appContext)
                }
                jsonArray.put(jsonEvent)
            }
            
            prefs.edit().putString(EVENTS_KEY, jsonArray.toString()).apply()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error saving event", e)
        }
    }
    
    private fun getStoredEvents(): List<ContentBlockEvent> {
        return try {
            val eventsJson = prefs.getString(EVENTS_KEY, "[]") ?: "[]"
            val jsonArray = JSONArray(eventsJson)
            
            val events = mutableListOf<ContentBlockEvent>()
            for (i in 0 until jsonArray.length()) {
                val jsonEvent = jsonArray.getJSONObject(i)
                val event = ContentBlockEvent(
                    timestamp = jsonEvent.getLong("timestamp"),
                    type = jsonEvent.getString("type"),
                    target = jsonEvent.getString("target"),
                    action = jsonEvent.getString("action"),
                    reason = jsonEvent.getString("reason"),
                    appContext = jsonEvent.optString("appContext", "")
                )
                events.add(event)
            }
            
            events
        } catch (e: Exception) {
            Log.e(TAG, "Error loading events", e)
            emptyList()
        }
    }
    
    fun generateReport(daysBack: Int = 7): AccountabilityReport {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - (daysBack * 24 * 60 * 60 * 1000L)
        
        val allEvents = getStoredEvents()
        val filteredEvents = allEvents.filter { it.timestamp >= startTime }
        
        val totalBlocked = filteredEvents.count { it.action == ACTION_BLOCKED }
        val totalFlagged = filteredEvents.count { it.action == ACTION_FLAGGED }
        val socialMediaBlocked = filteredEvents.count { 
            it.type == TYPE_SOCIAL_MEDIA && it.action == ACTION_BLOCKED 
        }
        val inappropriateContentBlocked = filteredEvents.count {
            (it.type == TYPE_DOMAIN_BLOCK || it.type == TYPE_CONTENT_FLAG) && it.action == ACTION_BLOCKED
        }
        
        return AccountabilityReport(
            startDate = startTime,
            endDate = endTime,
            totalBlocked = totalBlocked,
            totalFlagged = totalFlagged,
            socialMediaBlocked = socialMediaBlocked,
            inappropriateContentBlocked = inappropriateContentBlocked,
            events = filteredEvents.sortedByDescending { it.timestamp }
        )
    }
    
    fun getReportJson(daysBack: Int = 7): String {
        return try {
            val report = generateReport(daysBack)
            val json = JSONObject().apply {
                put("startDate", report.startDate)
                put("endDate", report.endDate)
                put("totalBlocked", report.totalBlocked)
                put("totalFlagged", report.totalFlagged)
                put("socialMediaBlocked", report.socialMediaBlocked)
                put("inappropriateContentBlocked", report.inappropriateContentBlocked)
                
                val eventsArray = JSONArray()
                report.events.forEach { event ->
                    val eventJson = JSONObject().apply {
                        put("timestamp", event.timestamp)
                        put("type", event.type)
                        put("target", event.target)
                        put("action", event.action)
                        put("reason", event.reason)
                        put("appContext", event.appContext)
                        put("formattedTime", formatTimestamp(event.timestamp))
                    }
                    eventsArray.put(eventJson)
                }
                put("events", eventsArray)
            }
            
            json.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error generating report JSON", e)
            "{\"error\": \"Failed to generate report\"}"
        }
    }
    
    private fun formatTimestamp(timestamp: Long): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        return dateFormat.format(Date(timestamp))
    }
    
    fun clearOldEvents(daysToKeep: Int = 30) {
        try {
            val cutoffTime = System.currentTimeMillis() - (daysToKeep * 24 * 60 * 60 * 1000L)
            val events = getStoredEvents().filter { it.timestamp >= cutoffTime }
            
            val jsonArray = JSONArray()
            events.forEach { evt ->
                val jsonEvent = JSONObject().apply {
                    put("timestamp", evt.timestamp)
                    put("type", evt.type)
                    put("target", evt.target)
                    put("action", evt.action)
                    put("reason", evt.reason)
                    put("appContext", evt.appContext)
                }
                jsonArray.put(jsonEvent)
            }
            
            prefs.edit().putString(EVENTS_KEY, jsonArray.toString()).apply()
            Log.d(TAG, "Cleared old events, kept ${events.size} recent events")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing old events", e)
        }
    }
    
    fun getEventCount(): Int {
        return getStoredEvents().size
    }
    
    fun getEventsByType(type: String, daysBack: Int = 7): List<ContentBlockEvent> {
        val cutoffTime = System.currentTimeMillis() - (daysBack * 24 * 60 * 60 * 1000L)
        return getStoredEvents()
            .filter { it.timestamp >= cutoffTime && it.type == type }
            .sortedByDescending { it.timestamp }
    }
    
    fun getMostBlockedDomains(limit: Int = 10, daysBack: Int = 7): Map<String, Int> {
        val cutoffTime = System.currentTimeMillis() - (daysBack * 24 * 60 * 60 * 1000L)
        val domainEvents = getStoredEvents()
            .filter { 
                it.timestamp >= cutoffTime && 
                it.type == TYPE_DOMAIN_BLOCK && 
                it.action == ACTION_BLOCKED 
            }
        
        val domainCounts = domainEvents
            .groupBy { it.target }
            .mapValues { it.value.size }
            .toList()
            .sortedByDescending { it.second }
            .take(limit)
            .toMap()
        
        return domainCounts
    }
    
    fun getMostBlockedApps(limit: Int = 10, daysBack: Int = 7): Map<String, Int> {
        val cutoffTime = System.currentTimeMillis() - (daysBack * 24 * 60 * 60 * 1000L)
        val appEvents = getStoredEvents()
            .filter { 
                it.timestamp >= cutoffTime && 
                (it.type == TYPE_APP_BLOCK || it.type == TYPE_SOCIAL_MEDIA) && 
                it.action == ACTION_BLOCKED 
            }
        
        val appCounts = appEvents
            .groupBy { it.target }
            .mapValues { it.value.size }
            .toList()
            .sortedByDescending { it.second }
            .take(limit)
            .toMap()
        
        return appCounts
    }
    
    // Helper methods for specific event types
    fun logDomainBlock(domain: String, reason: String, browser: String = "") {
        logEvent(TYPE_DOMAIN_BLOCK, domain, ACTION_BLOCKED, reason, browser)
    }
    
    fun logAppBlock(appPackage: String, appName: String, reason: String) {
        logEvent(TYPE_APP_BLOCK, "$appName ($appPackage)", ACTION_BLOCKED, reason)
    }
    
    fun logSocialMediaBlock(appPackage: String, appName: String) {
        logEvent(TYPE_SOCIAL_MEDIA, "$appName ($appPackage)", ACTION_BLOCKED, "Social media app blocked")
    }
    
    fun logContentFlag(content: String, reason: String, appContext: String = "") {
        // Truncate content for logging
        val truncatedContent = if (content.length > 100) {
            content.take(100) + "..."
        } else {
            content
        }
        logEvent(TYPE_CONTENT_FLAG, truncatedContent, ACTION_FLAGGED, reason, appContext)
    }
}
