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

import React from 'react';
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

// Redux imports
import { useAppDispatch } from '../../store/hooks';
import { completeOnboarding, completeFirstLaunch } from '../../store/slices/appSlice';

interface Onboarding1ScreenProps {
  navigation: any;
}

const { height: screenHeight } = Dimensions.get('window');

/**
 * First Onboarding Screen Component
 * 
 * Welcome screen that introduces users to PureHeart app.
 */
const Onboarding1Screen: React.FC<Onboarding1ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  const handleBeginJourney = () => {
    // Mark first launch as completed when user begins the journey
    dispatch(completeFirstLaunch());
    navigation.navigate('Onboarding2');
  };

  const handleSignIn = () => {
    // Complete first launch and onboarding, then go to auth flow
    dispatch(completeFirstLaunch());
    dispatch(completeOnboarding());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Background with Gradient Overlay */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhmN_zYCw9ezjTt-o30zHTGxhk_aYEspPWeORup_LReTd5D5QRc8yoyKIz7Nu78hLQVWQWBrr2BHP0aZlyrVASQS9_J6nhsNnK5OoMMHr4FyDx4YcQgjFs3upR9Ke2BC6xxPk_g1h25cV90aJu8exfkUi45FtJFaGwD21ufpkJwbCoD8wuQm_N9qOO04dYFjSwvWWpMfTAy9FnK5Mr-Qdy0Ld7_JLV_1C28hgXJCIj8CiFU55nVwlQtOXMQk7VEsUyX66T8FSOKdKd'
            }}
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
          </ImageBackground>
        </View>

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
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKPPk7qXiLLpurMRshjIYa8KBeYfx9nnPX8coCZHnlXyhZNYrZf2x7Fj1nlYdomXKgA5GTkZM2nx_ky4jfRzgnIvaCQZ90dmxKlgwjqsRm_aAtEe1YwYIkZ6s56DOcLQjyoZgqXozYtpmNW-Cs25FlYFIGZPSBesQ4etudzfolkzcNqf6DChflxkWYVKZJvUhAfmWl-ebkg-z14PWaM4bvupZbNm33zNZbgAsH-TIJWAASuCMxUmi07dylYNRJ_4nM_rLq4V9DC90M'
              }}
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
          <OnboardingButton
            title="Begin Your Freedom Journey"
            onPress={handleBeginJourney}
            variant="primary"
            style={styles.primaryButton}
          />
          
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
    paddingTop: 80,
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
    width: 120,
    height: 48,
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
  primaryButton: {
    marginBottom: 8,
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

export default Onboarding1Screen;
