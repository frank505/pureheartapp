/**
 * User Type Utilities
 * 
 * Helper functions to manage user type (partner vs user) preferences.
 * The user type determines which UI features are shown/hidden throughout the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../constants';
import type { UserType } from '../constants';

/**
 * Save User Type
 * 
 * Saves the user's selected type (partner or user) to AsyncStorage.
 * 
 * @param userType - The type of user ('partner' | 'user')
 * @returns Promise that resolves when save is complete
 */
export const saveUserType = async (userType: UserType): Promise<void> => {
  try {
    await AsyncStorage.setItem(StorageKeys.USER_TYPE, userType);
    console.log(`[UserType] Saved user type: ${userType}`);
  } catch (error) {
    console.error('[UserType] Error saving user type:', error);
    throw error;
  }
};

/**
 * Get User Type
 * 
 * Retrieves the user's selected type from AsyncStorage.
 * 
 * @returns Promise that resolves with the user type or null if not set
 */
export const getUserType = async (): Promise<UserType | null> => {
  try {
    const userType = await AsyncStorage.getItem(StorageKeys.USER_TYPE);
    console.log(`[UserType] Retrieved user type: ${userType}`);
    return userType as UserType | null;
  } catch (error) {
    console.error('[UserType] Error retrieving user type:', error);
    return null;
  }
};

/**
 * Check if User is Partner
 * 
 * Convenience function to check if the user is a partner.
 * 
 * @returns Promise that resolves with true if user is a partner
 */
export const isPartner = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'partner';
};

/**
 * Check if User is Regular User
 * 
 * Convenience function to check if the user is a regular user.
 * 
 * @returns Promise that resolves with true if user is a regular user
 */
export const isRegularUser = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'user';
};

/**
 * Clear User Type
 * 
 * Removes the user type from AsyncStorage.
 * Useful for logout or testing scenarios.
 * 
 * @returns Promise that resolves when clear is complete
 */
export const clearUserType = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.USER_TYPE);
    console.log('[UserType] Cleared user type');
  } catch (error) {
    console.error('[UserType] Error clearing user type:', error);
    throw error;
  }
};

export default {
  saveUserType,
  getUserType,
  isPartner,
  isRegularUser,
  clearUserType,
};
