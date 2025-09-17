import { AppBlocking, AppBlockingData } from './appBlocking';
import { Alert } from 'react-native';

/**
 * Service for managing browser app restrictions using Screen Time API
 * Specifically designed to block all browsers except Safari
 */
class BrowserBlockingService {
  
  /**
   * List of common browser bundle identifiers to block
   */
  private readonly BROWSER_BUNDLE_IDS = [
    'com.google.chrome.ios',           // Chrome
    'com.microsoft.msedge',            // Microsoft Edge
    'com.mozilla.ios.Firefox',        // Firefox
    'com.opera.OperaTouch',           // Opera
    'com.duckduckgo.mobile.ios',      // DuckDuckGo
    'com.brave.ios.browser',          // Brave
    'com.contextoptional.Orion',      // Orion
    'com.kagi.kagimobile',            // Kagi
    'com.readdle.smartbrowser',       // Readdle Browser
    'com.ghostery.GhosteryBrowser',   // Ghostery
    'com.cloudmosa.PuffinFree',       // Puffin
    'com.appsverse.iCabMobile',       // iCab
    'com.google.ios.youtube',         // YouTube app (contains browser)
    'com.facebook.Facebook',          // Facebook app (contains browser)
    'com.atebits.Tweetie2',          // Twitter app (contains browser)
    'com.burbn.instagram',            // Instagram app (contains browser)
    'com.spotify.client',             // Spotify app (contains browser)
    'com.reddit.Reddit',              // Reddit app (contains browser)
    'com.zhiliaoapp.musically',       // TikTok app (contains browser)
    'com.pinterest',                  // Pinterest app (contains browser)
    'com.linkedin.LinkedIn',          // LinkedIn app (contains browser)
    'com.medium.reader',              // Medium app (contains browser)
    'ph.telegra.Telegraph',           // Telegram app (contains browser)
    'net.whatsapp.WhatsApp',          // WhatsApp app (contains browser)
  ];

  /**
   * Browser category names that might be used in Screen Time
   */
  private readonly BROWSER_CATEGORIES = [
    'Web browsers',
    'Internet browsers',
    'Browsers',
    'Web & Internet',
    'Internet',
  ];

  /**
   * Block all browsers except Safari using Screen Time API
   * This will show the Family Activity Picker with browser-related apps pre-selected
   * @returns Promise<AppBlockingData | null>
   */
  async blockAllBrowsersExceptSafari(): Promise<AppBlockingData | null> {
    try {
      // Show the Family Activity Picker
      // Users will need to manually select browser apps and categories
      const result = await AppBlocking.showFamilyActivityPicker();
      
      if (result && result.hasSelection) {
        Alert.alert(
          'Browsers Blocked Successfully',
          `${result.totalCount} browser apps and categories have been blocked. Safari remains available for filtered browsing.`,
          [
            {
              text: 'OK',
              onPress: () => {
                Alert.alert(
                  'Important Reminder',
                  'Make sure to also enable the Safari Content Filter in the settings above to block inappropriate websites.',
                  [{ text: 'Got it' }]
                );
              }
            }
          ]
        );
      }
      
      return result;
    } catch (error) {
      console.error('Failed to block browsers:', error);
      throw error;
    }
  }

  /**
   * Get browser blocking instructions for the user
   * @returns Instructions for manually selecting browsers in the Family Activity Picker
   */
  getBrowserBlockingInstructions(): string {
    return `When the app picker opens:

1. Look for browser apps like:
   • Chrome, Firefox, Edge, Opera
   • Brave, DuckDuckGo, Orion
   • Any other web browsers

2. Select browser categories if available:
   • Web browsers
   • Internet browsers

3. Also consider blocking apps with built-in browsers:
   • YouTube, Facebook, Twitter
   • Instagram, TikTok, Reddit

4. Safari will remain unblocked for filtered browsing

Tap 'Done' when finished selecting.`;
  }

  /**
   * Check if browser blocking is properly configured
   * @returns Promise<boolean> indicating if browsers are blocked
   */
  async isBrowserBlockingActive(): Promise<boolean> {
    try {
      const data = await AppBlocking.getBlockedApps();
      return data.hasSelection && data.totalCount > 0;
    } catch (error) {
      console.error('Failed to check browser blocking status:', error);
      return false;
    }
  }

  /**
   * Get the list of browser bundle IDs for reference
   * @returns Array of browser bundle identifiers
   */
  getBrowserBundleIds(): string[] {
    return [...this.BROWSER_BUNDLE_IDS];
  }

  /**
   * Get recommendations for additional apps to block
   * @returns Object with categorized app recommendations
   */
  getBlockingRecommendations() {
    return {
      browsers: [
        'Chrome - Block Google Chrome browser',
        'Firefox - Block Mozilla Firefox browser', 
        'Edge - Block Microsoft Edge browser',
        'Opera - Block Opera browser',
        'Brave - Block Brave browser',
        'DuckDuckGo - Block DuckDuckGo browser',
      ],
      socialMediaWithBrowsers: [
        'YouTube - Contains built-in browser',
        'Facebook - Contains built-in browser',
        'Instagram - Contains built-in browser', 
        'Twitter/X - Contains built-in browser',
        'TikTok - Contains built-in browser',
        'Reddit - Contains built-in browser',
      ],
      categories: [
        'Web Browsers - Block entire browser category',
        'Social Media - Block social apps with browsers',
        'Entertainment - Block entertainment apps with browsers',
      ]
    };
  }
}

export const BrowserBlocking = new BrowserBlockingService();
export type { AppBlockingData };
