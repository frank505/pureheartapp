/**
 * Storage Keys Constants
 * 
 * Centralized AsyncStorage key definitions for the app.
 * This ensures consistent key usage and makes it easy to track what's stored.
 */

export const StorageKeys = {
  // Authentication & User
  USER_TOKEN: 'userToken',
  FCM_TOKEN: 'fcm_token',
   
  // User Type & Role
  USER_TYPE: 'user_type', // 'partner' | 'user'
  
  // Partner Related
  ACCOUNT_PARTNER_HASH: 'account_partner_hash_value',
  
  // Subscription
  SUBSCRIPTION_ENTITLEMENT: 'subscription_entitlement',
  
  // Redux Persist
  PERSIST_ROOT: 'persist:root',
} as const;

export type UserType = 'partner' | 'user';

export default StorageKeys;
