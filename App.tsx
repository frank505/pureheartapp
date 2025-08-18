/**
 * PureHeart React Native App
 * 
 * Main application entry point with Redux, navigation, and UI theme setup.
 * This app features a bottom tab navigation with four main sections:
 * Home, Explore, Profile, and Settings, plus Redux state management.
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Import Redux store and persistor
import { store, persistor } from './src/store';

// Import our custom tab navigator and screens
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import AuthScreen from './src/screens/AuthScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import NewGroupScreen from './src/screens/NewGroupScreen';
import AICompanionScreen from './src/screens/AICompanionScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import PartnersListScreen from './src/screens/PartnersListScreen';
import CheckInHistoryScreen from './src/screens/CheckInHistoryScreen';
import PrayerRequestsScreen from './src/screens/PrayerRequestsScreen';
import NotificationsCenterScreen from './src/screens/NotificationsCenterScreen';
import ScriptureBrowserScreen from './src/screens/ScriptureBrowserScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import GrowthTrackerScreen from './src/screens/GrowthTrackerScreen';
import EditPartnerPhoneScreen from './src/screens/EditPartnerPhoneScreen';
import InvitationAcceptModal from './src/components/InvitationAcceptModal';
import ShareInvitationModal from './src/components/ShareInvitationModal';

// Import Redux hooks and actions
import { useAppSelector } from './src/store/hooks';

// Import centralized theme
import { Theme } from './src/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { navigationRef, navigate } from './src/navigation/RootNavigation';

// Create the stack navigator for authentication flow
const Stack = createNativeStackNavigator();

/**
 * Custom Theme Configuration
 * 
 * Defines custom colors and styling for React Native Paper components.
 * This ensures consistent theming across the entire app.
 */
// App Theme Configuration using centralized colors
const appTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Theme.primary,
    primaryContainer: Theme.primaryContainer,
    secondary: Theme.secondary,
    secondaryContainer: Theme.secondaryContainer,
    surface: Theme.surface,
    surfaceVariant: Theme.surfaceVariant,
    background: Theme.screen,
    onBackground: Theme.onBackground,
    onSurface: Theme.onSurface,
    onSurfaceVariant: Theme.onSurfaceVariant,
    onPrimary: Theme.onPrimary,
    onSecondary: Theme.onSecondary,
    error: Theme.error,
    errorContainer: Theme.errorContainer,
    onError: Theme.onError,
    onErrorContainer: Theme.onErrorContainer,
    outline: Theme.outline,
    outlineVariant: Theme.outlineVariant,
    surfaceTint: Theme.surfaceTint,
    inverseSurface: Theme.inverseSurface,
    inverseOnSurface: Theme.inverseOnSurface,
    scrim: Theme.scrim,
  },
};

/**
 * App Content Component
 * 
 * This component contains the main app content that needs access to Redux store.
 * It handles the authentication flow, deep linking, and shows appropriate screens.
 */
const AppContent: React.FC = () => {
 
  // Get authentication and onboarding state from Redux
  const { isAuthenticated } = useAppSelector(state => state.user);
  const { isFirstLaunch, hasCompletedOnboarding } = useAppSelector(state => state.app);

  // iOS push notification handling: navigate to group chat when tapped
  useEffect(() => {
    // Request permission on iOS
    if (Platform.OS === 'ios') {
      messaging().requestPermission().catch(() => undefined);
      messaging().getToken().then((token: string) => {
        if (token) {
          // Store or send to backend later
          AsyncStorage.setItem('fcm_token', token).catch(() => undefined);
        }
      });
    }

    // Foreground message handler (optional preview)
    const unsubscribeOnMessage = messaging().onMessage(async () => {
      // no-op; could show in-app banner/toast
    });

    // When app is opened from a quit state via notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage?.data?.type === 'group_message') {
          const groupId = String(remoteMessage.data.groupId);
          const groupName = remoteMessage.data.groupName ? String(remoteMessage.data.groupName) : undefined;
          setTimeout(() => navigate('GroupChat', { groupId, groupName }), 300);
        }
      });

    // When app is in background and user taps notification
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage?.data?.type === 'group_message') {
        const groupId = String(remoteMessage.data.groupId);
        const groupName = remoteMessage.data.groupName ? String(remoteMessage.data.groupName) : undefined;
        navigate('GroupChat', { groupId, groupName });
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOpened();
    };
  }, []);
  
  // Get onboarding data state for restoration logic
  const onboardingState = useAppSelector(state => state.onboarding);
  const hasOnboardingData = onboardingState.isDataSaved || 
    Object.keys(onboardingState.personalInfo).length > 0 ||
    Object.keys(onboardingState.assessmentData).length > 0 ||
    Object.keys(onboardingState.faithData).length > 0 ||
    Object.keys(onboardingState.accountabilityPreferences).length > 0;

  /**
   * Updated Navigation Logic with Data Restoration:
   * 1. First launch OR incomplete onboarding data -> OnboardingNavigator (with restoration)
   * 2. Not authenticated (returning user or onboarding completed) -> AuthStack
   * 3. Authenticated + has completed onboarding -> TabNavigator (main app)
   */
  const renderScreen = () => {
    // New user OR user with incomplete onboarding data - start/restore onboarding
    if (!hasCompletedOnboarding && !isAuthenticated) {
      // Determine if we're restoring data or starting fresh
      const isRestoring = hasOnboardingData && !isFirstLaunch;
      
      if (isRestoring) {
        console.log('Restoring onboarding data from previous session...');
        console.log('Onboarding progress:', onboardingState.progress);
      } else {
        console.log('Starting fresh onboarding flow...');
      }
      
      return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingNavigator}
            initialParams={{ restored: isRestoring }}
          />
        </Stack.Navigator>
      );
    }
    
    // User needs to authenticate (either completed onboarding or returning user)
    if (!isAuthenticated) {
      return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      );
    }
    
    // Authenticated user who completed onboarding OR skipped it -> main app
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="NewGroup" component={NewGroupScreen} />
        <Stack.Screen name="AICompanion" component={AICompanionScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="PartnersList" component={PartnersListScreen} />
        <Stack.Screen name="CheckInHistory" component={CheckInHistoryScreen} />
        <Stack.Screen name="PrayerRequests" component={PrayerRequestsScreen} />
        <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} />
        <Stack.Screen name="ScriptureBrowser" component={ScriptureBrowserScreen} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen 
          name="GrowthTracker" 
          component={GrowthTrackerScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditPartnerPhone" 
          component={EditPartnerPhoneScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };

  return (
    <PaperProvider theme={appTheme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar 
            barStyle="light-content" // Always light for dark theme
            backgroundColor={Theme.screen} // Dark background from theme
          />
          {renderScreen()}
          
          {/* Global Invitation Accept Modal */}
          <InvitationAcceptModal />
          <ShareInvitationModal />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

/**
 * Loading Component
 * 
 * Shows a loading screen while Redux store is being rehydrated.
 * This ensures the app doesn't render until persisted state is loaded.
 */
const LoadingScreen: React.FC = () => {
  return null; // You can add a custom loading screen here
};

/**
 * Main App Component
 * 
 * This is the root component that sets up all providers and global configuration.
 * It includes:
 * - Redux Provider for state management
 * - PersistGate for handling state persistence
 * - Paper Provider for UI theming
 * - SafeAreaProvider for handling device safe areas
 * - NavigationContainer for managing navigation state
 * - StatusBar configuration based on system theme
 */
function App(): React.JSX.Element {
 
  return (
    <StoreProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </StoreProvider>
  );
}

export default App;
