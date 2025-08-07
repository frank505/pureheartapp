/**
 * App Redux Slice
 * 
 * This slice manages general application state that doesn't belong to
 * specific features like user or posts. It handles app-wide settings,
 * navigation state, and global UI states.
 * 
 * Features:
 * - Theme management (light/dark mode)
 * - Network connectivity status
 * - App settings and preferences
 * - Global loading states
 * - Navigation state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Theme Options
 * 
 * Defines available theme options for the app.
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * App State Interface
 * 
 * Defines the complete state shape for general app settings.
 */
interface AppState {
  theme: Theme;
  isConnected: boolean;
  activeTab: string;
  isFirstLaunch: boolean;
  hasCompletedOnboarding: boolean; // This persists - once completed, never show again
  appVersion: string;
  lastUpdateCheck: number | null;
  globalLoading: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badges: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
  language: string;
  debugMode: boolean;
}

/**
 * Initial State
 * 
 * Default state values when the app starts.
 */
const initialState: AppState = {
  theme: 'auto',
  isConnected: true,
  activeTab: 'Home',
  isFirstLaunch: true,
  hasCompletedOnboarding: false,
  appVersion: '1.0.0',
  lastUpdateCheck: null,
  globalLoading: false,
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badges: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
  },
  language: 'en',
  debugMode: __DEV__,
};

/**
 * App Slice
 * 
 * Creates the Redux slice for app-wide state management.
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Set Theme
     * 
     * Updates the app theme (light/dark/auto).
     */
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    /**
     * Set Connection Status
     * 
     * Updates network connectivity status.
     */
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    /**
     * Set Active Tab
     * 
     * Updates the currently active tab for navigation state.
     */
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    /**
     * Complete First Launch
     * 
     * Marks the first launch as completed.
     */
    completeFirstLaunch: (state) => {
      state.isFirstLaunch = false;
    },

    /**
     * Complete Onboarding
     * 
     * Marks the onboarding flow as completed permanently.
     */
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },

    /**
     * Reset Onboarding (for testing)
     * 
     * Resets onboarding status for testing purposes.
     */
    resetOnboarding: (state) => {
      state.hasCompletedOnboarding = false;
      state.isFirstLaunch = true;
    },

    /**
     * Set Global Loading
     * 
     * Controls global loading state for app-wide operations.
     */
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },

    /**
     * Update Notification Settings
     * 
     * Updates notification preferences.
     */
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<AppState['notifications']>>
    ) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },

    /**
     * Update Accessibility Settings
     * 
     * Updates accessibility preferences.
     */
    updateAccessibilitySettings: (
      state,
      action: PayloadAction<Partial<AppState['accessibility']>>
    ) => {
      state.accessibility = {
        ...state.accessibility,
        ...action.payload,
      };
    },

    /**
     * Set Language
     * 
     * Updates the app language setting.
     */
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    /**
     * Toggle Debug Mode
     * 
     * Toggles debug mode for development features.
     */
    toggleDebugMode: (state) => {
      state.debugMode = !state.debugMode;
    },

    /**
     * Update Last Check Time
     * 
     * Updates the timestamp of the last update check.
     */
    updateLastCheckTime: (state) => {
      state.lastUpdateCheck = Date.now();
    },

    /**
     * Reset App State
     * 
     * Resets app state to initial values (useful for logout).
     */
    resetAppState: (state) => {
      // Keep some settings that shouldn't reset
      const keepSettings = {
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        accessibility: state.accessibility,
      };
      
      Object.assign(state, initialState, keepSettings);
    },
  },
});

// Export actions for use in components
export const {
  setTheme,
  setConnectionStatus,
  setActiveTab,
  completeFirstLaunch,
  completeOnboarding,
  resetOnboarding,
  setGlobalLoading,
  updateNotificationSettings,
  updateAccessibilitySettings,
  setLanguage,
  toggleDebugMode,
  updateLastCheckTime,
  resetAppState,
} = appSlice.actions;

// Export reducer for store configuration
export default appSlice.reducer;