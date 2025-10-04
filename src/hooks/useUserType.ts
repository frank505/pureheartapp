/**
 * useUserType Hook
 * 
 * Custom React hook for managing and accessing user type (partner vs user).
 * This hook provides easy access to the user type and convenience methods
 * to check user role throughout the app.
 */

import { useState, useEffect } from 'react';
import type { UserType } from '../constants';
import { getUserType, saveUserType, clearUserType } from '../utils/userTypeUtils';

interface UseUserTypeReturn {
  userType: UserType | null;
  isPartner: boolean;
  isUser: boolean;
  isLoading: boolean;
  setUserType: (type: UserType) => Promise<void>;
  clearType: () => Promise<void>;
  refreshUserType: () => Promise<void>;
}

/**
 * useUserType Hook
 * 
 * Provides access to user type state and methods.
 * Automatically loads the user type on mount.
 * 
 * @returns Object containing user type state and methods
 * 
 * @example
 * ```tsx
 * const { userType, isPartner, isUser, setUserType } = useUserType();
 * 
 * if (isPartner) {
 *   // Show partner-specific UI
 * }
 * ```
 */
export const useUserType = (): UseUserTypeReturn => {
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user type on mount
  useEffect(() => {
    loadUserType();
  }, []);

  const loadUserType = async () => {
    try {
      setIsLoading(true);
      const type = await getUserType();
      setUserTypeState(type);
    } catch (error) {
      console.error('[useUserType] Error loading user type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserType = async (type: UserType) => {
    try {
      await saveUserType(type);
      setUserTypeState(type);
    } catch (error) {
      console.error('[useUserType] Error setting user type:', error);
      throw error;
    }
  };

  const clearType = async () => {
    try {
      await clearUserType();
      setUserTypeState(null);
    } catch (error) {
      console.error('[useUserType] Error clearing user type:', error);
      throw error;
    }
  };

  const refreshUserType = async () => {
    await loadUserType();
  };

  return {
    userType,
    isPartner: userType === 'partner',
    isUser: userType === 'user',
    isLoading,
    setUserType,
    clearType,
    refreshUserType,
  };
};

export default useUserType;
