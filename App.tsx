/**
 * PureHeart React Native App
 * 
 * Main application entry point with Redux, navigation, and UI theme setup.
 * This app features a bottom tab navigation with four main sections:
 * Home, Explore, Profile, and Settings, plus Redux state management.
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme, Linking, Alert } from 'react-native';
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
import InviteFriendScreen from './src/screens/InviteFriendScreen';
import InvitationAcceptModal from './src/components/InvitationAcceptModal';

// Import Redux hooks and actions
import { useAppSelector, useAppDispatch } from './src/store/hooks';
import { processDeepLinkInvitation } from './src/store/slices/invitationSlice';

// Import invitation service
import InvitationService from './src/services/invitationService';

// Import centralized theme
import { Theme } from './src/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const dispatch = useAppDispatch();
  AsyncStorage.clear();
  // Get authentication and onboarding state from Redux
  const { isAuthenticated } = useAppSelector(state => state.user);
  const { isFirstLaunch, hasCompletedOnboarding } = useAppSelector(state => state.app);
  const { processingInvitation, isProcessingDeepLink } = useAppSelector(state => state.invitation);
  const [shouldClearAsyncStorage, setShouldClearAsyncStorage] = useState(false);

  
  


//   useEffect(()=> {
//    // clear all asyncstorage 
//  if(shouldClearAsyncStorage || !shouldClearAsyncStorage){
//   AsyncStorage.clear();
//   setShouldClearAsyncStorage(false);
//  }
  
//    }, [shouldClearAsyncStorage])

  /**
   * Deep Link Handler
   * 
   * Handles incoming deep links when app is opened via URL.
   * Processes invitation links and navigates appropriately.
   */
  useEffect(() => {
    // Handle initial URL when app is opened from a deep link
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('App opened with URL:', initialUrl);
          await handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle URLs when app is already running
    const handleUrlChange = (url: string) => {
      console.log('URL changed:', url);
      handleDeepLink(url);
    };

    // Set up listeners
    handleInitialUrl();
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrlChange(url));

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Process Deep Link URL
   * 
   * Extracts invitation hash from URL and processes the invitation.
   * Shows appropriate UI based on user authentication state.
   */
  const handleDeepLink = async (url: string) => {
    try {
      // Extract invitation hash from URL
      const hash = InvitationService.extractHashFromUrl(url);
      
      if (!hash) {
        console.log('No valid invitation hash found in URL:', url);
        return;
      }

      // Validate hash format
      if (!InvitationService.validateInvitationHash(hash)) {
        console.log('Invalid invitation hash format:', hash);
        Alert.alert(
          'Invalid Invitation',
          'The invitation link appears to be invalid or corrupted.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Processing invitation with hash:', hash);

      // Process the invitation via Redux
      try {
        await dispatch(processDeepLinkInvitation(hash)).unwrap();
        
        // If user is not authenticated, they'll need to sign in first
        if (!isAuthenticated) {
          Alert.alert(
            'Invitation Received!',
            'Please sign in to accept this invitation and connect with your friend.',
            [{ text: 'OK' }]
          );
        } else {
          // User is authenticated, show invitation directly
          console.log('Invitation processed successfully for authenticated user');
        }
      } catch (error) {
        console.error('Error processing invitation:', error);
        Alert.alert(
          'Invitation Error',
          typeof error === 'string' ? error : 'Unable to process the invitation. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };
 
  
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
        <Stack.Screen name="InviteFriend" component={InviteFriendScreen} />
      </Stack.Navigator>
    );
  };

  return (
    <PaperProvider theme={appTheme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" // Always light for dark theme
            backgroundColor={Theme.screen} // Dark background from theme
          />
          {renderScreen()}
          
          {/* Global Invitation Accept Modal */}
          <InvitationAcceptModal />
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
