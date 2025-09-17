# WebView Browser with Screenshot Monitoring Implementation

## Overview

This implementation creates a secure WebView browser for both Android and iOS that automatically captures screenshots every 30 seconds and sends them to your `/api/screenshots/scrutinized` endpoint for content analysis.

## Features

- **Full-featured WebView browser** with navigation controls
- **Automatic screenshot capture** every 30 seconds
- **Batch processing** of screenshots for efficiency
- **Real-time content filtering** integration
- **Native modules** for optimal performance
- **Cross-platform** support (Android & iOS)

## Components

### 1. WebView Browser Screen (`/src/screens/WebViewBrowserScreen.tsx`)

A complete browser interface with:
- URL bar with search functionality
- Navigation controls (back, forward, refresh, home)
- Progress indicator
- Screenshot capture integration
- App state handling for background screenshots

### 2. Screenshot Service (`/src/services/ScreenshotService.ts`)

Manages screenshot capture and API communication:
- Automatic screenshot scheduling
- Queue management and batching
- Error handling and retry logic
- App state change handling
- Event emission for debugging

### 3. Android Native Module

**Files:**
- `/android/app/src/main/java/com/pureheart/webviewscreenshot/WebViewScreenshotManagerModule.kt`
- `/android/app/src/main/java/com/pureheart/webviewscreenshot/WebViewScreenshotManagerPackage.kt`

**Features:**
- Kotlin-based native implementation
- Automatic WebView detection
- Bitmap to Base64 conversion
- OkHttp for network requests
- Coroutines for async operations

### 4. iOS Native Module

**Files:**
- `/ios/PureHeart/WebViewScreenshotManager.swift`
- `/ios/PureHeart/WebViewScreenshotManager.m`

**Features:**
- Swift-based native implementation
- WKWebView snapshot capture
- URLSession for network requests
- Queue management on background threads
- Memory-efficient image processing

## API Integration

Screenshots are sent in batches to your endpoint:

```typescript
POST /api/screenshots/scrutinized
Content-Type: application/json
Authorization: Bearer <token>

{
  "images": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    // ... up to 5 images per batch
  ]
}
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install React Native WebView if not already installed
npm install react-native-webview

# Install AsyncStorage for token management
npm install @react-native-async-storage/async-storage

# Install vector icons if not already installed
npm install react-native-vector-icons
```

### 2. Android Setup

The native modules are already registered in `MainApplication.kt`. Make sure to:

1. Add required permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

2. Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3. iOS Setup

1. Add the Swift and Objective-C files to your Xcode project
2. Ensure WebKit framework is linked
3. Clean and rebuild:
```bash
cd ios
rm -rf build
pod install
cd ..
npx react-native run-ios
```

### 4. Navigation Setup

The Browse Safely tab has been added to `TabNavigator.tsx`. Users can access it from the bottom tab bar.

## Configuration

### 1. API Endpoint

Update the API endpoint in both native modules and the service:

```typescript
// In ScreenshotService.ts
screenshotService.initialize('https://your-api-endpoint.com');
```

```kotlin
// In WebViewScreenshotManagerModule.kt
private const val API_ENDPOINT = "https://your-api-endpoint.com/api/screenshots/scrutinized"
```

```swift
// In WebViewScreenshotManager.swift
private let apiEndpoint = "https://your-api-endpoint.com/api/screenshots/scrutinized"
```

### 2. Screenshot Interval

Default is 30 seconds, but can be adjusted:

```typescript
// In WebViewBrowserScreen.tsx
screenshotIntervalRef.current = screenshotService.startAutomaticCapture(30000); // 30 seconds
```

### 3. Batch Size

Default is 5 screenshots per batch, configurable in native modules:

```kotlin
// Android
private const val BATCH_SIZE = 5
```

```swift
// iOS
private let batchSize = 5
```

## Usage

1. **User opens the app**
2. **Clicks "Browse Safely" tab**
3. **WebView browser opens with Google homepage**
4. **Screenshots captured automatically every 30 seconds**
5. **Screenshots batched and sent to your API for analysis**
6. **Content filtering works in real-time**

## Event Handling

The native modules emit events for debugging and monitoring:

```typescript
// Listen to screenshot events
screenshotService.eventEmitter?.addListener('screenshot_captured', (message) => {
  console.log('Screenshot captured:', message);
});

screenshotService.eventEmitter?.addListener('screenshots_sent', (message) => {
  console.log('Screenshots sent:', message);
});

screenshotService.eventEmitter?.addListener('screenshot_error', (error) => {
  console.error('Screenshot error:', error);
});
```

## Error Handling

- **WebView not found**: Automatic fallback detection
- **Network errors**: Queued for retry
- **Memory issues**: Automatic cleanup and optimization
- **App backgrounding**: Automatic flush of pending screenshots

## Security Considerations

- Screenshots are captured in JPEG format with 80% compression
- Images are Base64 encoded for secure transmission
- Auth tokens are automatically included in API requests
- Queue is cleared when app is backgrounded for privacy

## Performance Optimization

- **Batch processing** reduces API calls
- **Background threading** prevents UI blocking
- **Memory management** with automatic cleanup
- **Compression** reduces network usage
- **Queue management** prevents memory buildup

## Testing

1. **Open Browse Safely tab**
2. **Navigate to any website**
3. **Check console logs** for screenshot capture events
4. **Monitor network requests** to your API endpoint
5. **Verify screenshot analysis** in your backend

## Troubleshooting

### Android Issues:
- Ensure OkHttp dependency is properly added
- Check Proguard rules if using obfuscation
- Verify WebView is properly initialized

### iOS Issues:
- Ensure WebKit framework is linked
- Check Swift/Objective-C bridging header
- Verify WKWebView permissions

### General Issues:
- Check network connectivity
- Verify API endpoint accessibility
- Ensure auth tokens are valid
- Monitor memory usage for large batches

## Future Enhancements

- **Selective screenshot capture** based on content type
- **Local image analysis** before sending
- **Configurable quality settings**
- **Offline queue persistence**
- **Advanced filtering rules**
- **Real-time content blocking**

This implementation provides a robust foundation for secure browsing with accountability features while maintaining optimal performance and user experience.
