# Native Module Integration Guide

This guide explains how to integrate the required native modules for browser control and website blocking functionality.

## Required Native Modules

### 1. ContentFilterManager (Safari Content Blocker)

This module handles Safari content blocking functionality.

#### iOS Implementation Required

```objc
// ContentFilterManager.h
#import <React/RCTBridgeModule.h>
#import <SafariServices/SafariServices.h>

@interface ContentFilterManager : NSObject <RCTBridgeModule>
@end

// ContentFilterManager.m
#import "ContentFilterManager.h"
#import <React/RCTLog.h>

@implementation ContentFilterManager

RCT_EXPORT_MODULE();

// Check if content filter is enabled
RCT_EXPORT_METHOD(isFilterEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Implementation depends on your content blocker extension
    // This should check if your Safari Content Blocker extension is active
    resolve(@(YES)); // or @(NO) based on actual status
}

// Enable content filter
RCT_EXPORT_METHOD(enableFilter:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Open Settings to Safari Content Blockers
    NSURL *settingsURL = [NSURL URLWithString:@"App-prefs:SAFARI&path=Content%20Blockers"];
    if ([[UIApplication sharedApplication] canOpenURL:settingsURL]) {
        [[UIApplication sharedApplication] openURL:settingsURL 
                                           options:@{} 
                                 completionHandler:^(BOOL success) {
            resolve(@(success));
        }];
    } else {
        reject(@"settings_error", @"Cannot open Safari settings", nil);
    }
}

// Disable content filter
RCT_EXPORT_METHOD(disableFilter:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Implementation to disable your content blocker
    resolve(@(YES));
}

// Add blocked domain
RCT_EXPORT_METHOD(addBlockedDomain:(NSString *)domain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Add domain to your content blocker rules
    // This typically involves updating a JSON file that your content blocker reads
    NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.your.app.identifier"];
    NSMutableArray *blockedDomains = [[sharedDefaults arrayForKey:@"blockedDomains"] mutableCopy] ?: [[NSMutableArray alloc] init];
    
    if (![blockedDomains containsObject:domain]) {
        [blockedDomains addObject:domain];
        [sharedDefaults setObject:blockedDomains forKey:@"blockedDomains"];
        [sharedDefaults synchronize];
        resolve(@(YES));
    } else {
        resolve(@(NO)); // Already exists
    }
}

// Remove blocked domain
RCT_EXPORT_METHOD(removeBlockedDomain:(NSString *)domain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.your.app.identifier"];
    NSMutableArray *blockedDomains = [[sharedDefaults arrayForKey:@"blockedDomains"] mutableCopy] ?: [[NSMutableArray alloc] init];
    
    if ([blockedDomains containsObject:domain]) {
        [blockedDomains removeObject:domain];
        [sharedDefaults setObject:blockedDomains forKey:@"blockedDomains"];
        [sharedDefaults synchronize];
        resolve(@(YES));
    } else {
        resolve(@(NO)); // Doesn't exist
    }
}

// Get blocked domains
RCT_EXPORT_METHOD(getBlockedDomains:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.your.app.identifier"];
    NSArray *blockedDomains = [sharedDefaults arrayForKey:@"blockedDomains"] ?: @[];
    resolve(blockedDomains);
}

// Get default blocked domains
RCT_EXPORT_METHOD(getDefaultBlockedDomains:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Return your predefined list of blocked domains
    NSArray *defaultDomains = @[
        @"pornhub.com",
        @"xvideos.com", 
        @"redtube.com",
        @"youporn.com",
        // Add more default blocked domains
    ];
    resolve(defaultDomains);
}

// Reload content blocker
RCT_EXPORT_METHOD(reloadContentBlocker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Reload your Safari Content Blocker extension
    [SFContentBlockerManager reloadContentBlockerWithIdentifier:@"your.content.blocker.identifier" 
                                               completionHandler:^(NSError * _Nullable error) {
        if (error) {
            reject(@"reload_error", @"Failed to reload content blocker", error);
        } else {
            resolve(@(YES));
        }
    }];
}

@end
```

### 2. AppBlockingManagerBridge (Screen Time API)

This module handles Screen Time API for app blocking.

#### iOS Implementation Required

