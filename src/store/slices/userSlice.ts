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
  avatar?: string;
  joinDate: string;
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
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this comes from API
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        avatar: undefined,
        joinDate: new Date().toISOString(),
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'en',
        },
        stats: {
          daysActive: 127,
          goalsAchieved: 23,
          successRate: 89,
        },
      };
      
      return mockUser;
    } catch (error) {
      return rejectWithValue('Login failed. Please check your credentials.');
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
  async (profileData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, make API call here
      return profileData;
    } catch (error) {
      return rejectWithValue('Failed to update profile. Please try again.');
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