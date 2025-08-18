/**
 * Partner Service
 * 
 * Service for managing accountability partner phone numbers and related operations.
 * Provides functions to update, retrieve, and validate partner phone numbers.
 */

import api from './api';

export interface PartnerPhoneUpdatePayload {
  phoneNumber: string;
}

export interface PartnerPhoneResponse {
  id: number;
  phoneNumber: string | null;
}

export interface PartnerWithPhone {
  id: number;
  userId: number;
  receiverId: number;
  phoneNumber: string | null;
  partner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  since: string;
}

/**
 * Partner Service Class
 */
const partnerService = {
  /**
   * Update a partner's phone number
   * @param partnerId - The partner ID
   * @param phoneNumber - The full phone number with country code (e.g., "+1234567890")
   */
  async updatePartnerPhone(partnerId: number, phoneNumber: string): Promise<PartnerPhoneResponse> {
    const { data } = await api.patch(`/partners/${partnerId}/phone`, {
      phoneNumber: phoneNumber.trim()
    });
    return data.data || data;
  },

  /**
   * Get a partner's phone number
   * @param partnerId - The partner ID
   */
  async getPartnerPhone(partnerId: number): Promise<PartnerPhoneResponse> {
    const { data } = await api.get(`/partners/${partnerId}/phone`);
    return data.data || data;
  },

  /**
   * Get all partners with their phone numbers
   * For the emergency contact feature
   */
  async getPartnersWithPhones(): Promise<PartnerWithPhone[]> {
    const { data } = await api.get('/partners');
    return data.data || data.items || data;
  },

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate (with or without country code)
   */
  validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return { isValid: false, error: 'Phone number is required' };
    }

    const trimmed = phoneNumber.trim();
    
    // Check if it starts with a country code
    if (!trimmed.startsWith('+')) {
      return { isValid: false, error: 'Phone number must include country code (e.g., +1234567890)' };
    }

    // Remove country code and check remaining digits
    const withoutCountryCode = trimmed.substring(1);
    
    // Check if remaining characters are digits
    if (!/^\d+$/.test(withoutCountryCode)) {
      return { isValid: false, error: 'Phone number can only contain digits after country code' };
    }

    // Check minimum length (at least 7 digits after country code)
    if (withoutCountryCode.length < 7) {
      return { isValid: false, error: 'Phone number is too short' };
    }

    // Check maximum length (at most 15 digits total including country code)
    if (trimmed.length > 16) { // +15 digits max
      return { isValid: false, error: 'Phone number is too long' };
    }

    return { isValid: true };
  },

  /**
   * Format phone number for display
   * @param phoneNumber - Phone number to format
   */
  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    const trimmed = phoneNumber.trim();
    
    // For US/Canada numbers, format as (XXX) XXX-XXXX
    if (trimmed.startsWith('+1') && trimmed.length === 12) {
      const digits = trimmed.substring(2);
      return `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    // For other countries, just return with spaces for readability
    return trimmed.replace(/(\+\d{1,3})(\d{3})(\d+)/, '$1 $2 $3');
  },

  /**
   * Extract country code from phone number
   * @param phoneNumber - Full phone number with country code
   */
  extractCountryCode(phoneNumber: string): string {
    if (!phoneNumber || !phoneNumber.startsWith('+')) return '+1';
    
    // Common country codes (longer codes first to match correctly)
    const commonCodes = ['+971', '+966', '+972', '+234', '+254', '+358', '+351', '+353', '+44', '+33', '+49', '+39', '+34', '+31', '+46', '+47', '+45', '+41', '+43', '+32', '+61', '+64', '+81', '+82', '+86', '+91', '+65', '+60', '+66', '+62', '+63', '+84', '+55', '+52', '+54', '+56', '+57', '+51', '+27', '+20', '+90', '+7', '+1'];
    
    for (const code of commonCodes) {
      if (phoneNumber.startsWith(code)) {
        return code;
      }
    }
    
    return '+1'; // Default to US
  },

  /**
   * Remove country code from phone number
   * @param phoneNumber - Full phone number with country code
   */
  removeCountryCode(phoneNumber: string): string {
    const countryCode = this.extractCountryCode(phoneNumber);
    return phoneNumber.substring(countryCode.length);
  }
};

export default partnerService;
