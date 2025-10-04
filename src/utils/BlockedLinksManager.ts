import { Platform } from 'react-native';
import { BLOCKED_URLS, BLOCKED_DOMAINS, BLOCKED_URLS_COUNT, BLOCKED_DOMAINS_COUNT } from '../config/blockedContent';

interface BlockedLink {
  link: string;
  domain: string;
}

export class BlockedLinksManager {
  private static instance: BlockedLinksManager;
  private blockedUrls: string[] = [];
  private blockedDomains: string[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): BlockedLinksManager {
    if (!BlockedLinksManager.instance) {
      BlockedLinksManager.instance = new BlockedLinksManager();
    }
    return BlockedLinksManager.instance;
  }

  private extractDomain(url: string): string {
    try {
      // Remove protocol if present
      let domain = url.replace(/^https?:\/\//, '');
      
      // Remove www. prefix if present
      domain = domain.replace(/^www\./, '');
      
      // Remove path and query parameters
      domain = domain.split('/')[0];
      domain = domain.split('?')[0];
      
      // Remove port number if present
      domain = domain.split(':')[0];
      
      return domain.toLowerCase();
    } catch (error) {
      console.error('Error extracting domain from URL:', url, error);
      return url.toLowerCase();
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load blocked URLs and domains from the comprehensive list
      this.blockedUrls = [...BLOCKED_URLS];
      this.blockedDomains = [...BLOCKED_DOMAINS];
      this.initialized = true;
      
      console.log(`Loaded ${this.blockedUrls.length} blocked URLs and ${this.blockedDomains.length} blocked domains from CSV data`);
    } catch (error) {
      console.error('Failed to load blocked content:', error);
      
      // Fallback to minimal hardcoded list if loading fails
      this.loadFallbackDomains();
      this.initialized = true;
    }
  }

  private async loadCSVContent(): Promise<string> {
    // This method is no longer needed but kept for compatibility
    throw new Error('CSV loading not implemented - using pre-processed domain list');
  }

  private parseCSV(csvContent: string): void {
    // This method is no longer needed but kept for compatibility
  }

  private loadFallbackDomains(): void {
    // Minimal fallback list in case loading fails
    const fallbackDomains = [
      'pornhub.com', 'xvideos.com','xnx.com', 'xnxx.com', 'redtube.com', 'youporn.com',
      'tube8.com', 'spankbang.com', 'chaturbate.com', 'cam4.com', 'livejasmin.com',
      'stripchat.com', 'xhamster.com', 'beeg.com', 'sex.com', 'xxx.com'
    ];

    this.blockedDomains = fallbackDomains;
    this.blockedUrls = fallbackDomains.map(domain => `https://${domain}`);
  }

  public isUrlBlocked(url: string): boolean {
    if (!this.initialized) {
      console.warn('BlockedLinksManager not initialized. Call initialize() first.');
      return false;
    }

    const lowerUrl = url.toLowerCase();
    const targetDomain = this.extractDomain(url);
    
    // Special handling for Reddit - only block specific subreddits, not the main site
    if (targetDomain === 'reddit.com') {
      // Only block if it's a specific subreddit URL that's in our blocked list
      return this.blockedUrls.some(blockedUrl => 
        lowerUrl.includes(blockedUrl.toLowerCase()) && blockedUrl.toLowerCase().includes('reddit.com/r/')
      );
    }
    
    // First check exact URL matches
    if (this.blockedUrls.some(blockedUrl => lowerUrl.includes(blockedUrl.toLowerCase()))) {
      return true;
    }
    
    // Then check domain matches (reddit.com already excluded from domains)
    return this.blockedDomains.some(blockedDomain => {
      return targetDomain.includes(blockedDomain) || 
             blockedDomain.includes(targetDomain) ||
             lowerUrl.includes(blockedDomain);
    });
  }

  public isDomainBlocked(domain: string): boolean {
    if (!this.initialized) {
      console.warn('BlockedLinksManager not initialized. Call initialize() first.');
      return false;
    }

    const targetDomain = this.extractDomain(domain);
    
    return this.blockedDomains.some(blockedDomain => 
      targetDomain.includes(blockedDomain) || 
      blockedDomain.includes(targetDomain)
    );
  }

  public getBlockedDomains(): string[] {
    if (!this.initialized) {
      console.warn('BlockedLinksManager not initialized. Call initialize() first.');
      return [];
    }

    return [...this.blockedDomains];
  }

  public getBlockedLinks(): string[] {
    if (!this.initialized) {
      console.warn('BlockedLinksManager not initialized. Call initialize() first.');
      return [];
    }

    return [...this.blockedUrls];
  }

  public getBlockedLinksCount(): number {
    return this.blockedUrls.length;
  }

  public getBlockedDomainsCount(): number {
    return this.blockedDomains.length;
  }
}

export default BlockedLinksManager;
