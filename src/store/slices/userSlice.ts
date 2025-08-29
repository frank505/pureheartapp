/**
 * User Redux Slice
 * 
 * This slice manages all user-related state in the application.
 * It handles user authentication, profile data, and preferences.
 * 
 * Features:
 * - User authentication state
 * - Profile information management
 * - User preferences and settings
 * - Async thunks for API calls
 * - Loading and error states
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import deviceTokenService from '../../services/deviceTokenService';

/**
 * Badge Interface
 */
export interface Badge {
  id: number;
  code: string;
  title: string;
  icon: string;
  tier: string;
  unlockedAt: string;
}

/**
 * User Interface
 * 
 * Defines the shape of a user object in our application.
 * This includes all the data we track for each user.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  joinDate: string;
  currentStreak?: number;
  mostRecentBadge?: Badge | null;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  stats: {
    daysActive: number;
    goalsAchieved: number;
    successRate: number;
  };
}

/**
 * User State Interface
 * 
 * Defines the complete state shape for the user slice.
 * Includes user data, loading states, and error handling.
 */
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
}

/**
 * Initial State
 * 
 * Default state values when the app starts.
 * Most values are null/false until user logs in.
 */
const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  onboardingCompleted: false,
};

/**
 * Async Thunks
 * 
 * These handle asynchronous operations like API calls.
 * They automatically dispatch pending/fulfilled/rejected actions.
 */

/**
 * Login User Thunk
 * 
 * Handles user login process with email and password.
 * In a real app, this would make an API call to authenticate.
 */
import api from '../../services/api';
import { 
  OnboardingState,
} from './onboardingSlice';

/**
 * Login User Thunk
 * 
 * Handles user login process with Google.
 * In a real app, this would make an API call to authenticate.
 */
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: { idToken: string; onboardingData: Omit<OnboardingState, 'isDataSaved'>; init_sent_accountability_id: string | null, init_reciever_sent_accountablity_id: string | null }, { rejectWithValue }) => {
    try {
      const { idToken, onboardingData, init_sent_accountability_id, init_reciever_sent_accountablity_id } = loginData;
      
      const response = await api.post('/auth/google-login', {
        idToken,
        onboardingData,
        init_sent_accountability_id,
        init_reciever_sent_accountablity_id,
      });

      // Assuming the API returns the user object and a tokens object
      const { user, tokens } = response.data;

      // Save the access token to AsyncStorage
      await AsyncStorage.setItem('userToken', tokens.accessToken);

      // Register FCM token if available
      const fcmToken = await AsyncStorage.getItem('fcm_token');
      if (fcmToken) {
        await deviceTokenService.register(fcmToken, Platform.OS);
      }

      return user;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return rejectWithValue(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue(error.message);
      }
    }
  }
);

export const loginUserWithApple = createAsyncThunk(
  'user/loginWithApple',
  async (loginData: { identityToken: string; onboardingData: Omit<OnboardingState, 'isDataSaved'>; init_sent_accountability_id: string | null; init_reciever_sent_accountablity_id: string | null }, { rejectWithValue }) => {
    try {
      const { identityToken, onboardingData, init_sent_accountability_id, init_reciever_sent_accountablity_id } = loginData;
      
      const response = await api.post('/auth/apple-login', {
        identityToken,
        onboardingData,
        init_sent_accountability_id,
        init_reciever_sent_accountablity_id,
      });

      // Assuming the API returns the user object and a tokens object
      const { user, tokens } = response.data;

      // Save the access token to AsyncStorage
      await AsyncStorage.setItem('userToken', tokens.accessToken);

      // Register FCM token if available
      const fcmToken = await AsyncStorage.getItem('fcm_token');
      if (fcmToken) {
        await deviceTokenService.register(fcmToken, Platform.OS);
      }

      return user;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return rejectWithValue(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue(error.message);
      }
    }
  }
);

/**
 * Update Profile Thunk
 * 
 * Handles updating user profile information.
 * Merges new data with existing user data.
 */
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: { firstName?: string; lastName?: string; username?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch('/user-profile', profileData);
      return data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile.');
    }
  }
);

/**
 * Get User Details Thunk
 * 
 * Fetches detailed user information from the server.
 * This is useful for getting fresh user data after initial login.
 */
export const getUserDetails = createAsyncThunk(
  'user/getUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user-details');
      // Assuming the API returns user details under a 'data' property
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details.');
    }
  }
);

/**
 * User Slice
 * 
 * Creates the Redux slice with reducers and actions.
 * Handles both synchronous and asynchronous state updates.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Logout User
     * 
     * Clears all user data and resets to initial state.
     * This is a synchronous action.
     */
    logout: (state) => {
      // Deactivate device token if it exists
      AsyncStorage.getItem('fcm_token').then((token) => {
        if (token) {
          deviceTokenService.deactivate(token).catch(() => undefined);
        }
      });

      // Clear FCM token from AsyncStorage
      AsyncStorage.removeItem('fcm_token').catch(() => undefined);

      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.onboardingCompleted = false;
    },

    /**
     * Clear Error
     * 
     * Clears any error messages from the user state.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Complete Onboarding
     * 
     * Marks the user onboarding process as completed.
     */
    completeOnboarding: (state) => {
      state.onboardingCompleted = true;
    },

    /**
     * Update User Preferences
     * 
     * Updates user preferences like notifications, theme, etc.
     */
    updatePreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.currentUser) {
        state.currentUser.preferences = {
          ...state.currentUser.preferences,
          ...action.payload,
        };
      }
    },

    /**
     * Update User Stats
     * 
     * Updates user statistics like days active, goals achieved, etc.
     */
    updateStats: (state, action: PayloadAction<Partial<User['stats']>>) => {
      if (state.currentUser) {
        state.currentUser.stats = {
          ...state.currentUser.stats,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Login User Cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Apple Login User Cases
    builder
      .addCase(loginUserWithApple.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserWithApple.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserWithApple.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Update Profile Cases
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get User Details Cases
    builder
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload };
        } else {
          state.currentUser = action.payload;
        }
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions for use in components
export const {
  logout,
  clearError,
  completeOnboarding,
  updatePreferences,
  updateStats,
} = userSlice.actions;

// Export reducer for store configuration
export default userSlice.reducer;