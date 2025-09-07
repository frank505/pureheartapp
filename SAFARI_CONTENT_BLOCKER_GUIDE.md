# Safari Content Blocker Implementation Guide

This guide walks you through how the Safari Content Blocker has been implemented and what manual steps remain to complete the setup.

## Implementation Overview

1. ✅ Network Extensions capability added to main app target
2. ✅ App Group created: `group.com.pureheartapp.contentfilter`
3. ✅ Content Blocker extension structure created
4. ✅ Entitlements configured for both main app and extension
5. ✅ Native module bridge implemented
6. ✅ React Native components created for UI
7. ✅ JSON rules file created with common adult content domains

## Remaining Manual Steps in Xcode

Since some steps require direct interaction with Xcode's UI, you'll need to complete these manually:

### 1. Add the Content Blocker Extension Target to the Project

1. Open your React Native iOS project in Xcode
2. Go to File → New → Target
3. Select "Content Blocker Extension"
4. Name it "SafariContentBlocker"
5. Set the bundle identifier to match your app's identifier with .SafariContentBlocker appended
   (e.g., com.pureheartapp.SafariContentBlocker)
6. Choose the Swift language and create

### 2. Replace Generated Files with Our Custom Files

We've already created these files, but you'll need to manually replace the auto-generated files with our versions:
- SafariContentBlocker.entitlements
- Info.plist
- ContentBlockerRequestHandler.swift
- blockerList.json

### 3. Configure App Group in Xcode UI

1. Select your main app target
2. Go to the "Signing & Capabilities" tab
3. Verify that "App Groups" is in the list of capabilities
4. Make sure the app group "group.com.pureheartapp.contentfilter" is in the list

5. Select your SafariContentBlocker extension target
6. Go to the "Signing & Capabilities" tab
7. Click "+ Capability" button and add "App Groups"
8. Add the same app group: "group.com.pureheartapp.contentfilter"

### 4. Add Files to Main App

1. Add ContentFilterManager.swift and ContentFilterManager.m to your Xcode project:
   - In Xcode, right-click on your PureHeart folder
   - Select "Add Files to 'PureHeart'..."
   - Navigate to the ContentFilter folder and select both files
   - Make sure "Copy items if needed" is checked
   - Add to your main app target

### 5. Link the Extension with the Main App

1. In Xcode, select your main app target
2. Go to the "General" tab
3. Scroll down to the "Frameworks, Libraries, and Embedded Content" section
4. Click the "+" button
5. Select the SafariContentBlocker extension and add it

### 6. Update Bridging Header (if needed)

If your project uses Objective-C, make sure your bridging header includes:

```swift
#import <React/RCTBridgeModule.h>
```

## Testing the Implementation

1. Build and run your app on a physical device or simulator
2. Navigate to your content filter settings screen
3. Toggle the switch to enable content filtering
4. It should take you to iOS Settings where you can enable the extension
5. Add a test domain and verify it works in Safari

## Troubleshooting

- If the content blocker doesn't appear in Safari settings, make sure you've properly signed both targets
- If changes to block lists don't take effect, try reloading the content blocker and restarting Safari
- Check the console for any errors related to content blocking

## Best Practices

- Keep the blocklist.json file well-organized and manageable
- Consider categorizing domains for easier management
- Optimize rule patterns to avoid performance issues
- Provide clear user instructions about how Safari content blocking works
