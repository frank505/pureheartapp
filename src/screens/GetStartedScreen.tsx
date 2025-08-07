/**
 * Get Started Screen Component
 * 
 * This is the first screen users see when opening the app for the first time.
 * It provides a welcoming introduction and guides users to begin their journey.
 * 
 * Features:
 * - Hero-style layout with background image
 * - Inspiring title and tagline
 * - Call-to-action button
 * - Dark theme design matching HTML mockup
 * - Smooth navigation to authentication
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

// Redux imports
import { useAppDispatch } from '../store/hooks';
import { completeFirstLaunch } from '../store/slices/appSlice';

// Import centralized colors and icons
import { Colors } from '../constants';
import Icon from '../components/Icon';

const { width, height } = Dimensions.get('window');

/**
 * Get Started Screen Component
 * 
 * Welcomes users and introduces them to the app's purpose.
 * Provides smooth transition to the authentication flow.
 */
const GetStartedScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  /**
   * Handle Get Started Button Press
   * 
   * Marks onboarding as completed and proceeds to authentication.
   */
  const handleGetStarted = () => {
    dispatch(completeFirstLaunch());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image with Overlay */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        
        {/* Content Container */}
        <SafeAreaView style={styles.contentContainer}>
          {/* Main Content */}
          <View style={styles.heroSection}>
            {/* App Icon/Logo */}
            <View style={styles.logoContainer}>
              <Icon 
                name="heart"
                size={60}
                color={Colors.primary.main}
              />
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>
              Begin Your Journey{'\n'}to Freedom
            </Text>

            {/* Hero Subtitle */}
            <Text style={styles.heroSubtitle}>
              Find strength, community, and healing{'\n'}in your walk with faith.
            </Text>

            {/* Feature Highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Icon name="people-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.featureText}>Join a supportive community</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="shield-checkmark-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.featureText}>Private and secure journey</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="trending-up-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.featureText}>Track your progress</Text>
              </View>
            </View>
          </View>

          {/* Bottom Action Section */}
          <View style={styles.actionSection}>
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.getStartedButton}
              contentStyle={styles.getStartedButtonContent}
              labelStyle={styles.getStartedButtonLabel}
              buttonColor={Colors.primary.main}
              textColor={Colors.white}
            >
              Get Started
            </Button>

            {/* Encouragement Text */}
            <Text style={styles.encouragementText}>
              Take the first step towards transformation
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    alignItems: 'flex-start',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionSection: {
    alignItems: 'center',
    gap: 16,
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 12,
    elevation: 4,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedButtonContent: {
    paddingVertical: 12,
  },
  getStartedButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  encouragementText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});

export default GetStartedScreen;