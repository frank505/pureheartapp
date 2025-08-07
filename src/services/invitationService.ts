/**
 * Invitation Service
 * 
 * This service handles all invitation-related operations including:
 * - Generating invitation URLs with hashes
 * - Sharing invitations via social media platforms
 * - Creating shareable invitation content
 * - Processing deep link URLs
 * - Managing invitation metadata
 * 
 * The service integrates with react-native-share for social sharing
 * and provides a clean API for invitation operations.
 */

import Share from 'react-native-share';
import { Alert, Linking } from 'react-native';
import { Invitation } from '../store/slices/invitationSlice';

/**
 * Invitation Share Options
 * 
 * Defines the available sharing platforms and their configurations.
 */
export interface ShareOptions {
  platform?: 'whatsapp' | 'twitter' | 'instagram' | 'facebook' | 'email' | 'sms' | 'generic';
  customMessage?: string;
}

/**
 * Deep Link URL Configuration
 * 
 * Configuration for generating different types of invitation URLs.
 */
interface DeepLinkConfig {
  appScheme: string; // Custom app scheme (pureheart://)
  webDomain: string; // Web domain for fallback (https://pureheart.app)
  invitePath: string; // Path for invitation links (/invite)
}

/**
 * Default deep link configuration
 * 
 * These URLs will be used for sharing invitations.
 * In production, replace with your actual app scheme and domain.
 */
const DEEP_LINK_CONFIG: DeepLinkConfig = {
  appScheme: 'pureheart',
  webDomain: 'https://pureheart.app',
  invitePath: '/invite',
};

/**
 * Invitation Service Class
 * 
 * Main service class that provides all invitation-related functionality.
 * This class handles URL generation, sharing, and deep link processing.
 */
export class InvitationService {
  /**
   * Generate Deep Link URL
   * 
   * Creates both app scheme URL and web fallback URL for an invitation.
   * The web URL can redirect to app stores if app is not installed.
   * 
   * @param hash - Unique invitation hash
   * @returns Object with app and web URLs
   */
  static generateInvitationUrls(hash: string): {
    appUrl: string;
    webUrl: string;
    universalUrl: string;
  } {
    const appUrl = `${DEEP_LINK_CONFIG.appScheme}://invite/${hash}`;
    const webUrl = `${DEEP_LINK_CONFIG.webDomain}${DEEP_LINK_CONFIG.invitePath}/${hash}`;
    
    // Universal URL that works on both platforms
    const universalUrl = webUrl;
    
    return { appUrl, webUrl, universalUrl };
  }

  /**
   * Generate Invitation Message
   * 
   * Creates a personalized invitation message for sharing.
   * Includes the invitation URL and context about the app.
   * 
   * @param invitation - Invitation object
   * @param customMessage - Optional custom message from user
   * @returns Formatted invitation message
   */
  static generateInvitationMessage(
    invitation: Invitation,
    customMessage?: string
  ): string {
    const urls = this.generateInvitationUrls(invitation.hash);
    const inviterName = invitation.inviterName;
    
    // Default message based on invitation type
    let defaultMessage = '';
    switch (invitation.metadata?.invitationType) {
      case 'accountability_partner':
        defaultMessage = `${inviterName} would like you to be their accountability partner on PureHeart! 🤝`;
        break;
      case 'trusted_contact':
        defaultMessage = `${inviterName} has added you as a trusted contact on PureHeart! 🙏`;
        break;
      case 'prayer_partner':
        defaultMessage = `${inviterName} would like you to be their prayer partner on PureHeart! 🙏`;
        break;
      default:
        defaultMessage = `${inviterName} has invited you to join them on PureHeart! ✨`;
    }
    
    // Combine custom message with default if provided
    const messageText = customMessage 
      ? `${customMessage}\n\n${defaultMessage}`
      : defaultMessage;
    
    return `${messageText}

Join me on PureHeart - a community for spiritual growth and accountability.

Tap this link to accept: ${urls.universalUrl}

#PureHeart #SpiritualGrowth #Accountability`;
  }

