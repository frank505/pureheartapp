import { NativeModules, Platform } from 'react-native';

interface ContentFilterManagerInterface {
  isFilterEnabled: () => Promise<boolean>;
  enableFilter: () => Promise<boolean>;
  disableFilter: () => Promise<boolean>;
  reloadContentBlocker: () => Promise<boolean>;
  addBlockedDomain: (domain: string) => Promise<boolean>;
  removeBlockedDomain: (domain: string) => Promise<boolean>;
  getBlockedDomains: () => Promise<string[]>;
  getDefaultBlockedDomains: () => Promise<string[]>;
  openContentBlockerSettings: () => Promise<boolean>;
  // Android-specific methods
  checkAccessibilityPermission?: () => Promise<boolean>;
  requestAccessibilityPermission?: () => Promise<boolean>;
  checkUsageStatsPermission?: () => Promise<boolean>;
  requestUsageStatsPermission?: () => Promise<boolean>;
  checkOverlayPermission?: () => Promise<boolean>;
  requestOverlayPermission?: () => Promise<boolean>;
  showContentOverlay?: (message: string) => Promise<boolean>;
  hideContentOverlay?: () => Promise<boolean>;
  blockSocialMediaApps?: () => Promise<boolean>;
  unblockSocialMediaApps?: () => Promise<boolean>;
  getUsageStats?: () => Promise<{blockedAttempts: number, flaggedContent: number, lastActivity: number}>;
  getAccessibilityDebugInfo?: () => Promise<{
    packageName: string;
    enabledServices: string;
    accessibilityEnabled: string;
    hasPermission: boolean;
    isRunning: boolean;
  }>;
}

// Get the native module
const { ContentFilterManager } = NativeModules;

// Check if the native module is available
const isNativeModuleAvailable = ContentFilterManager != null;

// Create a dummy implementation for when native module is not available
const DummyContentFilterManager: ContentFilterManagerInterface = {
  isFilterEnabled: () => Promise.resolve(false),
  enableFilter: () => Promise.resolve(false),
  disableFilter: () => Promise.resolve(false),
  reloadContentBlocker: () => Promise.resolve(false),
  addBlockedDomain: () => Promise.resolve(false),
  removeBlockedDomain: () => Promise.resolve(false),
  getBlockedDomains: () => Promise.resolve([]),
  getDefaultBlockedDomains: () => Promise.resolve([]),
  openContentBlockerSettings: () => Promise.resolve(false),
  // Android-specific dummy methods
  checkAccessibilityPermission: () => Promise.resolve(false),
  requestAccessibilityPermission: () => Promise.resolve(false),
  checkUsageStatsPermission: () => Promise.resolve(false),
  requestUsageStatsPermission: () => Promise.resolve(false),
  checkOverlayPermission: () => Promise.resolve(false),
  requestOverlayPermission: () => Promise.resolve(false),
  showContentOverlay: () => Promise.resolve(false),
  hideContentOverlay: () => Promise.resolve(false),
  blockSocialMediaApps: () => Promise.resolve(false),
  unblockSocialMediaApps: () => Promise.resolve(false),
  getUsageStats: () => Promise.resolve({blockedAttempts: 0, flaggedContent: 0, lastActivity: 0}),
  getAccessibilityDebugInfo: () => Promise.resolve({
    packageName: 'dummy',
    enabledServices: 'none',
    accessibilityEnabled: 'false',
    hasPermission: false,
    isRunning: false
  }),
};

// Use the actual implementation when the module is available
const ContentFilter: ContentFilterManagerInterface = isNativeModuleAvailable 
  ? ContentFilterManager 
  : DummyContentFilterManager;

