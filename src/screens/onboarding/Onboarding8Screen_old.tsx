/**
 * Onboarding Screen 8 - Data Personalization
 * 
 * Final onboarding screen that shows a personalization process
 * with a circular progress indicator.
 * 
 * Features:
 * - Full-screen circular progress bar
 * - "Personalizing user data" message
 * - Smooth animation
 * - Continue button that leads to authentication
 * - Clean, modern design
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
import LinearGradient from 'react-native-linear-gradient';
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
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Final Onboarding Screen Component
 * 
 * Personalization progress screen that leads to authentication.
 */
const Onboarding8Screen: React.FC<Onboarding8ScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  
  // Animation state
  const [progress] = useState(new Animated.Value(0));
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Get all onboarding data from Redux store (persisted)
  const storedPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  const storedAssessmentData = useAppSelector(state => state.onboarding.assessmentData);
  const storedFaithData = useAppSelector(state => state.onboarding.faithData);
  const storedAccountabilityPrefs = useAppSelector(state => state.onboarding.accountabilityPreferences);
  
  // Use stored data or fallback to route params
  const userData = route.params?.userData || storedPersonalInfo;
  const assessmentData = route.params?.assessmentData || storedAssessmentData;
  const faithData = route.params?.faithData || storedFaithData;
  const userName = userData?.firstName || storedPersonalInfo.firstName || 'Friend';

  // Progress animation
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000, // 3 seconds for full progress
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        // Show continue button after progress completes
        setTimeout(() => {
          setShowContinueButton(true);
        }, 500);
      });
    };

    // Start animation after component mounts
    const timer = setTimeout(animateProgress, 500);
    return () => clearTimeout(timer);
  }, [progress]);

  const handleContinue = () => {
    // Mark data as transferred (will be used during account creation)
    dispatch(markDataAsTransferred());
    
    // Mark onboarding as completed
    dispatch(completeOnboarding());
    
    // Log completion for debugging
    console.log('Onboarding completed - navigating to authentication');
    console.log('Complete onboarding data:', {
      personalInfo: storedPersonalInfo,
      assessmentData: storedAssessmentData,
      faithData: storedFaithData,
      accountabilityPrefs: storedAccountabilityPrefs
    });
    
    // Navigate to authentication screen
    navigation.navigate('Auth');
  };

  // Calculate circle properties
  const circleRadius = 80;
  const circleCircumference = 2 * Math.PI * circleRadius;
  
  // Animated stroke dash offset
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, 0],
  });

  // Animated progress percentage
  const progressPercentage = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={styles.gradientBackground}
      >
        <View style={styles.contentContainer}>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Background */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIo5FXg4QORMbzEAb-WbMr1ihYXLz3D431Az6BvVuQgOJB7byzkn3Y9-t7E0Gj_Y5omT8xdYK_h1fpO-Y1UqpZuVC2IhOCq_FY3Ficp55Gjk7xeY4L4RVaYn5IGFfgAWQnBmq-0bEcXa4Ngcu-J-wFYx6b0Z-nuFQZDFnaYe2HhtvRzlXu3LcjJ89PLl5dl1TKTuGQ0iXa2o_zDmnL1s7vaoF2Hn0egQ9cDiBPPbeE4mGAX3sG6rChCHUarfXR1X_xtkZPO-N_aVvK'
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(0, 0, 0, 0.5)',
                'transparent',
                'rgba(18, 18, 18, 1)',
              ]}
              style={styles.gradientOverlay}
            />
          </ImageBackground>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Welcome to Your Freedom Journey, {userName}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Congratulations, {userName}! You've taken a monumental step towards a life of freedom and purpose. This is your new beginning, filled with hope and strength.
          </Text>
        </View>

        {/* Personalized Plan Card */}
        <View style={styles.contentContainer}>
          <OnboardingCard style={styles.planCard}>
            <Text style={styles.cardTitle}>Your Personalized Plan</Text>
            <View style={styles.planDetails}>
              <View style={styles.planItem}>
                <Text style={styles.planLabel}>Daily Focus</Text>
                <Text style={styles.planValue}>{personalizedPlan.dailyFocus}</Text>
              </View>
              <View style={styles.planDivider} />
              
              <View style={styles.planItem}>
                <Text style={styles.planLabel}>First Bible Verse</Text>
                <Text style={styles.planValue}>{personalizedPlan.firstVerse}</Text>
              </View>
              <View style={styles.planDivider} />
              
              <View style={styles.planItem}>
                <Text style={styles.planLabel}>Accountability Connection</Text>
                <Text style={styles.planValue}>{personalizedPlan.accountabilityConnection}</Text>
              </View>
              <View style={styles.planDivider} />
              
              <View style={styles.planItem}>
                <Text style={styles.planLabel}>Transformation Program</Text>
                <Text style={styles.planValue}>{personalizedPlan.transformationProgram}</Text>
              </View>
              <View style={styles.planDivider} />
              
              <View style={styles.planItem}>
                <Text style={styles.planLabel}>Reminder Settings</Text>
                <Text style={styles.planValue}>{personalizedPlan.reminderSettings}</Text>
              </View>
            </View>
          </OnboardingCard>

          {/* First Actions Card */}
          <OnboardingCard style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Your First Actions</Text>
            <View style={styles.actionsList}>
              {firstActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleActionPress(action.id)}
                  style={styles.actionItem}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.chevronIcon}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </OnboardingCard>

          {/* Biblical Promise Card */}
          <OnboardingCard style={styles.promiseCard}>
            <Text style={styles.cardTitle}>Your Biblical Promise</Text>
            <Text style={styles.promiseVerse}>
              "I can do all things through Christ who strengthens me."
            </Text>
            <Text style={styles.promiseReference}>
              - Philippians 4:13
            </Text>
          </OnboardingCard>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title="Begin Day 1"
          onPress={handleBeginDay1}
          variant="primary"
          style={styles.primaryButton}
        />
        
        <OnboardingButton
          title="Explore the App"
          onPress={handleExploreApp}
          variant="secondary"
          style={styles.secondaryButton}
        />

        <Text style={styles.supportText}>
          Need help? We're here for you 24/7.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 180, // Space for bottom buttons
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.6,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 350,
  },
  contentContainer: {
    paddingHorizontal: 24,
    gap: 24,
    zIndex: 10,
  },
  planCard: {
    backgroundColor: Colors.background.secondary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  planDetails: {
    gap: 12,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  planLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  planValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  planDivider: {
    height: 1,
    backgroundColor: Colors.border.primary,
    marginVertical: 4,
  },
  actionsCard: {
    backgroundColor: Colors.background.secondary,
  },
  actionsList: {
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  chevronIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  promiseCard: {
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  promiseVerse: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  promiseReference: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.background.primary}CC`, // 80% opacity
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 16,
  },
  supportText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default Onboarding8Screen;
