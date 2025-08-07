/**
 * Onboarding Screen 6 - Faith Background & Customization
 * 
 * Sixth onboarding screen for collecting faith background information
 * to customize the spiritual experience.
 * 
 * Features:
 * - Progress indicator (Step 5 of 7)
 * - Faith-focused form fields
 * - Church imagery and cross icon
 * - Spiritual customization options
 * - Bible verse encouragement
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import OnboardingButton from '../../components/OnboardingButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors, ColorUtils } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveFaithData } from '../../store/slices/onboardingSlice';

interface Onboarding6ScreenProps {
  navigation: any;
  route: {
    params?: {
      userData?: any;
      assessmentData?: any;
    };
  };
}

interface FaithData {
  relationshipWithJesus: string;
  churchInvolvement: string;
  prayerFrequency: string;
  christianInfluences: string;
  bibleTranslation: string;
  spiritualStruggle: string;
}

/**
 * Sixth Onboarding Screen Component
 * 
 * Faith background and customization form.
 */
const Onboarding6Screen: React.FC<Onboarding6ScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store (persisted) or route params (fallback)
  const storedPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  const storedAssessmentData = useAppSelector(state => state.onboarding.assessmentData);
  const existingFaithData = useAppSelector(state => state.onboarding.faithData);
  
  const userData = route.params?.userData || storedPersonalInfo;
  const assessmentData = route.params?.assessmentData || storedAssessmentData;
  const userName = userData?.firstName || storedPersonalInfo.firstName || 'Friend';

  // Initialize faith data with existing data if available
  const [faithData, setFaithData] = useState<FaithData>({
    relationshipWithJesus: existingFaithData.relationshipWithJesus || '',
    churchInvolvement: existingFaithData.churchInvolvement || '',
    prayerFrequency: existingFaithData.prayerFrequency || '',
    christianInfluences: existingFaithData.christianInfluences || '',
    bibleTranslation: existingFaithData.bibleTranslation || '',
    spiritualStruggle: existingFaithData.spiritualStruggle || '',
  });

  // State for managing individual Christian influences as tags
  const [christianInfluencesList, setChristianInfluencesList] = useState<string[]>(() => {
    // Parse existing christianInfluences string into array
    const existing = existingFaithData.christianInfluences || '';
    return existing ? existing.split(',').map(influence => influence.trim()).filter(Boolean) : [];
  });
  
  // Temporary state for the input field
  const [currentInfluenceInput, setCurrentInfluenceInput] = useState('');

  // Helper functions for managing Christian influences
  const addInfluence = (influence: string) => {
    const trimmedInfluence = influence.trim();
    if (trimmedInfluence && !christianInfluencesList.includes(trimmedInfluence)) {
      const newList = [...christianInfluencesList, trimmedInfluence];
      setChristianInfluencesList(newList);
      
      // Update faithData with the new list as a comma-separated string
      const updatedData = {...faithData, christianInfluences: newList.join(', ')};
      setFaithData(updatedData);
      
      // Clear the input
      setCurrentInfluenceInput('');
    }
  };

  const removeInfluence = (influenceToRemove: string) => {
    const newList = christianInfluencesList.filter(influence => influence !== influenceToRemove);
    setChristianInfluencesList(newList);
    
    // Update faithData with the new list as a comma-separated string
    const updatedData = {...faithData, christianInfluences: newList.join(', ')};
    setFaithData(updatedData);
  };

  const handleInfluenceInputSubmit = () => {
    if (currentInfluenceInput.includes(',')) {
      // Handle multiple influences separated by commas
      const influences = currentInfluenceInput.split(',');
      influences.forEach(influence => {
        const trimmed = influence.trim();
        if (trimmed && !christianInfluencesList.includes(trimmed)) {
          addInfluence(trimmed);
        }
      });
      setCurrentInfluenceInput('');
    } else if (currentInfluenceInput.trim()) {
      // Handle single influence
      addInfluence(currentInfluenceInput);
    }
  };

  const handleContinue = () => {
    // Save faith data to Redux store (persisted to AsyncStorage)
    dispatch(saveFaithData(faithData));
    
    // Debug log to see what we're saving
    console.log('Faith data saved to Redux store:', faithData);
    
    // Navigate to next screen (data is now persisted)
    navigation.navigate('Onboarding7', { 
      userData: userData,
      assessmentData: assessmentData,
      faithData: faithData 
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Background */}
        <View style={styles.headerBackground}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbBpyFIzlUyiV1vieF5_3Iu10xWogYT7GfZ2-2UKjTcsanDzxdFa_Jho0BoCVICy6ix3R7Y3Dj6Zj0mvFG_IMYov07fuHJWfvWiPKXccAe7HZQ_qVm206Rp6BnnICXad1Zel9lcy53ywJJpNxC4BA_tawVhZLwtrrH115Tb15ABMgX46zEmMCwdBWIJwndasaLHOdoHTKQDlaLXIFiFgkI2pHg4LzZPhkM8d5JK4uXcN0e2FeZyQ3YXgDcenpHrOEnHz2ku8by5YsI'
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
          </ImageBackground>
          
          {/* Cross Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.crossIcon}>✝️</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator
            currentStep={5}
            totalSteps={7}
            variant="bars"
            showStepText={true}
          />
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>
            {userName}, Let's Tailor Your Faith Journey
          </Text>
          <Text style={styles.subtitle}>
            Your relationship with Christ is unique. Let's customize your experience to reflect your personal faith journey.
          </Text>

          {/* Faith Form */}
          <View style={styles.formContainer}>
            {/* Relationship with Jesus */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>How would you describe your relationship with Jesus?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={faithData.relationshipWithJesus}
                  onValueChange={(value) => {
                    const updatedData = {...faithData, relationshipWithJesus: value};
                    setFaithData(updatedData);
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.text.secondary}
                >
                  <Picker.Item label="Growing closer" value="growing-closer" color={Colors.text.primary} />
                  <Picker.Item label="Just starting" value="just-starting" color={Colors.text.primary} />
                  <Picker.Item label="It's complicated" value="complicated" color={Colors.text.primary} />
                  <Picker.Item label="Strong" value="strong" color={Colors.text.primary} />
                </Picker>
              </View>
            </View>

            {/* Church Involvement */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>How involved are you in a church community?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={faithData.churchInvolvement}
                  onValueChange={(value) => {
                    const updatedData = {...faithData, churchInvolvement: value};
                    setFaithData(updatedData);
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.text.secondary}
                >
                  <Picker.Item label="Very involved" value="very-involved" color={Colors.text.primary} />
                  <Picker.Item label="Somewhat involved" value="somewhat-involved" color={Colors.text.primary} />
                  <Picker.Item label="Not currently involved" value="not-involved" color={Colors.text.primary} />
                  <Picker.Item label="Looking for a church" value="looking" color={Colors.text.primary} />
                </Picker>
              </View>
            </View>

            {/* Prayer Frequency */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>How often do you pray?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={faithData.prayerFrequency}
                  onValueChange={(value) => {
                    const updatedData = {...faithData, prayerFrequency: value};
                    setFaithData(updatedData);
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.text.secondary}
                >
                  <Picker.Item label="Daily" value="daily" color={Colors.text.primary} />
                  <Picker.Item label="A few times a week" value="few-times-week" color={Colors.text.primary} />
                  <Picker.Item label="Occasionally" value="occasionally" color={Colors.text.primary} />
                  <Picker.Item label="Rarely" value="rarely" color={Colors.text.primary} />
                </Picker>
              </View>
            </View>

            {/* Christian Influences */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Who are your biggest Christian influences?</Text>
              
              {/* Display current influences as chips/tags */}
              {christianInfluencesList.length > 0 && (
                <View style={styles.influencesContainer}>
                  {christianInfluencesList.map((influence, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      onClose={() => removeInfluence(influence)}
                      style={styles.influenceChip}
                      textStyle={styles.influenceChipText}
                      closeIconAccessibilityLabel={`Remove ${influence}`}
                    >
                      {influence}
                    </Chip>
                  ))}
                </View>
              )}
              
              {/* Input for adding new influences */}
              <TextInput
                mode="outlined"
                label="Add a Christian influence"
                placeholder="e.g., C.S. Lewis, Pastor John, my mentor"
                value={currentInfluenceInput}
                onChangeText={setCurrentInfluenceInput}
                onSubmitEditing={handleInfluenceInputSubmit}
                onBlur={handleInfluenceInputSubmit}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                right={
                  currentInfluenceInput.trim() ? (
                    <TextInput.Icon
                      icon="plus"
                      onPress={handleInfluenceInputSubmit}
                    />
                  ) : null
                }
                theme={{
                  colors: {
                    onSurfaceVariant: Colors.text.secondary,
                    outline: Colors.border.primary,
                    primary: Colors.primary.main,
                    surface: Colors.background.tertiary,
                    onSurface: Colors.text.primary,
                  }
                }}
              />
              
              <Text style={styles.helperText}>
                Add influences one by one or separate multiple with commas. Tap the X to remove.
              </Text>
            </View>

            {/* Bible Translation */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What is your preferred Bible translation?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={faithData.bibleTranslation}
                  onValueChange={(value) => {
                    const updatedData = {...faithData, bibleTranslation: value};
                    setFaithData(updatedData);
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.text.secondary}
                >
                  <Picker.Item label="NIV" value="niv" color={Colors.text.primary} />
                  <Picker.Item label="ESV" value="esv" color={Colors.text.primary} />
                  <Picker.Item label="KJV" value="kjv" color={Colors.text.primary} />
                  <Picker.Item label="NLT" value="nlt" color={Colors.text.primary} />
                  <Picker.Item label="Other" value="other" color={Colors.text.primary} />
                </Picker>
              </View>
            </View>

            {/* Spiritual Struggle */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="What is your biggest spiritual struggle?"
                placeholder="e.g., Consistency in prayer, doubt"
                value={faithData.spiritualStruggle}
                onChangeText={(text) => {
                  const updatedData = {...faithData, spiritualStruggle: text};
                  setFaithData(updatedData);
                }}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                theme={{
                  colors: {
                    onSurfaceVariant: Colors.text.secondary,
                    outline: Colors.border.primary,
                    primary: Colors.primary.main,
                    surface: Colors.background.tertiary,
                    onSurface: Colors.text.primary,
                  }
                }}
              />
            </View>
          </View>

          {/* Bible Verse */}
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </Text>
            <Text style={styles.verseReference}>
              Matthew 11:28
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title="Customize My Experience"
          onPress={handleContinue}
          variant="primary"
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
    paddingBottom: 100, // Space for bottom button
  },
  headerBackground: {
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 153, 61, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  crossIcon: {
    fontSize: 32,
    color: '#f5993d',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
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
    backgroundColor: Colors.background.tertiary,
  },
  inputContent: {
    color: Colors.text.primary,
  },
  inputOutline: {
    borderColor: Colors.border.primary,
    borderWidth: 1,
  },
  pickerContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text.primary,
    backgroundColor: 'transparent',
  },
  influencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 8,
  },
  influenceChip: {
    backgroundColor: ColorUtils.withOpacity(Colors.primary.main, 0.1),
    borderColor: Colors.primary.main,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 4,
  },
  influenceChipText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verseText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  verseReference: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 74, 74, 0.3)',
  },
});

export default Onboarding6Screen;
