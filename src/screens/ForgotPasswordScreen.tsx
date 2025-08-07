/**
 * ForgotPasswordScreen Component
 * 
 * This screen handles the forgot password flow with two steps:
 * 1. Email input - User enters their email to receive OTP
 * 2. OTP verification - User enters the OTP code sent to their email
 * 
 * Features:
 * - Clean, modern UI matching the app design
 * - Email validation
 * - OTP input with individual boxes
 * - Resend OTP functionality
 * - Error handling and loading states
 * - Navigation integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our components and constants
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import PasscodeInput from '../components/PasscodeInput';

// Step enum for the forgot password flow
enum ForgotPasswordStep {
  EMAIL_INPUT = 'email_input',
  OTP_VERIFICATION = 'otp_verification',
}

interface ForgotPasswordScreenProps {
  navigation?: any; // Type this properly in a real app
}

/**
 * ForgotPasswordScreen Component
 * 
 * Handles the complete forgot password flow
 */
const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  // Current step in the flow
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL_INPUT);
  
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  
  // OTP resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer effect for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  /**
   * Validate email format
   */
  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  /**
   * Handle email submission (Step 1)
   */
  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to OTP verification step
      setCurrentStep(ForgotPasswordStep.OTP_VERIFICATION);
      setResendTimer(60); // 60 seconds timer
      setCanResend(false);
      
      Alert.alert(
        'OTP Sent',
        `A 6-digit verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send OTP. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP verification (Step 2)
   */
  const handleOtpVerification = async (otpCode: string) => {
    setOtp(otpCode);
    
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit code' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to reset password screen
      navigation?.navigate('ResetPassword', { email, otp: otpCode });
      
    } catch (error) {
      setErrors({ otp: 'Invalid or expired OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP resend
   */
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResendTimer(60);
      setCanResend(false);
      
      Alert.alert(
        'OTP Sent',
        'A new verification code has been sent to your email.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to resend OTP. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Go back to previous step or screen
   */
  const handleGoBack = () => {
    if (currentStep === ForgotPasswordStep.OTP_VERIFICATION) {
      setCurrentStep(ForgotPasswordStep.EMAIL_INPUT);
      setOtp('');
      setErrors({});
    } else {
      navigation?.goBack();
    }
  };

  /**
   * Render Email Input Step
   */
  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Icon 
            name={Icons.auth.email.name} 
            color="#ffffff" 
            size="xl" 
          />
        </View>
        <Text style={styles.stepTitle}>Forgot Password?</Text>
        <Text style={styles.stepSubtitle}>
          Enter your email address and we'll send you a verification code to reset your password.
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={!!errors.email}
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineStyle={styles.inputOutline}
          theme={{
            colors: {
              onSurfaceVariant: Colors.text.secondary,
              outline: Colors.border.primary,
              primary: Colors.primary.main,
              surface: Colors.background.secondary,
              onSurface: Colors.text.primary,
            }
          }}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleEmailSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonLabel}
        buttonColor={Colors.primary.main}
      >
        Send Verification Code
      </Button>
    </View>
  );

  /**
   * Render OTP Verification Step
   */
  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Icon 
            name={Icons.auth.shield.name} 
            color="#ffffff" 
            size="xl" 
          />
        </View>
        <Text style={styles.stepTitle}>Enter Verification Code</Text>
        <Text style={styles.stepSubtitle}>
          We've sent a 6-digit code to {email}. Enter it below to verify your identity.
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <PasscodeInput
          length={6}
          onComplete={handleOtpVerification}
          onCodeChange={setOtp}
          error={errors.otp}
          disabled={loading}
          autoFocus={true}
        />
      </View>

      {/* Resend OTP */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive the code?
        </Text>
        <TouchableOpacity 
          onPress={handleResendOtp} 
          disabled={!canResend || loading}
          style={styles.resendButton}
        >
          <Text style={[
            styles.resendButtonText,
            (!canResend || loading) && styles.resendButtonDisabled
          ]}>
            {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator for OTP verification */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Verifying code...</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleGoBack} 
              style={styles.backButton}
            >
              <Icon 
                name={Icons.navigation.back.name} 
                color={Colors.text.primary} 
                size="md" 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {currentStep === ForgotPasswordStep.EMAIL_INPUT 
                ? 'Forgot Password' 
                : 'Verify Email'
              }
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <Surface style={styles.formContainer} elevation={2}>
              {currentStep === ForgotPasswordStep.EMAIL_INPUT 
                ? renderEmailStep() 
                : renderOtpStep()
              }
            </Surface>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same as back button to center title
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepHeader: {
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
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.background.secondary,
  },
  inputContent: {
    color: Colors.text.primary,
  },
  inputOutline: {
    borderColor: Colors.border.primary,
    borderWidth: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 8,
    width: '100%',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 32,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: Colors.text.disabled,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;