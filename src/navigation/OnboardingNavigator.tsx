/**
 * OnboardingNavigator Component
 * 
 * Navigation stack for the onboarding flow.
 * Handles the progression through all 8 onboarding screens.
 * 
 * Features:
 * - Stack navigation for onboarding screens
 * - Parameter passing between screens
 * - Custom header styling
 * - Seamless flow management
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Import onboarding screens
import {
  Onboarding1Screen,
  Onboarding2Screen,
  Onboarding3Screen,
  Onboarding4Screen,
  Onboarding5Screen,
  Onboarding6Screen,
  Onboarding7Screen,
  Onboarding8Screen,
  Onboarding9Screen,
  Onboarding10Screen,
} from '../screens/onboarding';

import { Colors } from '../constants';

// Redux imports
import { useAppSelector } from '../store/hooks';

/**
 * Stack Navigator Type Definitions
 * 
 * Defines the parameter types for each onboarding screen.
 */
export type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: {
    userData?: {
      firstName: string;
      email: string;
      gender: string;
      ageRange: string;
      lifeSeason: string;
      password: string;
    };
  };
  Onboarding6: {
    userData?: any;
    assessmentData?: any;
  };
  Onboarding7: {
    userData?: any;
    assessmentData?: any;
    faithData?: any;
  };
  Onboarding8: {
    userData?: any;
    assessmentData?: any;
    faithData?: any;
  };
  Onboarding9: undefined;
  Onboarding10: undefined;
};

// Create the stack navigator
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * OnboardingNavigator Component
 * 
 * Provides navigation between onboarding screens with proper parameter passing.
 * Also handles restoration of onboarding progress when user returns.
 */
const OnboardingNavigator: React.FC<{ route?: any }> = ({ route }) => {
  const navigation = useNavigation();
  
  // Get onboarding state for restoration
  const onboardingState = useAppSelector(state => state.onboarding);
  const isRestored = route?.params?.restored || false;
  
  // Determine initial route based on saved progress
  const getInitialRouteName = () => {
    if (!isRestored) {
      return 'Onboarding1';
    }
    
    // If restoring, navigate to the appropriate screen based on progress
    const { currentStep, completedSteps } = onboardingState.progress;
    
    // Go to the next incomplete step or the current step
    if (completedSteps.includes(7)) {
      return 'Onboarding8'; // Final screen
    } else if (completedSteps.includes(6)) {
      return 'Onboarding7';
    } else if (completedSteps.includes(5)) {
      return 'Onboarding6';
    } else if (completedSteps.includes(4)) {
      return 'Onboarding5';
    } else if (Object.keys(onboardingState.personalInfo).length > 0) {
      return 'Onboarding4'; // Has some personal info, let them continue/edit
    }
    
    return 'Onboarding1'; // Default fallback
  };
  
  const initialRouteName = getInitialRouteName();
  
  // Log restoration info
  useEffect(() => {
    if (isRestored) {
      console.log('Onboarding Navigator: Restoring to screen:', initialRouteName);
      console.log('Saved progress:', onboardingState.progress);
      console.log('Saved data summary:', {
        hasPersonalInfo: Object.keys(onboardingState.personalInfo).length > 0,
        hasAssessmentData: Object.keys(onboardingState.assessmentData).length > 0,
        hasFaithData: Object.keys(onboardingState.faithData).length > 0,
        hasAccountabilityPrefs: Object.keys(onboardingState.accountabilityPreferences).length > 0,
      });
    }
  }, [isRestored, initialRouteName, onboardingState]);
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false, // All onboarding screens handle their own headers
        gestureEnabled: false, // Prevent swipe back to maintain flow integrity
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: Colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Onboarding1"
        component={Onboarding1Screen}
        options={{
          title: 'Welcome',
        }}
      />

      <Stack.Screen
        name="Onboarding2"
        component={Onboarding2Screen}
        options={{
          title: 'You Are Not Alone',
        }}
      />

      <Stack.Screen
        name="Onboarding3"
        component={Onboarding3Screen}
        options={{
          title: 'Vision of Freedom',
        }}
      />

      <Stack.Screen
        name="Onboarding4"
        component={Onboarding4Screen}
        options={{
          title: 'Personal Information',
        }}
      />

      <Stack.Screen
        name="Onboarding5"
        component={Onboarding5Screen}
        options={{
          title: 'Assessment',
        }}
      />

      <Stack.Screen
        name="Onboarding6"
        component={Onboarding6Screen}
        options={{
          title: 'Faith Background',
        }}
      />

      <Stack.Screen
        name="Onboarding7"
        component={Onboarding7Screen}
        options={{
          title: 'Accountability Setup',
        }}
      />

      <Stack.Screen
        name="Onboarding8"
        component={Onboarding8Screen}
        options={{
          title: 'Welcome Complete',
        }}
      />

      <Stack.Screen
        name="Onboarding9"
        component={Onboarding9Screen}
        options={{
          title: 'How You Heard About Us',
        }}
      />

      <Stack.Screen
        name="Onboarding10"
        component={Onboarding10Screen}
        options={{
          title: 'Additional Questions',
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
