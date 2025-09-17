/**
 * Authentication Screen Component
 * 
 * Simplified authentication screen with only social login options.
 * Provides Google and Apple login buttons for easy authentication.
 * 
 * Features:
 * - Clean, minimal design
 * - Google and Apple social login buttons only
 * - Redux integration for authentication state
 * - Direct social authentication flow
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Image,
  ImageBackground,
  Modal,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Redux imports
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, loginUserWithApple } from '../store/slices/userSlice';


// Import centralized colors and icons
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';



// Define a type guard to check for error with code property
interface ErrorWithCode {
  code: any;
}

function isErrorWithCode(error: any): error is ErrorWithCode {
  return typeof error === 'object' && error !== null && 'code' in error;
}

interface AuthScreenProps {
  navigation?: any;
}

/**
 * Authentication Screen Component
 * 
 * Simplified component with only social login options.
 */
const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.user);
  const onboardingData = useAppSelector(state => state.onboarding);
  const hasCompletedOnboarding = useAppSelector(state => state.app.hasCompletedOnboarding);
  const [showRatePrompt, setShowRatePrompt] = useState(false);
  const [ratePromptShown, setRatePromptShown] = useState(false);
  const [hasShownRatePrompt, setHasShownRatePrompt] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID, // Loaded from .env file
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
  }, []);

  useEffect(() => {
    const loadRatePromptStatus = async () => {
      const shown = await AsyncStorage.getItem('hasShownRatePrompt');
      setHasShownRatePrompt(shown === 'true');
    };
    loadRatePromptStatus();
  }, []);

  useEffect(() => {
    if (hasCompletedOnboarding && !hasShownRatePrompt && !ratePromptShown) {
      const t = setTimeout(() => { setShowRatePrompt(true); setRatePromptShown(true); }, 1200);
      return () => clearTimeout(t);
    }
  }, [hasCompletedOnboarding, hasShownRatePrompt, ratePromptShown]);

  const APP_STORE_ID = '123456789';
  const PLAY_PACKAGE = 'com.pureheart';
  const storeUrls = Platform.select({
    ios: { app: `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`, web: `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review` },
    android: { app: `market://details?id=${PLAY_PACKAGE}`, web: `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}` },
    default: { app: 'https://thepurityapp.com', web: 'https://thepurityapp.com' },
  }) as { app: string; web: string };

  const openStoreReview = async () => {
    const primary = storeUrls.app; const fallback = storeUrls.web;
    try {
      const supported = await Linking.canOpenURL(primary);
      if (supported) await Linking.openURL(primary); else await Linking.openURL(fallback);
    } catch {
      try { await Linking.openURL(fallback); } catch {}
    }
    setShowRatePrompt(false);
    await AsyncStorage.setItem('hasShownRatePrompt', 'true');
    setHasShownRatePrompt(true);
  };

  useEffect(() => {
    console.log({onboardingData})
    console.log('--- Onboarding Data Collected ---');
    console.log('Personal Info:', JSON.stringify(onboardingData.personalInfo, null, 2));
    console.log('Assessment Data:', JSON.stringify(onboardingData.assessmentData, null, 2));
    console.log('Additional Assessment Data:', JSON.stringify(onboardingData.additionalAssessmentData, null, 2));
    console.log('Faith Data:', JSON.stringify(onboardingData.faithData, null, 2));
    console.log('How They Heard:', JSON.stringify(onboardingData.howTheyHeard, null, 2));
    console.log('Accountability Preferences:', JSON.stringify(onboardingData.accountabilityPreferences, null, 2));
    console.log('--- End of Onboarding Data ---');
  }, [onboardingData]);

  /**
   * Handle Google Login
   * 
   * Handles Google authentication integration.
   */
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.signOut();
      const data: any = await GoogleSignin.signIn();
      if (data && data.data?.idToken) {
        const { idToken } = data.data;
        // this one is the id that is initially sent as invitation
        const init_sent_accountability_id = await AsyncStorage.getItem('init_sent_accountability_id');
        // this is the one the user uses when he opens the app from a link
        const init_reciever_sent_accountablity_id = await AsyncStorage.getItem('init_reciever_sent_accountablity_id');
  
        await dispatch(loginUser({ 
          idToken, 
          onboardingData, 
          init_sent_accountability_id, 
          init_reciever_sent_accountablity_id 
        })).unwrap();

        if (init_sent_accountability_id) {
          await AsyncStorage.removeItem('init_sent_accountability_id');
        }
        if (init_reciever_sent_accountablity_id) {
          await AsyncStorage.removeItem('init_reciever_sent_accountablity_id');
        }
      } else {
        throw new Error('Google Sign-In failed to return an ID token.');
      }
    } catch (error: any) {
      
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google sign-in was cancelled by the user.');
      } else {
        console.error('Google login error:', error);
        Alert.alert('Google Login Error',
           'An error occurred during Google sign-in. Please try again.');
      }
    }
  };

  const handleAppleLogin = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;

      if (identityToken) {
        const init_sent_accountability_id = await AsyncStorage.getItem('init_sent_accountability_id');
        const init_reciever_sent_accountablity_id = await AsyncStorage.getItem('init_reciever_sent_accountablity_id');

        await dispatch(loginUserWithApple({ 
          identityToken, 
          onboardingData, 
          init_sent_accountability_id, 
          init_reciever_sent_accountablity_id 
        })).unwrap();
        
        if (init_sent_accountability_id) {
          await AsyncStorage.removeItem('init_sent_accountability_id');
        }
        if (init_reciever_sent_accountablity_id) {
          await AsyncStorage.removeItem('init_reciever_sent_accountablity_id');
        }
      } else {
        throw new Error('Apple Sign-In failed to return an identity token.');
      }
    } catch (error: any) {
      console.error('Apple login error:', error);
      if (error.code !== appleAuth.Error.CANCELED) {
        Alert.alert('Error', 'Failed to login with Apple. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          'rgba(18, 18, 18, 0.7)',
          'rgba(18, 18, 18, 0.85)',
          'rgba(18, 18, 18, 0.95)',
        ]}
        style={styles.gradientOverlay}
      />
      <SafeAreaView style={styles.contentWrapper}>
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../store-assets/final_form_image_101_cropped_to_be_used.png')}
                style={styles.appLogo}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.welcomeTitle}>Welcome Home</Text>
            <Text style={styles.welcomeSubtitle}>
              Return to your place of spiritual growth and accountability
            </Text>
            
            {/* Scripture verse */}
            <View style={styles.scriptureContainer}>
              <Text style={styles.scriptureText}>
                "How can a young person stay on the path of purity? By living according to your word."
              </Text>
              <Text style={styles.scriptureReference}>
                Psalm 119:9 NIV
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Signing you in...</Text>
          </View>
        )}

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          {/* Google Login Button */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {Platform.OS === 'ios' ? (
              <Icon 
                name={Icons.social.google.name} 
                library={Icons.social.google.library}
                size="lg" 
                color="#4285f4" 
              />
            ) : (
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
            )}
            <Text style={styles.socialButtonText}>Enter with Google</Text>
          </TouchableOpacity>

          {/* Apple Login Button */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Icon 
                name={Icons.social.apple.name} 
                color="#000000" 
                size="lg" 
              />
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>Enter with Apple</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By entering, you join a community committed to spiritual growth and mutual accountability
        </Text>
      </View>
        </View>
      </SafeAreaView>
      {/** Rate Prompt Modal */}
      <Modal visible={showRatePrompt} transparent animationType="fade" onRequestClose={() => setShowRatePrompt(false)}>
        <View style={styles.rateOverlay}>
          <View style={styles.rateCard}>
            <Text style={styles.rateTitle}>Enjoying PureHeart?</Text>
            <Text style={styles.rateSubtitle}>Leave a quick review to encourage others on their journey.</Text>
            <View style={styles.rateActions}>
              <TouchableOpacity style={[styles.rateButton, styles.ratePrimary]} onPress={openStoreReview}>
                <Text style={styles.ratePrimaryText}>Rate Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rateButton, styles.rateSecondary]} onPress={async () => {
                setShowRatePrompt(false);
                await AsyncStorage.setItem('hasShownRatePrompt', 'true');
                setHasShownRatePrompt(true);
              }}>
                <Text style={styles.rateSecondaryText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appLogo: {
    width: 280,
    height: 45,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 32,
  },
  scriptureContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scriptureText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.primary.main,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  scriptureReference: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  socialButtonsContainer: {
    gap: 16,
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  socialButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  appleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  appleButtonText: {
    color: '#000000',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285f4',
    fontFamily: Platform.OS === 'ios' ? 'Arial-BoldMT' : 'sans-serif-medium',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  rateOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  rateCard: { width: '100%', maxWidth: 360, backgroundColor: '#1e1e1e', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rateTitle: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  rateSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  rateActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rateButton: { flex: 1, paddingVertical: 14, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  ratePrimary: { backgroundColor: Colors.primary.main },
  ratePrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  rateSecondary: { backgroundColor: 'rgba(255,255,255,0.08)' },
  rateSecondaryText: { color: '#fff', fontWeight: '500', fontSize: 15 },
});

export default AuthScreen;
