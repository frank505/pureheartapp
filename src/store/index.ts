/**
 * Redux Store Configuration
 * 
 * This file sets up the Redux store with Redux Toolkit and persistence.
 * It includes middleware configuration and store persistence using AsyncStorage.
 * 
 * Features:
 * - Redux Toolkit for modern Redux patterns
 * - Redux Persist for state persistence across app restarts
 * - AsyncStorage for React Native local storage
 * - Proper TypeScript integration
 * - Development tools integration
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our Redux slices
import userSlice from './slices/userSlice';
import postsSlice from './slices/postsSlice';
import appSlice from './slices/appSlice';
import onboardingSlice from './slices/onboardingSlice';
import invitationSlice from './slices/invitationSlice';
import notificationsSlice from './slices/notificationsSlice';
import checkinsSlice from './slices/checkinsSlice';
import prayerRequestSlice from './slices/prayerRequestSlice';
import victorySlice from './slices/victorySlice';
import streaksSlice from './slices/streaksSlice';

/**
 * Redux Persist Configuration
 * 
 * This configuration tells Redux Persist:
 * - Where to store data (AsyncStorage)
 * - Which reducers to persist
 * - Which parts of state to blacklist (not persist)
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Whitelist: only persist these reducers
  whitelist: ['user', 'app', 'onboarding', 'invitation', 'notifications', 'checkins', 'prayerRequests', 'victories', 'streaks'],
  // Blacklist: don't persist these reducers (posts will be fetched fresh)
  blacklist: ['posts'],
  version: 1,
};

/**
 * Root Reducer
 * 
 * Combines all our individual slice reducers into a single root reducer.
 * This represents the complete state shape of our application.
 */
const rootReducer = combineReducers({
  user: userSlice,
  posts: postsSlice,
  app: appSlice,
  onboarding: onboardingSlice,
  invitation: invitationSlice,
  notifications: notificationsSlice,
  checkins: checkinsSlice,
  prayerRequests: prayerRequestSlice,
  victories: victorySlice,
  streaks: streaksSlice,
});

/**
 * Persisted Reducer
 * 
 * Wraps our root reducer with persistence capabilities.
 * This ensures that specified parts of state survive app restarts.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store Configuration
 * 
 * Creates the Redux store with:
 * - Persisted reducer for state persistence
 * - Redux Toolkit's default middleware
 * - Custom serialization settings for persistence
 * - DevTools integration for development
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for redux-persist actions
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  // Enable Redux DevTools in development
  devTools: __DEV__,
});

/**
 * Persistor
 * 
 * Creates a persistor instance that handles the persistence lifecycle.
 * Used to wrap the app with PersistGate for loading states.
 */
export const persistor = persistStore(store);

/**
 * TypeScript Types
 * 
 * These types provide full TypeScript support for the Redux store.
 * Use these types when connecting components to the store.
 */

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed Hooks
 * 
 * Pre-typed versions of useDispatch and useSelector hooks.
 * Use these instead of the plain hooks for better TypeScript support.
 */
export { useAppDispatch, useAppSelector } from './hooks';