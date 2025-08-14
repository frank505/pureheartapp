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

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
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

import { processDeepLinkInvitation } from '../store/slices/invitationSlice';

// Import centralized colors and icons
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID, // Loaded from .env file
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
  }, []);

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
        Alert.alert('Google Login Error', 'An error occurred during Google sign-in. Please try again.');
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Icon 
              name={Icons.status.info.name} 
              color="#ffffff" 
              size="xl" 
            />
          </View>
          <Text style={styles.appTitle}>PureHeart</Text>
        </View>
        
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeSubtitle}>
          Choose your preferred way to continue your journey
        </Text>
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
            <Icon 
              name={Icons.social.google.name} 
              color="#ffffff" 
              size="lg" 
            />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
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
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
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
  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
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
    maxWidth: 300,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  footer: {
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
});

export default AuthScreen;