  /**
   * Share Invitation via Platform
   * 
   * Shares an invitation using the specified platform or shows share dialog.
   * Handles platform-specific formatting and fallbacks.
   * 
   * @param invitation - Invitation to share
   * @param options - Sharing options and platform preference
   */
  static async shareInvitation(
    invitation: Invitation,
    options: ShareOptions = {}
  ): Promise<void> {
    try {
      const message = this.generateInvitationMessage(invitation, options.customMessage);
      const urls = this.generateInvitationUrls(invitation.hash);
      
      // Base share options
      const shareOptions = {
        title: 'Join me on PureHeart!',
        message,
        url: urls.universalUrl,
        subject: `${invitation.inviterName} invited you to PureHeart`, // For email
      };

      // Platform-specific sharing
      switch (options.platform) {
        case 'whatsapp':
          await Share.shareSingle({
            ...shareOptions,
            social: Share.Social.WHATSAPP,
            whatsAppNumber: '', // Leave empty to show contact picker
          });
          break;

        case 'twitter':
          await Share.shareSingle({
            ...shareOptions,
            social: Share.Social.TWITTER,
            message: `${invitation.inviterName} invited me to join PureHeart! 🙏 ${urls.universalUrl} #PureHeart #SpiritualGrowth`,
          });
          break;

        case 'facebook':
          await Share.shareSingle({
            ...shareOptions,
            social: Share.Social.FACEBOOK,
          });
          break;

        case 'instagram':
          // Instagram doesn't support direct link sharing via react-native-share
          // We'll copy the link and show instructions
          await this.copyToClipboardAndNotify(urls.universalUrl);
          Alert.alert(
            'Link Copied!',
            'The invitation link has been copied to your clipboard. You can now paste it in your Instagram story or message.',
            [{ text: 'OK' }]
          );
          break;

        case 'email':
          await Share.shareSingle({
            ...shareOptions,
            social: Share.Social.EMAIL,
            recipient: invitation.inviteeEmail || '',
          });
          break;

        case 'sms':
          await Share.shareSingle({
            ...shareOptions,
            social: Share.Social.SMS,
            recipient: '', // Leave empty to show contact picker
          });
          break;

        case 'generic':
        default:
          // Show platform picker dialog
          await Share.open(shareOptions);
          break;
      }

      console.log('Invitation shared successfully via', options.platform || 'generic');
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.message && error.message.includes('cancel')) {
        console.log('User cancelled sharing');
        return;
      }
      
      console.error('Error sharing invitation:', error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share the invitation. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Copy URL to Clipboard
   * 
   * Copies the invitation URL to clipboard for manual sharing.
   * Useful for platforms that don't support direct sharing.
   * 
   * @param invitation - Invitation to copy
   */
  static async copyInvitationUrl(invitation: Invitation): Promise<void> {
    try {
      const urls = this.generateInvitationUrls(invitation.hash);
      await this.copyToClipboardAndNotify(urls.universalUrl);
    } catch (error) {
      console.error('Error copying invitation URL:', error);
      Alert.alert(
        'Copy Failed',
        'Unable to copy the invitation link. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Extract Hash from Deep Link
   * 
   * Parses a deep link URL to extract the invitation hash.
   * Handles both app scheme and web URLs.
   * 
   * @param url - Deep link URL
   * @returns Invitation hash or null if invalid
   */
  static extractHashFromUrl(url: string): string | null {
    try {
      // Handle app scheme URLs: pureheart://invite/hash
      if (url.startsWith(`${DEEP_LINK_CONFIG.appScheme}://invite/`)) {
        const hash = url.replace(`${DEEP_LINK_CONFIG.appScheme}://invite/`, '');
        return hash || null;
      }
      
      // Handle web URLs: https://pureheart.app/invite/hash
      if (url.startsWith(`${DEEP_LINK_CONFIG.webDomain}${DEEP_LINK_CONFIG.invitePath}/`)) {
        const hash = url.replace(`${DEEP_LINK_CONFIG.webDomain}${DEEP_LINK_CONFIG.invitePath}/`, '');
        return hash || null;
      }
      
      // Handle generic invitation URLs
      const inviteMatch = url.match(/\/invite\/([^/?&#]+)/);
      if (inviteMatch && inviteMatch[1]) {
        return inviteMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting hash from URL:', error);
      return null;
    }
  }

  /**
   * Validate Invitation Hash
   * 
   * Checks if an invitation hash has the correct format.
   * PureHeart hashes should start with 'ph_' followed by alphanumeric characters.
   * 
   * @param hash - Hash to validate
   * @returns True if hash format is valid
   */
  static validateInvitationHash(hash: string): boolean {
    // PureHeart invitation hashes should start with 'ph_' and contain only alphanumeric characters
    const hashPattern = /^ph_[a-f0-9]+[a-z0-9]+$/i;
    return hashPattern.test(hash) && hash.length >= 10;
  }

  /**
   * Open App Store
   * 
   * Opens the appropriate app store if the app is not installed.
   * Used as fallback when deep link fails.
   */
  static async openAppStore(): Promise<void> {
    try {
      // Replace with your actual app store URLs
      const appStoreUrl = 'https://apps.apple.com/app/pureheart/id123456789';
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.pureheart';
      
      // For now, we'll just open a generic URL
      // In production, detect platform and use appropriate store
      await Linking.openURL(appStoreUrl);
    } catch (error) {
      console.error('Error opening app store:', error);
    }
  }

  /**
   * Create Invitation Summary
   * 
   * Creates a human-readable summary of an invitation.
   * Used for displaying invitation details in the UI.
   * 
   * @param invitation - Invitation object
   * @returns Formatted invitation summary
   */
  static createInvitationSummary(invitation: Invitation): {
    title: string;
    description: string;
    actionText: string;
    icon: string;
  } {
    const type = invitation.metadata?.invitationType || 'trusted_contact';
    
    switch (type) {
      case 'accountability_partner':
        return {
          title: 'Accountability Partner Invitation',
          description: `${invitation.inviterName} would like you to be their accountability partner. You'll support each other in your spiritual journey.`,
          actionText: 'Become Accountability Partner',
          icon: 'people-outline',
        };
        
      case 'prayer_partner':
        return {
          title: 'Prayer Partner Invitation',
          description: `${invitation.inviterName} would like you to be their prayer partner. You'll pray together and share prayer requests.`,
          actionText: 'Become Prayer Partner',
          icon: 'hand-right-outline',
        };
        
      case 'trusted_contact':
      default:
        return {
          title: 'Trusted Contact Invitation',
          description: `${invitation.inviterName} has added you as a trusted contact. You'll be able to receive emergency alerts if needed.`,
          actionText: 'Accept Invitation',
          icon: 'shield-outline',
        };
    }
  }

  /**
   * Helper method to copy text to clipboard and show notification
   * 
   * @param text - Text to copy
   */
  private static async copyToClipboardAndNotify(text: string): Promise<void> {
    try {
      // For React Native, we'd typically use @react-native-clipboard/clipboard
      // For now, we'll simulate the action
      console.log('Copied to clipboard:', text);
      
      Alert.alert(
        'Link Copied!',
        'The invitation link has been copied to your clipboard.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Export default instance for convenience
 */
export default InvitationService;