```objc
// AppBlockingManagerBridge.h
#import <React/RCTBridgeModule.h>
#import <FamilyControls/FamilyControls.h>
#import <ManagedSettings/ManagedSettings.h>

@interface AppBlockingManagerBridge : NSObject <RCTBridgeModule>
@end

// AppBlockingManagerBridge.m
#import "AppBlockingManagerBridge.h"
#import <React/RCTLog.h>

@implementation AppBlockingManagerBridge

RCT_EXPORT_MODULE();

// Show Family Activity Picker
RCT_EXPORT_METHOD(showFamilyActivityPicker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 16.0, *)) {
        dispatch_async(dispatch_get_main_queue(), ^{
            FamilyActivityPicker *picker = [[FamilyActivityPicker alloc] init];
            picker.headerText = @"Choose apps to block";
            picker.footerText = @"Select browsers and apps with built-in browsers to block";
            
            [picker presentFromViewController:[UIApplication sharedApplication].keyWindow.rootViewController 
                                     animated:YES 
                                   completion:^{
                // Handle picker result
                FamilyActivitySelection *selection = picker.selection;
                
                NSDictionary *result = @{
                    @"applicationCount": @(selection.applications.count),
                    @"categoryCount": @(selection.categories.count), 
                    @"totalCount": @(selection.applications.count + selection.categories.count),
                    @"hasSelection": @(selection.applications.count > 0 || selection.categories.count > 0)
                };
                
                resolve(result);
            }];
        });
    } else {
        reject(@"version_error", @"iOS 16.0 or later required", nil);
    }
}

// Get blocked apps
RCT_EXPORT_METHOD(getBlockedApps:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Return current blocking status
    // This should query your ManagedSettings configuration
    NSDictionary *result = @{
        @"applicationCount": @(0),
        @"categoryCount": @(0),
        @"totalCount": @(0),
        @"hasSelection": @(NO)
    };
    resolve(result);
}

// Clear all blocked apps
RCT_EXPORT_METHOD(clearAllBlockedApps:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 16.0, *)) {
        // Clear ManagedSettings configuration
        ManagedSettingsStore *store = [[ManagedSettingsStore alloc] init];
        [store clearAllSettings];
        resolve(@(YES));
    } else {
        reject(@"version_error", @"iOS 16.0 or later required", nil);
    }
}

@end
```

## Safari Content Blocker Extension

You'll also need a Safari Content Blocker extension that reads the blocked domains.

### Content Blocker Extension Structure

```
SafariContentBlocker/
├── Info.plist
├── SafariContentBlocker.swift
└── blockerData.json
```

#### SafariContentBlocker.swift

```swift
import Foundation
import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
    
    override func beginRequest(with context: NSExtensionContext) {
        // Generate content blocker rules from blocked domains
        generateContentBlockerRules { rules in
            let response = NSExtensionItem()
            response.attachments = [NSItemProvider(item: rules, typeIdentifier: "public.json")]
            context.completeRequest(returningItems: [response])
        }
    }
    
    private func generateContentBlockerRules(completion: @escaping (Data) -> Void) {
        // Read blocked domains from shared UserDefaults
        let sharedDefaults = UserDefaults(suiteName: "group.your.app.identifier")
        let blockedDomains = sharedDefaults?.array(forKey: "blockedDomains") as? [String] ?? []
        
        var rules: [[String: Any]] = []
        
        // Add rules for each blocked domain
        for domain in blockedDomains {
            let rule: [String: Any] = [
                "trigger": [
                    "url-filter": ".*\\(domain).*",
                    "resource-type": ["document"]
                ],
                "action": [
                    "type": "block"
                ]
            ]
            rules.append(rule)
        }
        
        // Convert to JSON
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: rules)
            completion(jsonData)
        } catch {
            print("Error generating rules: \\(error)")
            completion(Data())
        }
    }
}
```

## Integration Steps

### 1. Add Entitlements

Add these entitlements to your app:

```xml
<!-- ios/PureHeart/PureHeart.entitlements -->
<key>com.apple.developer.family-controls</key>
<true/>
<key>com.apple.security.application-groups</key>
<array>
    <string>group.your.app.identifier</string>
</array>
```

### 2. Update Info.plist

```xml
<!-- ios/PureHeart/Info.plist -->
<key>NSFamilyControlsUsageDescription</key>
<string>This app uses Screen Time controls to help you block distracting apps and stay focused on your spiritual journey.</string>
```

### 3. Link Native Modules

Make sure your native modules are properly linked in your React Native project.

### 4. Add App Groups

Create an App Group in Apple Developer Console and add it to both your main app and content blocker extension.

### 5. Content Blocker Extension Target

Add a Safari Content Blocker extension target to your iOS project.

## Testing

### Test Content Filter
1. Add a website to block list
2. Open Safari and try to visit the website
3. Verify it's blocked

### Test App Blocking  
1. Install alternative browsers (Chrome, Firefox)
2. Use the block browsers feature
3. Verify other browsers are blocked
4. Confirm Safari still works

## Troubleshooting

### Common Issues

1. **Content Blocker Not Working**
   - Check App Group configuration
   - Verify extension is enabled in Safari settings
   - Check JSON rules format

2. **Screen Time Permission Denied**
   - Ensure proper entitlements
   - Check iOS version (16.0+ required)
   - Verify Family Controls permission

3. **Native Module Not Found**
   - Check native module linking
   - Verify module exports
   - Check import statements

### Debug Commands

```bash
# Check if modules are linked
npx react-native info

# Clear cache and rebuild
npx react-native start --reset-cache

# Rebuild iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## Security Considerations

1. Use App Groups for secure data sharing
2. Validate all user input before processing
3. Handle permissions gracefully
4. Follow Apple's Family Controls guidelines
5. Respect user privacy and data protection

## App Store Submission

1. Content Blocker extensions require review
2. Family Controls require special approval
3. Provide clear privacy policy
4. Explain Screen Time usage in app description
5. Include proper usage descriptions in Info.plist

This implementation provides a comprehensive browser control and website blocking system that leverages iOS's built-in security features while maintaining a user-friendly experience.
