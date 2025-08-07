/**
 * ResetPasswordScreen Component
 * 
 * This screen allows users to set a new password after successful OTP verification.
 * It includes:
 * - Password strength validation
 * - Confirm password matching
 * - Password visibility toggles
 * - Success handling with navigation back to auth
 * 
 * Features:
 * - Clean, modern UI matching the app design
 * - Real-time password validation
 * - Password strength indicator
 * - Secure password handling
 * - Loading states and error handling
 */

import React, { useState } from 'react';
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
  Surface,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our components and constants
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';

interface ResetPasswordScreenProps {
  navigation?: any; // Type this properly in a real app
  route?: {
    params?: {
      email?: string;
      otp?: string;
    };
  };
}

// Password strength levels
enum PasswordStrength {
  WEAK = 'weak',
  FAIR = 'fair',
  GOOD = 'good',
  STRONG = 'strong',
}

/**
 * ResetPasswordScreen Component
 * 
 * Handles password reset after OTP verification
 */
const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { email = 'user@example.com', otp = '123456' } = route?.params || {};

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  /**
   * Calculate password strength
   */
  const getPasswordStrength = (pwd: string): { strength: PasswordStrength; score: number } => {
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    // Determine strength level
    let strength: PasswordStrength;
    if (score <= 2) strength = PasswordStrength.WEAK;
    else if (score <= 3) strength = PasswordStrength.FAIR;
    else if (score <= 4) strength = PasswordStrength.GOOD;
    else strength = PasswordStrength.STRONG;
    
    return { strength, score: score / 6 }; // Normalize to 0-1
  };

  /**
   * Get password strength color
   */
  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case PasswordStrength.WEAK:
        return '#ef4444';
      case PasswordStrength.FAIR:
        return '#f59e0b';
      case PasswordStrength.GOOD:
        return '#10b981';
      case PasswordStrength.STRONG:
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const { strength } = getPasswordStrength(password);
      if (strength === PasswordStrength.WEAK) {
        newErrors.password = 'Password is too weak. Please use a stronger password.';
      }
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle password reset submission
   */
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success alert and navigate back to auth
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to auth screen with sign in mode
              navigation?.navigate('Auth', { mode: 'signin' });
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to reset password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password change with real-time validation
   */
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    
    // Clear password error if it's now valid
    if (errors.password && text.length >= 8) {
      const { strength } = getPasswordStrength(text);
      if (strength !== PasswordStrength.WEAK) {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
    }
    
    // Clear confirm password error if passwords now match
    if (errors.confirmPassword && confirmPassword && text === confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  /**
   * Handle confirm password change
   */
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    
    // Clear confirm password error if passwords now match
    if (errors.confirmPassword && password && text === password) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const passwordStrengthData = password ? getPasswordStrength(password) : null;

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
              onPress={() => navigation?.goBack()} 
              style={styles.backButton}
            >
              <Icon 
                name={Icons.navigation.back.name} 
                color={Colors.text.primary} 
                size="md" 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <Surface style={styles.formContainer} elevation={2}>
              {/* Header */}
              <View style={styles.formHeader}>
                <View style={styles.iconContainer}>
                  <Icon 
                    name={Icons.auth.lock.name} 
                    color="#ffffff" 
                    size="xl" 
                  />
                </View>
                <Text style={styles.formTitle}>Create New Password</Text>
                <Text style={styles.formSubtitle}>
                  Create a strong password for {email}. Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols.
                </Text>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="New Password"
                  placeholder="Enter your new password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      iconColor={Colors.text.secondary}
                    />
                  }
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                
                {/* Password Strength Indicator */}
                {password && passwordStrengthData && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabel}>Password Strength:</Text>
                      <Text style={[
                        styles.strengthLevel,
                        { color: getStrengthColor(passwordStrengthData.strength) }
                      ]}>
                        {passwordStrengthData.strength.charAt(0).toUpperCase() + 
                         passwordStrengthData.strength.slice(1)}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={passwordStrengthData.score}
                      color={getStrengthColor(passwordStrengthData.strength)}
                      style={styles.strengthBar}
                    />
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  error={!!errors.confirmPassword}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      iconColor={Colors.text.secondary}
                    />
                  }
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
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementsList}>
                  <Text style={[
                    styles.requirement,
                    password.length >= 8 && styles.requirementMet
                  ]}>
                    • At least 8 characters
                  </Text>
                  <Text style={[
                    styles.requirement,
                    /[A-Z]/.test(password) && styles.requirementMet
                  ]}>
                    • One uppercase letter
                  </Text>
                  <Text style={[
                    styles.requirement,
                    /[a-z]/.test(password) && styles.requirementMet
                  ]}>
                    • One lowercase letter
                  </Text>
                  <Text style={[
                    styles.requirement,
                    /[0-9]/.test(password) && styles.requirementMet
                  ]}>
                    • One number
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
                buttonColor={Colors.primary.main}
              >
                Reset Password
              </Button>
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
    width: 40,
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
  formHeader: {
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
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  strengthLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.background.tertiary,
  },
  requirementsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  requirementsList: {
    gap: 4,
  },
  requirement: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  requirementMet: {
    color: '#10b981',
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
});

export default ResetPasswordScreen;