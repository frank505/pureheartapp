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
import OnboardingCard from '../../components/OnboardingCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { savePersonalInfo, savePartialPersonalInfo } from '../../store/slices/onboardingSlice';

interface Onboarding3ScreenProps {
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
const Onboarding3Screen: React.FC<Onboarding3ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const existingPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: existingPersonalInfo.firstName || '',
    email: existingPersonalInfo.email || '',
    gender: existingPersonalInfo.gender || '',
    ageRange: existingPersonalInfo.ageRange || '',
    lifeSeason: existingPersonalInfo.lifeSeason || '',
  });

  const questions = [
    {
      id: 'gender',
      title: 'What is your gender?',
      subtitle: 'This helps us tailor content to your experience.',
      field: 'gender' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select your gender', value: '' },
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Non-binary', value: 'non-binary' },
        { label: 'Prefer not to say', value: 'prefer-not-to-say' },
      ],
      required: true,
    },
    {
      id: 'ageRange',
      title: 'What is your age range?',
      subtitle: 'Your age helps us provide relevant resources.',
      field: 'ageRange' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select your age range', value: '' },
        { label: '18-24', value: '18-24' },
        { label: '25-34', value: '25-34' },
        { label: '35-44', value: '35-44' },
        { label: '45+', value: '45+' },
      ],
      required: true,
    },
    {
        id: 'lifeSeason',
        title: 'What is your current life season?',
        subtitle: 'This helps us understand your current context.',
        field: 'lifeSeason' as keyof FormData,
        type: 'picker',
        options: [
          { label: 'Select your current life season', value: '' },
          { label: 'High School Student', value: 'high-school-student' },
          { label: 'College Student', value: 'college-student' },
          { label: 'Graduate Student', value: 'graduate-student' },
          { label: 'Recent Graduate', value: 'recent-graduate' },
          { label: 'Starting Career', value: 'starting-career' },
          { label: 'Single', value: 'single' },
          { label: 'Dating', value: 'dating' },
          { label: 'Engaged', value: 'engaged' },
          { label: 'Newlywed', value: 'newlywed' },
          { label: 'Married', value: 'married' },
          { label: 'Separated', value: 'separated' },
          { label: 'Divorced', value: 'divorced' },
          { label: 'Widowed', value: 'widowed' },
          { label: 'Trying to Conceive', value: 'trying-to-conceive' },
          { label: 'Expecting Parent', value: 'expecting-parent' },
          { label: 'New Parent', value: 'new-parent' },
          { label: 'Parent of Young Children', value: 'parent-young-children' },
          { label: 'Parent of Teenagers', value: 'parent-teenagers' },
          { label: 'Empty Nester', value: 'empty-nester' },
          { label: 'Grandparent', value: 'grandparent' },
          { label: 'Career Building', value: 'career-building' },
          { label: 'Career Change', value: 'career-change' },
          { label: 'Mid-Life Transition', value: 'mid-life-transition' },
          { label: 'Pre-Retirement', value: 'pre-retirement' },
          { label: 'Retired', value: 'retired' },
          { label: 'Health Challenges', value: 'health-challenges' },
          { label: 'Financial Stress', value: 'financial-stress' },
          { label: 'Job Loss/Unemployment', value: 'unemployment' },
          { label: 'Grief/Loss', value: 'grief-loss' },
          { label: 'Recovery/Healing', value: 'recovery-healing' },
          { label: 'Spiritual Seeking', value: 'spiritual-seeking' },
          { label: 'New Believer', value: 'new-believer' },
          { label: 'Spiritual Growth', value: 'spiritual-growth' },
          { label: 'Spiritual Struggle', value: 'spiritual-struggle' },
          { label: 'Ministry/Service', value: 'ministry-service' },
          { label: 'Military Service', value: 'military-service' },
          { label: 'Caregiver', value: 'caregiver' },
          { label: 'Other', value: 'other' },
        ],
        required: true,
      },
    ];

  const activeQuestions = questions;
  const currentQuestionData = activeQuestions[currentQuestion];

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleValueChange = (field: keyof FormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    dispatch(savePartialPersonalInfo({ [field]: value }));
  };

  const handleNext = () => {
    if (currentQuestionData?.required && !formData[currentQuestionData.field]) {
      Alert.alert('Response Required', 'Please select an option to continue.');
      return;
    }

    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    dispatch(savePersonalInfo(formData));
    navigation.navigate('Onboarding4');
  };





  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button and Progress */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.progressWrapper}>
            <ProgressIndicator
              currentStep={3}
              totalSteps={9}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Question Progress */}
        <View style={styles.questionProgressContainer}>
          <Text style={styles.questionProgress}>
            {currentQuestion + 1} of {activeQuestions.length}
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionContainer}>
          <OnboardingCard style={styles.questionCard}>
            <Text style={styles.questionTitle}>
              {currentQuestionData.title}
            </Text>
            <Text style={styles.questionSubtitle}>
              {currentQuestionData.subtitle}
            </Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestionData.options.map((option) => (
                option.value ? (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleValueChange(currentQuestionData.field, option.value)}
                    style={
                      formData[currentQuestionData.field] === option.value
                        ? [styles.optionCard, styles.selectedOptionCard]
                        : styles.optionCard
                    }
                    activeOpacity={0.7}
                  >
                    <OnboardingCard style={[
                      styles.optionCardInner,
                      formData[currentQuestionData.field] === option.value && styles.selectedOptionCardInner
                    ] as any}>
                      <View style={styles.optionContent}>
                        <View style={styles.optionTextContainer}>
                          <Text style={
                            formData[currentQuestionData.field] === option.value
                              ? [styles.optionLabel, styles.selectedOptionLabel]
                              : styles.optionLabel
                          }>{option.label}</Text>
                        </View>
                        {formData[currentQuestionData.field] === option.value ? (
                          <Text style={styles.checkIcon}>✓</Text>
                        ) : (
                          <Text style={styles.chevronIcon}>›</Text>
                        )}
                      </View>
                    </OnboardingCard>
                  </TouchableOpacity>
                ) : null
              ))}
            </View>
          </OnboardingCard>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <OnboardingButton
          title={currentQuestion === activeQuestions.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
          variant="primary"
          style={styles.nextButton}
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
    paddingBottom: 120,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  questionProgressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  questionProgress: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  questionContainer: {
    paddingHorizontal: 24,
    gap: 24,
  },
  questionCard: {
    backgroundColor: Colors.background.secondary,
    padding: 24,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    transform: [{ scale: 1 }],
  },
  selectedOptionCard: {
    transform: [{ scale: 1.02 }],
  },
  optionCardInner: {
    margin: 0,
    padding: 16,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  selectedOptionCardInner: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
    backgroundColor: `${Colors.primary.main}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedOptionLabel: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 24,
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  chevronIcon: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default Onboarding3Screen;
