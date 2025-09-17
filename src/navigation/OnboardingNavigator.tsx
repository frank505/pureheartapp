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
  GetStartedScreen,
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
  Onboarding11Screen,
  Onboarding12Screen,
  Onboarding13Screen,
  Onboarding14Screen,
  Onboarding15Screen,
  Onboarding16Screen,
  Onboarding17Screen,
  Onboarding18Screen,
  Onboarding19Screen,
  Onboarding20Screen,
  Onboarding21Screen,
  Onboarding22Screen,
  Onboarding23Screen,
  Onboarding24Screen,
  Onboarding25Screen,
  Onboarding26Screen,
  Onboarding27Screen,
  Onboarding28Screen,
  Onboarding29Screen,
  PersonalizationScreen,
  OnboardingPersonalizingScreen,
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
  GetStartedScreen: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  OnboardingPersonalizing: undefined;
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
  Onboarding11: undefined;
  Onboarding12: undefined;
  Onboarding13: undefined;
  Onboarding14: undefined;
  Onboarding15: undefined;
  Onboarding16: undefined;
  Onboarding17: undefined;
  Onboarding18: undefined;
  Onboarding19: undefined;
  Onboarding20: undefined;
  Onboarding21: undefined;
  Onboarding22: undefined;
  Onboarding23: undefined;
  Onboarding24: undefined;
  Onboarding25: undefined;
  Onboarding26: undefined;
  Onboarding27: undefined;
  Onboarding28: undefined;
  Onboarding29: undefined;
  Personalization: undefined;
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
      return 'GetStartedScreen';
    }
    
    // If restoring, navigate to the appropriate screen based on progress
    const { currentStep, completedSteps } = onboardingState.progress;
    
    // Go to the next incomplete step or the current step
    if (completedSteps.includes(9)) {
      return 'Onboarding8'; // Final screen
    } else if (completedSteps.includes(8)) {
      return 'Onboarding7';
    } else if (completedSteps.includes(7)) {
      return 'Onboarding6';
    } else if (completedSteps.includes(6)) {
      return 'Onboarding5';
    } else if (Object.keys(onboardingState.personalInfo).length > 0) {
      return 'Onboarding4'; // Has some personal info, let them continue/edit
    }
    
    return 'GetStartedScreen'; // Default fallback
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
        name="GetStartedScreen"
        component={GetStartedScreen}
        options={{
          title: 'Welcome',
        }}
      />

      <Stack.Screen
        name="Onboarding1"
        component={Onboarding1Screen}
        options={{
          title: 'You Are Not Alone',
        }}
      />

      <Stack.Screen
        name="Onboarding2"
        component={Onboarding2Screen}
        options={{
          title: 'Vision of Freedom',
        }}
      />

      <Stack.Screen
        name="Onboarding3"
        component={Onboarding3Screen}
        options={{
          title: 'Personal Information',
        }}
      />

      <Stack.Screen
        name="OnboardingPersonalizing"
        component={OnboardingPersonalizingScreen}
        options={{
          title: 'Personalizing',
        }}
      />

      <Stack.Screen
        name="Onboarding4"
        component={Onboarding4Screen}
        options={{
          title: 'Assessment',
        }}
      />

      <Stack.Screen
        name="Onboarding5"
        component={Onboarding5Screen}
        options={{
          title: 'Faith Background',
        }}
      />

      <Stack.Screen
        name="Onboarding6"
        component={Onboarding6Screen}
        options={{
          title: 'Welcome Complete',
        }}
      />

      <Stack.Screen
        name="Onboarding7"
        component={Onboarding7Screen}
        options={{
          title: 'How You Heard About Us',
        }}
      />

      <Stack.Screen
        name="Onboarding8"
        component={Onboarding8Screen}
        options={{
          title: 'Accountability Setup',
        }}
      />

      <Stack.Screen
        name="Onboarding9"
        component={Onboarding9Screen}
        options={{
          title: 'Additional Questions',
        }}
      />
      <Stack.Screen
        name="Onboarding10"
        component={Onboarding10Screen}
        options={{
          title: 'Additional Questions',
        }}
      />
      <Stack.Screen
        name="Onboarding11"
        component={Onboarding11Screen}
        options={{
          title: 'Calculating',
        }}
      />
      <Stack.Screen
        name="Onboarding12"
        component={Onboarding12Screen}
        options={{
          title: 'Analysis Complete',
        }}
      />
      <Stack.Screen
        name="Onboarding13"
        component={Onboarding13Screen}
        options={{
          title: 'User Info',
        }}
      />
      <Stack.Screen
        name="Onboarding14"
        component={Onboarding14Screen}
        options={{
          title: 'Symptoms',
        }}
      />
      <Stack.Screen
        name="Onboarding15"
        component={Onboarding15Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding16"
        component={Onboarding16Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding17"
        component={Onboarding17Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding18"
        component={Onboarding18Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding19"
        component={Onboarding19Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding20"
        component={Onboarding20Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding21"
        component={Onboarding21Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding22"
        component={Onboarding22Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding23"
        component={Onboarding23Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding24"
        component={Onboarding24Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding25"
        component={Onboarding25Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding26"
        component={Onboarding26Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding27"
        component={Onboarding27Screen}
        options={{
          title: 'Education',
        }}
      />
      <Stack.Screen
        name="Onboarding28"
        component={Onboarding28Screen}
        options={{
          title: 'Goals',
        }}
      />
      <Stack.Screen
        name="Onboarding29"
        component={Onboarding29Screen}
        options={{
          title: 'Accountability Setup',
        }}
      />
      <Stack.Screen
        name="Personalization"
        component={PersonalizationScreen}
        options={{
          title: 'Personalization',
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
