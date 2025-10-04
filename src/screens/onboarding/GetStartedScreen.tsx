/**
 * Onboarding Screen 1 - Welcome
 * 
 * First onboarding screen that introduces the app and its mission.
 * Features a hero image, app logo, welcome message, testimonial, and action buttons.
 * 
 * Features:
 * - Hero background image with gradient overlay
 * - App logo and welcome message
 * - Bible verse quote
 * - User testimonial with rating
 * - Primary and secondary action buttons
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import { Colors } from '../../constants';
import type { UserType } from '../../constants';
import { saveUserType as saveUserTypeToStorage } from '../../utils/userTypeUtils';

// Redux imports
import { useAppDispatch } from '../../store/hooks';
import { completeOnboarding, completeFirstLaunch } from '../../store/slices/appSlice';
import { saveUserType as saveUserTypeToRedux } from '../../store/slices/onboardingSlice';

interface GetStartedScreenProps {
  navigation: any;
}

const { height: screenHeight } = Dimensions.get('window');

/**
 * First Onboarding Screen Component
 * 
 * Welcome screen that introduces users to PureHeart app.
 */
const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  
  const handleUserTypeSelection = async (userType: UserType) => {
    try {
      // Save user type to AsyncStorage using utility function
      await saveUserTypeToStorage(userType);
      
      // Save user type to Redux store
      dispatch(saveUserTypeToRedux(userType));
      
      setSelectedUserType(userType);
      
      // Mark first launch as completed when user selects their type
      dispatch(completeFirstLaunch());
       dispatch(completeOnboarding());
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  };

  const handleSignIn = async () => {
    // Complete first launch and onboarding, then go to auth flow
    dispatch(completeFirstLaunch());
    dispatch(completeOnboarding());
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/appbackgroundimage.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(18, 18, 18, 0.8)',
            'rgba(18, 18, 18, 1)',
          ]}
          style={styles.gradientOverlay}
        />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* App Logo and Main Content */}
          <View style={styles.mainContent}>
            {/* Chain Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⛓️</Text>
            </View>

            {/* App Logo */}
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />

            {/* Welcome Title */}
            <Text style={styles.welcomeTitle}>
              Your Journey to Freedom Starts Here
            </Text>

            {/* Welcome Subtitle */}
            <Text style={styles.welcomeSubtitle}>
              Find lasting freedom from pornography through the strength and love of Christ.
            </Text>
          </View>

          {/* Bible Verse Quote */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              "So if the Son sets you free, you will be free indeed."
            </Text>
            <Text style={styles.quoteAttribution}>
              - John 8:36
            </Text>
          </View>

          {/* Testimonial Card */}
          <OnboardingCard style={styles.testimonialCard} transparent>
            <Text style={styles.testimonialText}>
              "This app has been a game-changer in my walk with God and my fight for purity."
            </Text>
            <View style={styles.testimonialRating}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.testimonialAuthor}>- A Grateful User</Text>
            </View>
          </OnboardingCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* User Type Selection Header */}
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionTitle}>Get Started</Text>
            <Text style={styles.selectionSubtitle}>
              Choose how you'd like to begin
            </Text>
          </View>
         {/* User Sign Up Button */}
          <OnboardingButton
            title="Begin Your Freedom Journey"
            onPress={() => handleUserTypeSelection('user')}
            variant="primary"
            style={styles.primaryButton}
          />

          {/* Partner Sign Up Button */}
          <OnboardingButton
            title="I'm an Accountability Buddy"
            onPress={() => handleUserTypeSelection('partner')}
            variant="primary"
            style={styles.primaryButton}
          />     
          
          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In Button */}
          <OnboardingButton
            title="I Already Have an Account"
            onPress={handleSignIn}
            variant="secondary"
            style={styles.secondaryButton}
          />

          <Text style={styles.trustText}>
            Trusted by thousands on their path to recovery.
          </Text>
        </View>
        </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: screenHeight,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
    color: '#f5993d',
  },
  appLogo: {
    width: 200,
    height: 50,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  quoteText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  quoteAttribution: {
    fontSize: 14,
    color: 'rgba(163, 163, 163, 0.8)',
    fontStyle: 'italic',
  },
  testimonialCard: {
    maxWidth: 320,
    width: '100%',
    marginBottom: 40,
  },
  testimonialText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  testimonialRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stars: {
    fontSize: 16,
    color: '#f5993d',
  },
  testimonialAuthor: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
    zIndex: 10,
  },
  selectionHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  primaryButton: {
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(163, 163, 163, 0.3)',
  },
  dividerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    marginBottom: 16,
  },
  trustText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default GetStartedScreen;
