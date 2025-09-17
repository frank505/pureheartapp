# Safari Content Blocker Implementation - README

This document explains how the Safari Content Blocker has been integrated into the PureHeart app.

## Components and Integration

1. **Native Module:**
   - `ContentFilterManager.swift` - Swift implementation of the content blocker manager
   - `ContentFilterManager.m` - Objective-C bridge for React Native

2. **Extension:**
   - `SafariContentBlocker/` - Content blocker extension
   - `blockerList.json` - Content blocking rules

3. **React Native Integration:**
   - `src/services/contentFilter/ContentFilter.ts` - TypeScript interface to the native module
   - Integrated into `ProfileSettingsScreen.tsx` - UI for managing content filter

## How it Works

The Safari Content Blocker allows the app to block adult content in Safari on iOS devices. It:

1. Uses a Safari Content Blocker extension to filter web content
2. Provides UI in the app settings to enable/disable the filter
3. Allows users to manage custom domain blocklists
4. Persists settings using App Groups for sharing between the main app and extension

## Implementation Details

- The content filter is only available on iOS - Android implementation is a dummy
- Settings are persisted using UserDefaults with a shared App Group
- The UI is integrated into the Profile Settings screen
- The content filter can be toggled on/off, and users can manage their custom blocklist

## Manual Configuration Required

Some steps require manual configuration in Xcode:

1. Add the Content Blocker Extension target in Xcode
2. Configure App Groups for both the main app and extension
3. Add the Swift native module to the main app

See the `SAFARI_CONTENT_BLOCKER_GUIDE.md` for detailed instructions.
