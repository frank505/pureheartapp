/**
 * Utility functions for website URL validation and normalization
 * Used in content filtering and website blocking features
 */

export interface URLValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

export class URLValidator {
  
  /**
   * Validate and normalize a website URL for blocking
   * @param url Raw URL input from user
   * @returns Validation result with normalized URL or error
   */
  static validateAndNormalize(url: string): URLValidationResult {
    if (!url || !url.trim()) {
      return {
        isValid: false,
        error: 'Please enter a website URL'
      };
    }

    // Remove whitespace and convert to lowercase
    let cleanUrl = url.trim().toLowerCase();

    // Remove protocols
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    cleanUrl = cleanUrl.replace(/^ftp:\/\//, '');
    
    // Remove www prefix
    cleanUrl = cleanUrl.replace(/^www\./, '');
    
    // Remove path, query, and fragment
    cleanUrl = cleanUrl.replace(/\/.*$/, '');
    cleanUrl = cleanUrl.replace(/\?.*$/, '');
    cleanUrl = cleanUrl.replace(/#.*$/, '');
    
    // Remove port numbers
    cleanUrl = cleanUrl.replace(/:\d+$/, '');

    // Basic domain validation
    if (!this.isValidDomain(cleanUrl)) {
      return {
        isValid: false,
        error: 'Please enter a valid website domain (e.g., example.com)'
      };
    }

    return {
      isValid: true,
      normalizedUrl: cleanUrl
    };
  }

  /**
   * Check if a string is a valid domain name
   * @param domain Domain to validate
   * @returns True if valid domain
   */
  private static isValidDomain(domain: string): boolean {
    // Domain must not be empty
    if (!domain || domain.length === 0) {
      return false;
    }

    // Domain must not exceed 253 characters
    if (domain.length > 253) {
      return false;
    }

    // Domain must not start or end with a hyphen
    if (domain.startsWith('-') || domain.endsWith('-')) {
      return false;
    }

    // Domain must contain at least one dot
    if (!domain.includes('.')) {
      return false;
    }

    // Split into labels (parts separated by dots)
    const labels = domain.split('.');

    // Must have at least 2 labels (e.g., example.com)
    if (labels.length < 2) {
      return false;
    }

    // Last label (TLD) must be at least 2 characters
    const tld = labels[labels.length - 1];
    if (tld.length < 2) {
      return false;
    }

    // Validate each label
    for (const label of labels) {
      if (!this.isValidLabel(label)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a domain label is valid
   * @param label Label to validate
   * @returns True if valid label
   */
  private static isValidLabel(label: string): boolean {
    // Label must not be empty
    if (!label || label.length === 0) {
      return false;
    }

    // Label must not exceed 63 characters
    if (label.length > 63) {
      return false;
    }

    // Label must not start or end with hyphen
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }

    // Label must contain only alphanumeric characters and hyphens
    const labelRegex = /^[a-z0-9-]+$/;
    return labelRegex.test(label);
  }

  /**
   * Get common domain variations for blocking
   * @param domain Base domain
   * @returns Array of domain variations to block
   */
  static getDomainVariations(domain: string): string[] {
    const variations = new Set<string>();
    
    // Add the base domain
    variations.add(domain);
    
    // Add www version if not already present
    if (!domain.startsWith('www.')) {
      variations.add(`www.${domain}`);
    }
    
    // Add common subdomains for popular sites
    const commonSubdomains = ['m', 'mobile', 'app', 'api', 'cdn', 'static'];
    
    for (const subdomain of commonSubdomains) {
      variations.add(`${subdomain}.${domain}`);
    }
    
    return Array.from(variations);
  }

  /**
   * Check if a domain is in a list of blocked domains
   * @param domain Domain to check
   * @param blockedDomains List of blocked domains
   * @returns True if domain is blocked
   */
  static isDomainBlocked(domain: string, blockedDomains: string[]): boolean {
    const normalized = this.validateAndNormalize(domain);
    
    if (!normalized.isValid || !normalized.normalizedUrl) {
      return false;
    }
    
    // Check exact match
    if (blockedDomains.includes(normalized.normalizedUrl)) {
      return true;
    }
    
    // Check if any blocked domain is a parent domain
    for (const blockedDomain of blockedDomains) {
      if (normalized.normalizedUrl.endsWith(`.${blockedDomain}`)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extract domain from a full URL
   * @param url Full URL
   * @returns Domain or null if invalid
   */
  static extractDomain(url: string): string | null {
    const result = this.validateAndNormalize(url);
    return result.isValid ? result.normalizedUrl || null : null;
  }

  /**
   * Check if URL is a local/private address
   * @param url URL to check
   * @returns True if local/private
   */
  static isLocalAddress(url: string): boolean {
    const domain = this.extractDomain(url);
    if (!domain) return false;

    // Check for localhost
    if (domain === 'localhost' || domain.startsWith('localhost.')) {
      return true;
    }

    // Check for IP addresses (basic check)
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(domain)) {
      const parts = domain.split('.').map(Number);
      
      // Check for private IP ranges
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
      
      // 127.0.0.0/8 (loopback)
      if (parts[0] === 127) return true;
    }

    return false;
  }

  /**
   * Suggest corrections for common domain input errors
   * @param url User input URL
   * @returns Array of suggested corrections
   */
  static suggestCorrections(url: string): string[] {
    const suggestions: string[] = [];
    
    // Remove common typos and formatting issues
    let cleaned = url.trim().toLowerCase();
    
    // Common typos
    const typoCorrections = {
      'gmai.com': 'gmail.com',
      'gogle.com': 'google.com',
      'facebok.com': 'facebook.com',
      'youtub.com': 'youtube.com',
      'twiter.com': 'twitter.com',
      'instagra.com': 'instagram.com',
    };
    
    for (const [typo, correction] of Object.entries(typoCorrections)) {
      if (cleaned.includes(typo)) {
        suggestions.push(cleaned.replace(typo, correction));
      }
    }
    
    // If no suggestions and input has common issues, suggest fixes
    if (suggestions.length === 0) {
      // Missing TLD
      if (!cleaned.includes('.') && cleaned.length > 0) {
        suggestions.push(`${cleaned}.com`);
        suggestions.push(`${cleaned}.org`);
        suggestions.push(`${cleaned}.net`);
      }
      
      // Extra spaces
      if (cleaned.includes(' ')) {
        suggestions.push(cleaned.replace(/\s+/g, ''));
      }
    }
    
    return suggestions;
  }
}

/**
 * Quick validation function for use in React components
 * @param url URL to validate
 * @returns Error message or null if valid
 */
export function validateWebsiteUrl(url: string): string | null {
  const result = URLValidator.validateAndNormalize(url);
  return result.isValid ? null : (result.error || 'Invalid URL');
}

/**
 * Quick normalization function for use in React components
 * @param url URL to normalize
 * @returns Normalized URL or original if invalid
 */
export function normalizeUrl(url: string): string {
  const result = URLValidator.validateAndNormalize(url);
  return result.isValid && result.normalizedUrl ? result.normalizedUrl : url;
}