export default {
  /**
   * Check if the Safari content filter is enabled
   * @returns Promise that resolves to true if enabled
   */
  isFilterEnabled: (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.isFilterEnabled();
  },

  /**
   * Open settings to enable the content filter
   * @returns Promise that resolves to true if settings opened successfully
   */
  enableFilter: (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.enableFilter();
  },

  /**
   * Disable the content filter
   * @returns Promise that resolves to true if disabled successfully
   */
  disableFilter: (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.disableFilter();
  },

  /**
   * Reload the content blocker to apply new rules
   * @returns Promise that resolves to true if reloaded successfully
   */
  reloadContentBlocker: (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.reloadContentBlocker();
  },

  /**
   * Add a domain to the blocklist
   * @param domain Domain to block
   * @returns Promise that resolves to true if added successfully
   */
  addBlockedDomain: (domain: string): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.addBlockedDomain(domain);
  },

  /**
   * Remove a domain from the blocklist
   * @param domain Domain to unblock
   * @returns Promise that resolves to true if removed successfully
   */
  removeBlockedDomain: (domain: string): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.removeBlockedDomain(domain);
  },

  /**
   * Get list of blocked domains
   * @returns Promise that resolves to array of blocked domain strings
   */
  getBlockedDomains: (): Promise<string[]> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve([]);
    }
    return ContentFilter.getBlockedDomains();
  },

  /**
   * Get list of default blocked domains
   * @returns Promise that resolves to array of default blocked domain strings
   */
  getDefaultBlockedDomains: (): Promise<string[]> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve([]);
    }
    return ContentFilter.getDefaultBlockedDomains();
  },

  /**
   * Open Safari Content Blocker settings
   * @returns Promise that resolves to true if settings opened successfully
   */
  openContentBlockerSettings: (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return Promise.resolve(false);
    }
    return ContentFilter.openContentBlockerSettings();
  },

  /**
   * Bulk add multiple domains to the blocklist
   * @param domains Array of domains to block
   * @returns Promise that resolves to number of successfully added domains
   */
  addMultipleBlockedDomains: async (domains: string[]): Promise<number> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return 0;
    }
    
    let successCount = 0;
    for (const domain of domains) {
      try {
        const success = await ContentFilter.addBlockedDomain(domain);
        if (success) successCount++;
      } catch (error) {
        console.error(`Failed to add domain ${domain}:`, error);
      }
    }
    
    // Reload content blocker after bulk operations
    try {
      await ContentFilter.reloadContentBlocker();
    } catch (error) {
      console.error('Failed to reload content blocker after bulk add:', error);
    }
    
    return successCount;
  },

  /**
   * Clear all custom blocked domains (keeps default ones)
   * @returns Promise that resolves to true if cleared successfully
   */
  clearCustomBlockedDomains: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return false;
    }
    
    try {
      const allDomains = await ContentFilter.getBlockedDomains();
      const defaultDomains = await ContentFilter.getDefaultBlockedDomains();
      
      // Find custom domains (ones not in default list)
      const customDomains = allDomains.filter(domain => !defaultDomains.includes(domain));
      
      // Remove custom domains
      for (const domain of customDomains) {
        await ContentFilter.removeBlockedDomain(domain);
      }
      
      // Reload content blocker
      await ContentFilter.reloadContentBlocker();
      
      return true;
    } catch (error) {
      console.error('Failed to clear custom blocked domains:', error);
      return false;
    }
  },

  /**
   * Get only custom blocked domains (excluding defaults)
   * @returns Promise that resolves to array of custom blocked domain strings
   */
  getCustomBlockedDomains: async (): Promise<string[]> => {
    if (!isNativeModuleAvailable) {
      console.warn('ContentFilterManager: Native module not available');
      return [];
    }
    
    try {
      const allDomains = await ContentFilter.getBlockedDomains();
      const defaultDomains = await ContentFilter.getDefaultBlockedDomains();
      
      // Return only custom domains
      return allDomains.filter(domain => !defaultDomains.includes(domain));
    } catch (error) {
      console.error('Failed to get custom blocked domains:', error);
      return [];
    }
  },

  // Android-specific methods
  /**
   * Check if accessibility permission is granted (Android only)
   * @returns Promise that resolves to true if permission is granted
   */
  checkAccessibilityPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.checkAccessibilityPermission?.() ?? false;
  },

  /**
   * Request accessibility permission (Android only)
   * @returns Promise that resolves to true if permission request was initiated
   */
  requestAccessibilityPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.requestAccessibilityPermission?.() ?? false;
  },

  /**
   * Get detailed accessibility service debug information (Android only)
   * @returns Promise that resolves to debug information object
   */
  getAccessibilityDebugInfo: async (): Promise<{
    packageName: string;
    enabledServices: string;
    accessibilityEnabled: string;
    hasPermission: boolean;
    isRunning: boolean;
  }> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return {
        packageName: 'not-android',
        enabledServices: 'not-available',
        accessibilityEnabled: 'false',
        hasPermission: false,
        isRunning: false
      };
    }
    return ContentFilter.getAccessibilityDebugInfo?.() ?? {
      packageName: 'error',
      enabledServices: 'error',
      accessibilityEnabled: 'error',
      hasPermission: false,
      isRunning: false
    };
  },

  /**
   * Check if usage stats permission is granted (Android only)
   * @returns Promise that resolves to true if permission is granted
   */
  checkUsageStatsPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.checkUsageStatsPermission?.() ?? false;
  },

  /**
   * Request usage stats permission (Android only)
   * @returns Promise that resolves to true if permission request was initiated
   */
  requestUsageStatsPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.requestUsageStatsPermission?.() ?? false;
  },

  /**
   * Check if overlay permission is granted (Android only)
   * @returns Promise that resolves to true if permission is granted
   */
  checkOverlayPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.checkOverlayPermission?.() ?? false;
  },

  /**
   * Request overlay permission (Android only)
   * @returns Promise that resolves to true if permission request was initiated
   */
  requestOverlayPermission: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.requestOverlayPermission?.() ?? false;
  },

  /**
   * Show content blocking overlay (Android only)
   * @param message Message to display on the overlay
   * @returns Promise that resolves to true if overlay was shown
   */
  showContentOverlay: async (message: string): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.showContentOverlay?.(message) ?? false;
  },

  /**
   * Hide content blocking overlay (Android only)
   * @returns Promise that resolves to true if overlay was hidden
   */
  hideContentOverlay: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.hideContentOverlay?.() ?? false;
  },

  /**
   * Block social media apps (Android only)
   * @returns Promise that resolves to true if social media apps were blocked
   */
  blockSocialMediaApps: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.blockSocialMediaApps?.() ?? false;
  },

  /**
   * Unblock social media apps (Android only)
   * @returns Promise that resolves to true if social media apps were unblocked
   */
  unblockSocialMediaApps: async (): Promise<boolean> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return false;
    }
    return ContentFilter.unblockSocialMediaApps?.() ?? false;
  },

  /**
   * Get usage statistics (Android only)
   * @returns Promise that resolves to usage stats object
   */
  getUsageStats: async (): Promise<{blockedAttempts: number, flaggedContent: number, lastActivity: number}> => {
    if (!isNativeModuleAvailable || Platform.OS !== 'android') {
      return {blockedAttempts: 0, flaggedContent: 0, lastActivity: 0};
    }
    return ContentFilter.getUsageStats?.() ?? {blockedAttempts: 0, flaggedContent: 0, lastActivity: 0};
  },

  /**
   * Check if all required permissions are granted (Android only)
   * @returns Promise that resolves to true if all permissions are granted
   */
  checkAllPermissions: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS permissions handled differently
    }

    try {
      const accessibility = await ContentFilter.checkAccessibilityPermission?.() ?? false;
      const usageStats = await ContentFilter.checkUsageStatsPermission?.() ?? false;
      const overlay = await ContentFilter.checkOverlayPermission?.() ?? false;
      
      return accessibility && usageStats && overlay;
    } catch (error) {
      console.error('Failed to check all permissions:', error);
      return false;
    }
  },

  /**
   * Request all required permissions (Android only)
   * @returns Promise that resolves to true if all permission requests were initiated
   */
  requestAllPermissions: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS permissions handled differently
    }

    try {
      await ContentFilter.requestAccessibilityPermission?.();
      await ContentFilter.requestUsageStatsPermission?.();
      await ContentFilter.requestOverlayPermission?.();
      return true;
    } catch (error) {
      console.error('Failed to request all permissions:', error);
      return false;
    }
  },

  /**
   * Get platform-specific instructions for enabling content filter
   * @returns String with platform-specific instructions
   */
  getSetupInstructions: (): string => {
    if (Platform.OS === 'ios') {
      return `To enable content filtering on iOS:

1. Open Settings app
2. Go to Screen Time
3. Tap 'Content & Privacy Restrictions'
4. Enable 'Content & Privacy Restrictions'
5. Tap 'Content Restrictions' → 'Web Content'
6. Select 'Limit Adult Websites'

For enhanced protection:
• Go to Safari settings and disable 'Private Browsing'
• Enable 'Block Pop-ups' in Safari settings`;
    } else {
      return `To enable content filtering on Android:

1. Grant Accessibility Permission:
   • Settings → Accessibility → PureHeart → Enable

2. Grant Usage Access Permission:
   • Settings → Apps → Special Access → Usage Access → PureHeart → Enable

3. Grant Display Over Other Apps:
   • Settings → Apps → Special Access → Display Over Other Apps → PureHeart → Enable

The app will monitor browser activity and block inappropriate content across all browsers and apps.`;
    }
  },
};
