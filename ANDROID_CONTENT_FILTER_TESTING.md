/**
 * Android Content Filter Testing Guide
 * 
 * This file contains instructions for testing the Android content filtering implementation.
 */

## Testing the Android Content Filter Implementation

### Prerequisites
1. Android device or emulator running Android 5.0+ (API level 21+)
2. PureHeart app installed with the new Android content filter module
3. Access to device settings for permission granting

### Step 1: Build and Install
```bash
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Step 2: Permission Setup
1. Open the PureHeart app
2. Navigate to the Android Content Filter screen
3. Grant required permissions:
   - **Accessibility Service**: Settings → Accessibility → PureHeart → Enable
   - **Usage Access**: Settings → Apps → Special Access → Usage Access → PureHeart → Enable  
   - **Display Over Other Apps**: Settings → Apps → Special Access → Display Over Other Apps → PureHeart → Enable

### Step 3: Content Filter Testing

#### Browser Content Filtering
1. Enable the content filter in the app
2. Open Chrome, Firefox, or any browser
3. Try to navigate to blocked domains:
   - pornhub.com
   - xvideos.com
   - Any custom domains you added
4. **Expected Result**: Overlay should appear blocking the content

#### Social Media App Blocking
1. Enable social media blocking
2. Try to open:
   - Instagram
   - TikTok
   - Facebook
   - Twitter
3. **Expected Result**: App should be blocked and user sent to home screen

#### JavaScript Injection Testing
1. Navigate to a website with inappropriate keywords in the content
2. **Expected Result**: Content should be detected and blocked with overlay

### Step 4: Monitoring and Logging
1. Check usage statistics in the app
2. Verify blocked attempts are being logged
3. Test accountability reporting functionality

### Step 5: Edge Cases
1. Test private browsing/incognito mode
2. Test with different browsers
3. Test rapid app switching
4. Test with split-screen mode

### Expected Behavior Summary

✅ **Browsers (Chrome, Firefox, etc.)**
- Allowed to open
- Content monitored in real-time
- Inappropriate content blocked with overlay
- URL changes detected and filtered

✅ **Social Media Apps (Instagram, TikTok, etc.)**
- Completely blocked from opening
- User redirected to home screen
- Attempts logged for accountability

✅ **Content Detection**
- JavaScript injection for real-time scanning
- OCR-like text analysis for inappropriate keywords
- Domain-based blocking
- Custom domain additions

✅ **Accountability Features**
- All attempts logged with timestamps
- Usage statistics tracking
- Report generation for accountability partners
- Persistent storage of events

### Troubleshooting

#### Issue: Accessibility service not working
- Ensure accessibility permission is properly granted
- Check if service is running in Android Settings → Accessibility
- Restart the app after granting permissions

#### Issue: Overlays not showing
- Verify "Display over other apps" permission is granted
- Check if battery optimization is disabled for the app
- Test on different Android versions

#### Issue: Social media apps not blocked
- Ensure usage access permission is granted
- Check if the app is using the correct package names
- Verify the monitoring service is running

#### Issue: Browser content not filtered
- Check if JavaScript injection is working
- Verify WebView compatibility
- Test with different browsers

### Performance Considerations
- The accessibility service runs continuously but with minimal CPU usage
- JavaScript injection only occurs in browser WebViews
- Logging is optimized to prevent excessive storage usage
- Overlay service only activates when inappropriate content is detected

### Privacy and Security
- All monitoring happens locally on the device
- No data is sent to external servers without user consent
- Accountability logs are stored locally and only shared when explicitly requested
- No personal browsing data is stored beyond blocked attempts

This implementation provides comprehensive content filtering for Android that matches and exceeds the iOS Safari content blocker functionality.
