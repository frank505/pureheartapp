/**
 * AICompanionScreen Component
 * 
 * Welcome screen for AI companion features.
 * Shows benefits and starts the AI companion journey.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface AICompanionScreenProps {
  navigation?: any;
  route?: any;
}

const AICompanionScreen: React.FC<AICompanionScreenProps> = ({ navigation }) => {
  
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleStartJourney = () => {
    // Navigate to AI chat or main app
    navigation?.goBack();
  };

  const handleLogin = () => {
    navigation?.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <ImageBackground
          source={require('../../assets/images/appbackgroundimage.png')}
          style={styles.heroSection}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Welcome to {'\n'}A Path to Purity
              </Text>
              <Text style={styles.heroSubtitle}>
                Your AI companion in the fight for freedom.
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresList}>
            <Surface style={styles.featureCard} elevation={1}>
              <View style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  <Icon 
                    name="time-outline" 
                    color={Colors.primary.main} 
                    size="lg" 
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>24/7 Emergency Support</Text>
                  <Text style={styles.featureDescription}>
                    Immediate, AI-powered help is always available when you need it most.
                  </Text>
                </View>
              </View>
            </Surface>

            <Surface style={styles.featureCard} elevation={1}>
              <View style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  <Icon 
                    name="people-outline" 
                    color={Colors.primary.main} 
                    size="lg" 
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Christian Brotherhood</Text>
                  <Text style={styles.featureDescription}>
                    Connect with a supportive community of men on the same journey.
                  </Text>
                </View>
              </View>
            </Surface>

            <Surface style={styles.featureCard} elevation={1}>
              <View style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  <Icon 
                    name="book-outline" 
                    color={Colors.primary.main} 
                    size="lg" 
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Biblical Truth</Text>
                  <Text style={styles.featureDescription}>
                    Find strength and guidance rooted in the unchanging Word of God.
                  </Text>
                </View>
              </View>
            </Surface>
          </View>

          {/* Testimonial */}
          <Surface style={styles.testimonialCard} elevation={2}>
            <View style={styles.testimonialContent}>
              <Text style={styles.testimonialText}>
                "This app has been a lifeline. Knowing I'm not alone and having access to support anytime has made all the difference."
              </Text>
              <Text style={styles.testimonialAuthor}>
                - A Brother in Christ
              </Text>
            </View>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Button
              mode="contained"
              onPress={handleStartJourney}
              style={styles.primaryButton}
              contentStyle={styles.primaryButtonContent}
              labelStyle={styles.primaryButtonLabel}
              buttonColor={Colors.primary.main}
            >
              Start Your Freedom Journey
            </Button>
            
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
        <Icon 
          name="close-outline" 
          color={Colors.text.primary} 
          size="md" 
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: 56, // Below safe area
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Hero Section
  heroSection: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#e5e7eb', // gray-200
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features Section
  featuresSection: {
    padding: 24,
    gap: 32,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  // Testimonial
  testimonialCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  testimonialContent: {
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Action Section
  actionSection: {
    gap: 16,
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
  },
  primaryButtonContent: {
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  loginText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
  },
});

export default AICompanionScreen;