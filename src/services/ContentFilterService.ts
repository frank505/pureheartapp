import { NativeModules, Platform } from 'react-native';

const { ContentFilterManager } = NativeModules;

interface ContentFilterServiceInterface {
  isFilterEnabled(): Promise<boolean>;
  isDomainBlocked(url: string): Promise<boolean>;
  getBlockedDomains(): Promise<string[]>;
}

class ContentFilterService implements ContentFilterServiceInterface {
  private isInitialized = false;

  constructor() {
    this.isInitialized = !!ContentFilterManager;
    if (!this.isInitialized) {
      console.warn('ContentFilterManager native module not available');
    }
  }

  public async isFilterEnabled(): Promise<boolean> {
    if (!this.isInitialized || !ContentFilterManager) {
      return false;
    }

    try {
      const isEnabled = await ContentFilterManager.isFilterEnabled();
      return isEnabled;
    } catch (error) {
      console.error('Failed to check if content filter is enabled:', error);
      return false;
    }
  }

  public async isDomainBlocked(url: string): Promise<boolean> {
    if (!this.isInitialized || !ContentFilterManager) {
      return false;
    }

    try {
      const isBlocked = await ContentFilterManager.isDomainBlocked(url);
      return isBlocked;
    } catch (error) {
      console.error('Failed to check if domain is blocked:', error);
      return false;
    }
  }

  public async getBlockedDomains(): Promise<string[]> {
    if (!this.isInitialized || !ContentFilterManager) {
      return [];
    }

    try {
      const domains = await ContentFilterManager.getBlockedDomains();
      return domains || [];
    } catch (error) {
      console.error('Failed to get blocked domains:', error);
      return [];
    }
  }

  public async shouldBlockUrl(url: string): Promise<boolean> {
    try {
      // First check if filter is enabled
      const isEnabled = await this.isFilterEnabled();
      if (!isEnabled) {
        return false;
      }

      // Then check if the specific domain is blocked
      const isBlocked = await this.isDomainBlocked(url);
      return isBlocked;
    } catch (error) {
      console.error('Error checking if URL should be blocked:', error);
      return false;
    }
  }

  public extractDomain(url: string): string {
    try {
      // Use a more compatible approach for React Native
      const urlPattern = /^https?:\/\/(?:www\.)?([^\/]+)/i;
      const matches = url.match(urlPattern);
      return matches ? matches[1] : '';
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const matches = url.match(/\/\/(www\.)?([^\/]+)/);
      return matches ? matches[2] : '';
    }
  }

  public isValidUrl(url: string): boolean {
    try {
      // Use a simple regex pattern for URL validation in React Native
      const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      return urlPattern.test(url);
    } catch {
      // Try to check if it looks like a domain
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      return domainPattern.test(url);
    }
  }

  public formatUrlForCheck(url: string): string {
    // Ensure URL has protocol for proper checking
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
}

// Export singleton instance
export const contentFilterService = new ContentFilterService();
export default contentFilterService;
