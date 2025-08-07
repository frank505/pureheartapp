/**
 * Onboarding Screen 8 - Personalizing User Data
 * 
 * Final onboarding screen that shows a circular progress indicator
 * while personalizing user data, then provides a continue button
 * to proceed to authentication.
 * 
 * Features:
 * - Full screen circular progress indicator
 * - "Personalizing user data" message
 * - Continue button that navigates to AuthScreen
 * - Clean, minimal design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { completeOnboarding } from '../../store/slices/appSlice';
import { clearOnboardingData, markDataAsTransferred } from '../../store/slices/onboardingSlice';

interface Onboarding8ScreenProps {
  navigation: any;
  route: {
    params?: {
      userData?: any;
      assessmentData?: any;
      faithData?: any;
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Animated Circle Component for Progress Indicator
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Final Onboarding Screen Component
 * 
 * Personalizing user data screen with circular progress indicator.
 */
const Onboarding8Screen: React.FC<Onboarding8ScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  
  // State for animation and progress
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [percentage, setPercentage] = useState('0.0%');
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Get all onboarding data from Redux store (persisted)
  const storedPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  const storedAssessmentData = useAppSelector(state => state.onboarding.assessmentData);
  const storedFaithData = useAppSelector(state => state.onboarding.faithData);
  const storedAccountabilityPrefs = useAppSelector(state => state.onboarding.accountabilityPreferences);
  
  // Progress steps for personalization
  const progressSteps = [
    'Analyzing your responses...',
    'Creating your personalized plan...',
    'Setting up your journey...',
    'Preparing your experience...',
    'Almost ready!'
  ];

  // Start the personalization animation
  useEffect(() => {
    // Add a listener to update the percentage state
    progress.addListener(({ value }) => {
      setPercentage(`${(value * 100).toFixed(1)}%`);
    });

    startPersonalizationProcess();

    return () => {
      progress.removeAllListeners();
    };
  }, []);

  const startPersonalizationProcess = () => {
    // Animate progress bar and cycle through steps
    const stepDuration = 1000; // 1 second per step
    
    progressSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        
        // Animate progress to this step
        Animated.timing(progress, {
          toValue: (index + 1) / progressSteps.length,
          duration: stepDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        
        // Show continue button after last step
        if (index === progressSteps.length - 1) {
          setTimeout(() => {
            setShowContinueButton(true);
          }, stepDuration);
        }
      }, index * stepDuration);
    });
  };

  const handleContinue = () => {
    // Mark data as transferred (will be used during account creation)
    dispatch(markDataAsTransferred());
    
    // Mark onboarding as completed
    dispatch(completeOnboarding());
    
    // Log completion for debugging
    console.log('Onboarding completed - data saved for future account creation');
    console.log('Complete onboarding data:', {
      personalInfo: storedPersonalInfo,
      assessmentData: storedAssessmentData,
      faithData: storedFaithData,
      accountabilityPrefs: storedAccountabilityPrefs
    });
    
    // The app will automatically navigate to auth flow due to state change
  };

  // Calculate circle properties for animation
  const circleSize = Math.min(screenWidth, screenHeight) * 0.4;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content - Centered */}
      <View style={styles.contentContainer}>
        {/* Circular Progress Indicator */}
        <View style={styles.progressContainer}>
          <Svg width={circleSize} height={circleSize} style={styles.progressSvg}>
            {/* Background Circle */}
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke={Colors.border.primary}
              strokeWidth={strokeWidth}
              fill="transparent"
              opacity={0.3}
            />
            
            {/* Animated Progress Circle */}
            <AnimatedCircle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke={Colors.primary.main}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress.interpolate({
                inputRange: [0, 1],
                outputRange: [circumference, 0],
              })}
              strokeLinecap="round"
              transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
            />
          </Svg>
          
          {/* Progress Percentage */}
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressPercentage}>
              {percentage}
            </Text>
          </View>
        </View>

        {/* Personalizing Text */}
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>Personalizing User Data</Text>
          <Text style={styles.stepText}>{progressSteps[currentStep]}</Text>
        </View>

        {/* Continue Button (appears after completion) */}
        {showContinueButton && (
          <View style={styles.buttonContainer}>
            <OnboardingButton
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              style={styles.continueButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 48,
  },
  progressSvg: {
    alignSelf: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  continueButton: {
    borderRadius: 12,
  },
});

export default Onboarding8Screen;
