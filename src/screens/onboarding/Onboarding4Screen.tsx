/**
 * Onboarding Screen 4 - Personal Information
 * 
 * Fourth onboarding screen for collecting user's personal information
 * to personalize their recovery journey.
 * 
 * Features:
 * - Progress indicator (Step 3 of 7)
 * - Personal information form (name, email, age, life season)
 * - Back button navigation
 * - Privacy policy agreement
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import OnboardingButton from '../../components/OnboardingButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { savePersonalInfo, savePartialPersonalInfo } from '../../store/slices/onboardingSlice';

interface Onboarding4ScreenProps {
  navigation: any;
}

interface FormData {
  firstName: string;
  email: string;
  gender: string;
  ageRange: string;
  lifeSeason: string;
}

/**
 * Fourth Onboarding Screen Component
 * 
 * Collects personal information for journey personalization.
 */
const Onboarding4Screen: React.FC<Onboarding4ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  // Get any existing onboarding data from Redux store
  const existingPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  
  // Initialize form data with existing data if available
  const [formData, setFormData] = useState<FormData>({
    firstName: existingPersonalInfo.firstName || '',
    email: existingPersonalInfo.email || '',
    gender: existingPersonalInfo.gender || '',
    ageRange: existingPersonalInfo.ageRange || '',
    lifeSeason: existingPersonalInfo.lifeSeason || '',
  });

  // Add back button handler
  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    // Basic validation
    if (!formData.firstName || !formData.email) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Enhanced validation for dropdowns
    if (!formData.gender) {
      Alert.alert('Missing Information', 'Please select your gender.');
      return;
    }

    if (!formData.ageRange) {
      Alert.alert('Missing Information', 'Please select your age range.');
      return;
    }

    if (!formData.lifeSeason) {
      Alert.alert('Missing Information', 'Please select your current life season.');
      return;
    }

    // Save personal info to Redux store (persisted to AsyncStorage)
    dispatch(savePersonalInfo(formData));
    
    // Debug log to see what we're saving
    console.log('Personal info saved to Redux store:', formData);

    // Navigate to next screen (data is now persisted)
    navigation.navigate('Onboarding9', { userData: formData });
  };





  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button and Progress */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.progressWrapper}>
            <ProgressIndicator
              currentStep={3}
              totalSteps={7}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Let's Personalize Your Recovery Journey
          </Text>
          <Text style={styles.subtitle}>
            To tailor your experience, we need a few details about you.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(text) => {
                const updatedData = {...formData, firstName: text};
                setFormData(updatedData);
                // Auto-save partial data for better user experience
                dispatch(savePartialPersonalInfo({ firstName: text }));
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  onSurfaceVariant: Colors.text.secondary,
                  outline: '#4a4a4a',
                  primary: '#f5993d',
                  surface: '#2d2d2d',
                  onSurface: Colors.text.primary,
                }
              }}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => {
                const updatedData = {...formData, email: text};
                setFormData(updatedData);
                // Auto-save partial data for better user experience
                dispatch(savePartialPersonalInfo({ email: text }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  onSurfaceVariant: Colors.text.secondary,
                  outline: '#4a4a4a',
                  primary: '#f5993d',
                  surface: '#2d2d2d',
                  onSurface: Colors.text.primary,
                }
              }}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => {
                  console.log('Gender selected:', value); // Debug log
                  const updatedData = {...formData, gender: value};
                  setFormData(updatedData);
                  // Auto-save partial data
                  dispatch(savePartialPersonalInfo({ gender: value }));
                }}
                style={styles.picker}
                dropdownIconColor={Colors.text.secondary}
                mode="dropdown"
              >
                <Picker.Item label="Select your gender" value="" color={Colors.text.secondary} />
                <Picker.Item label="Male" value="male" color={Colors.text.primary} />
                <Picker.Item label="Female" value="female" color={Colors.text.primary} />
                <Picker.Item label="Non-binary" value="non-binary" color={Colors.text.primary} />
                <Picker.Item label="Prefer not to say" value="prefer-not-to-say" color={Colors.text.primary} />
              </Picker>
            </View>
            {/* Debug display */}
            {formData.gender && (
              <Text style={styles.debugText}>Selected: {formData.gender}</Text>
            )}
          </View>

          {/* Age Range */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age Range</Text>
            <View style={styles.pickerContainer}>
                              <Picker
                  selectedValue={formData.ageRange}
                  onValueChange={(value) => {
                    console.log('Age range selected:', value); // Debug log
                    const updatedData = {...formData, ageRange: value};
                    setFormData(updatedData);
                    // Auto-save partial data
                    dispatch(savePartialPersonalInfo({ ageRange: value }));
                  }}
                style={styles.picker}
                dropdownIconColor={Colors.text.secondary}
                mode="dropdown"
              >
                <Picker.Item label="Select your age range" value="" color={Colors.text.secondary} />
                <Picker.Item label="18-24" value="18-24" color={Colors.text.primary} />
                <Picker.Item label="25-34" value="25-34" color={Colors.text.primary} />
                <Picker.Item label="35-44" value="35-44" color={Colors.text.primary} />
                <Picker.Item label="45+" value="45+" color={Colors.text.primary} />
              </Picker>
            </View>
            {/* Debug display */}
            {formData.ageRange && (
              <Text style={styles.debugText}>Selected: {formData.ageRange}</Text>
            )}
          </View>

          {/* Life Season */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Life Season</Text>
            <View style={styles.pickerContainer}>
                              <Picker
                  selectedValue={formData.lifeSeason}
                  onValueChange={(value) => {
                    console.log('Life season selected:', value); // Debug log
                    const updatedData = {...formData, lifeSeason: value};
                    setFormData(updatedData);
                    // Auto-save partial data
                    dispatch(savePartialPersonalInfo({ lifeSeason: value }));
                  }}
                style={styles.picker}
                dropdownIconColor={Colors.text.secondary}
                mode="dropdown"
              >
                <Picker.Item label="Select your current life season" value="" color={Colors.text.secondary} />
                
                {/* Educational & Career Starting */}
                <Picker.Item label="High School Student" value="high-school-student" color={Colors.text.primary} />
                <Picker.Item label="College Student" value="college-student" color={Colors.text.primary} />
                <Picker.Item label="Graduate Student" value="graduate-student" color={Colors.text.primary} />
                <Picker.Item label="Recent Graduate" value="recent-graduate" color={Colors.text.primary} />
                <Picker.Item label="Starting Career" value="starting-career" color={Colors.text.primary} />
                
                {/* Relationship Status */}
                <Picker.Item label="Single" value="single" color={Colors.text.primary} />
                <Picker.Item label="Dating" value="dating" color={Colors.text.primary} />
                <Picker.Item label="Engaged" value="engaged" color={Colors.text.primary} />
                <Picker.Item label="Newlywed" value="newlywed" color={Colors.text.primary} />
                <Picker.Item label="Married" value="married" color={Colors.text.primary} />
                <Picker.Item label="Separated" value="separated" color={Colors.text.primary} />
                <Picker.Item label="Divorced" value="divorced" color={Colors.text.primary} />
                <Picker.Item label="Widowed" value="widowed" color={Colors.text.primary} />
                
                {/* Family Life */}
                <Picker.Item label="Trying to Conceive" value="trying-to-conceive" color={Colors.text.primary} />
                <Picker.Item label="Expecting Parent" value="expecting-parent" color={Colors.text.primary} />
                <Picker.Item label="New Parent" value="new-parent" color={Colors.text.primary} />
                <Picker.Item label="Parent of Young Children" value="parent-young-children" color={Colors.text.primary} />
                <Picker.Item label="Parent of Teenagers" value="parent-teenagers" color={Colors.text.primary} />
                <Picker.Item label="Empty Nester" value="empty-nester" color={Colors.text.primary} />
                <Picker.Item label="Grandparent" value="grandparent" color={Colors.text.primary} />
                
                {/* Career & Life Transitions */}
                <Picker.Item label="Career Building" value="career-building" color={Colors.text.primary} />
                <Picker.Item label="Career Change" value="career-change" color={Colors.text.primary} />
                <Picker.Item label="Mid-Life Transition" value="mid-life-transition" color={Colors.text.primary} />
                <Picker.Item label="Pre-Retirement" value="pre-retirement" color={Colors.text.primary} />
                <Picker.Item label="Retired" value="retired" color={Colors.text.primary} />
                
                {/* Challenges & Recovery */}
                <Picker.Item label="Health Challenges" value="health-challenges" color={Colors.text.primary} />
                <Picker.Item label="Financial Stress" value="financial-stress" color={Colors.text.primary} />
                <Picker.Item label="Job Loss/Unemployment" value="unemployment" color={Colors.text.primary} />
                <Picker.Item label="Grief/Loss" value="grief-loss" color={Colors.text.primary} />
                <Picker.Item label="Recovery/Healing" value="recovery-healing" color={Colors.text.primary} />
                
                {/* Spiritual & Personal Growth */}
                <Picker.Item label="Spiritual Seeking" value="spiritual-seeking" color={Colors.text.primary} />
                <Picker.Item label="New Believer" value="new-believer" color={Colors.text.primary} />
                <Picker.Item label="Spiritual Growth" value="spiritual-growth" color={Colors.text.primary} />
                <Picker.Item label="Spiritual Struggle" value="spiritual-struggle" color={Colors.text.primary} />
                <Picker.Item label="Ministry/Service" value="ministry-service" color={Colors.text.primary} />
                
                {/* Other */}
                <Picker.Item label="Military Service" value="military-service" color={Colors.text.primary} />
                <Picker.Item label="Caregiver" value="caregiver" color={Colors.text.primary} />
                <Picker.Item label="Other" value="other" color={Colors.text.primary} />
              </Picker>
            </View>
            {/* Debug display */}
            {formData.lifeSeason && (
              <Text style={styles.debugText}>Selected: {formData.lifeSeason}</Text>
            )}
          </View>



          {/* Privacy Policy */}
          <Text style={styles.privacyText}>
            By continuing, you agree to our{' '}
            <Text style={styles.privacyLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title="Continue My Journey"
          onPress={handleContinue}
          variant="primary"
          style={styles.primaryButton}
        />
      </View>
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
    paddingBottom: 200, // Space for bottom actions
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
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d2d2d',
  },
  inputContent: {
    color: Colors.text.primary,
  },
  inputOutline: {
    borderColor: '#4a4a4a',
    borderWidth: 1,
  },
  pickerContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text.primary,
    backgroundColor: 'transparent',
  },

  privacyText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  privacyLink: {
    color: '#f5993d',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    // No additional margin needed since it's the only button now
  },
  debugText: {
    fontSize: 12,
    color: '#f5993d',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Onboarding4Screen;
