/**
 * Onboarding Screen 7 
 * 
 * Final onboarding screen that shows a circular progress indicator
 * while personalizing user data, then provides a continue button
 * to proceed to authentication.
 * 
 * Features:
 * - Full screen circular progress indicator
 * - "Personalizing user data" message
 * - Continue button that navigates to AuthScreen
 * - Clean, minimal design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveRecoveryJourneyData } from '../../store/slices/onboardingSlice';

interface Onboarding6ScreenProps {
  navigation: any;
}

interface FormData {
  recoveryGoal: string;
  recoveryMotivation: string;
  hasSoughtHelpBefore: string;
  previousHelpDescription: string;
}

/**
 * Recovery Journey Personalization Screen Component
 */
const Onboarding6Screen: React.FC<Onboarding6ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  // Get existing data from Redux store
  const existingData = useAppSelector(state => state.onboarding.recoveryJourneyData);
  
  // Initialize form data with existing data if available
  const [formData, setFormData] = useState<FormData>({
    recoveryGoal: existingData?.recoveryGoal || '',
    recoveryMotivation: existingData?.recoveryMotivation || '',
    hasSoughtHelpBefore: existingData?.hasSoughtHelpBefore || '',
    previousHelpDescription: existingData?.previousHelpDescription || '',
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Question configuration
  const questions = [
    {
      id: 'recovery-goal',
      title: 'Primary Recovery Goal',
      subtitle: 'What is the main thing you hope to achieve?',
      field: 'recoveryGoal' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select your goal', value: '' },
        { label: 'Break free from pornography', value: 'break-free' },
        { label: 'Heal my relationships', value: 'heal-relationships' },
        { label: 'Understand my triggers', value: 'understand-triggers' },
        { label: 'Build a healthier lifestyle', value: 'healthier-lifestyle' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      id: 'recovery-motivation',
      title: 'Your Motivation',
      subtitle: 'What is your biggest motivation for this journey?',
      field: 'recoveryMotivation' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select motivation', value: '' },
        { label: 'My faith', value: 'faith' },
        { label: 'My family/partner', value: 'family-partner' },
        { label: 'My personal integrity', value: 'personal-integrity' },
        { label: 'Future relationships', value: 'future-relationships' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      id: 'sought-help-before',
      title: 'Previous Support',
      subtitle: 'Have you sought help for this before?',
      field: 'hasSoughtHelpBefore' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select an answer', value: '' },
        { label: 'Yes, I have', value: 'yes' },
        { label: 'No, this is my first time', value: 'no' },
        { label: 'Prefer not to say', value: 'prefer-not-to-say' },
      ],
      required: true,
    },
    {
      id: 'previous-help-description',
      title: 'Previous Support Details',
      subtitle: 'If you have sought help, what did that look like?',
      field: 'previousHelpDescription' as keyof FormData,
      type: 'picker',
      options: [
        { label: 'Select what applies', value: '' },
        { label: 'Therapy or counseling', value: 'therapy' },
        { label: 'Support groups (12-step, etc.)', value: 'support-groups' },
        { label: 'Church or spiritual guidance', value: 'church-guidance' },
        { label: 'I tried on my own', value: 'on-my-own' },
        { label: 'Other', value: 'other' },
      ],
      required: false,
      condition: () => formData.hasSoughtHelpBefore === 'yes',
    },
  ];

  // Filter questions based on conditions
  const activeQuestions = questions.filter(q => !q.condition || q.condition());

  const currentQuestionData = activeQuestions[currentQuestion];

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleValueChange = (value: string) => {
    if (currentQuestionData) {
      const updatedData = { ...formData, [currentQuestionData.field]: value };
      setFormData(updatedData);
      
      // Auto-save to Redux store
      dispatch(saveRecoveryJourneyData(updatedData));
    }
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

  const handleSkip = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Final save with completion timestamp
    dispatch(saveRecoveryJourneyData({
      ...formData,
      completedAt: new Date().toISOString(),
    }));

    // Navigate to next screen
    navigation.navigate('Onboarding7');
  };

  // Auto-advance for conditional question changes
  useEffect(() => {
    if (formData.hasSoughtHelpBefore !== 'yes' && formData.previousHelpDescription) {
      setFormData(prev => ({ ...prev, previousHelpDescription: '' }));
    }
  }, [formData.hasSoughtHelpBefore]);

  if (!currentQuestionData) {
    return null; // Safety check
  }

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
              currentStep={6}
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
                // Render picker items as selectable cards
                option.value ? (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleValueChange(option.value)}
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

          {/* Privacy Notice */}
          <OnboardingCard style={styles.privacyCard}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
            <Text style={styles.privacyText}>
              All information is securely encrypted and only used to personalize your recovery journey. 
              You can skip any question you're not comfortable answering.
            </Text>
          </OnboardingCard>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!currentQuestionData.required && (
          <OnboardingButton
            title="Skip"
            onPress={handleSkip}
            variant="secondary"
            style={styles.skipButton}
          />
        )}
        
        <OnboardingButton
          title={currentQuestion === activeQuestions.length - 1 ? "Continue" : "Next"}
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
    paddingBottom: 120, // Space for buttons
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
  privacyCard: {
    backgroundColor: `${Colors.primary.main}10`, // 10% opacity
    borderWidth: 1,
    borderColor: `${Colors.primary.main}30`, // 30% opacity
    alignItems: 'center',
    padding: 20,
  },
  privacyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  privacyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
  skipButton: {
    flex: 1,
    borderRadius: 12,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default Onboarding6Screen;
