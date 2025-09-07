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
}

// Get the native module
const { ContentFilterManager } = NativeModules;

// Check if the native module is available
const isNativeModuleAvailable = Platform.OS === 'ios' && ContentFilterManager != null;

// Create a dummy implementation for Android or when native module is not available
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
};

// Use the actual implementation only on iOS when the module is available
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
};
