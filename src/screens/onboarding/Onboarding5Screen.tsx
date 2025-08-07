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
import OnboardingCard from '../../components/OnboardingCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors, ColorUtils } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveFaithData } from '../../store/slices/onboardingSlice';

interface Onboarding5ScreenProps {
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
const Onboarding5Screen: React.FC<Onboarding5ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const existingFaithData = useAppSelector(state => state.onboarding.faithData);
  const userName = useAppSelector(state => state.onboarding.personalInfo?.firstName) || 'Friend';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FaithData>({
    relationshipWithJesus: existingFaithData.relationshipWithJesus || '',
    churchInvolvement: existingFaithData.churchInvolvement || '',
    prayerFrequency: existingFaithData.prayerFrequency || '',
    christianInfluences: existingFaithData.christianInfluences || '',
    bibleTranslation: existingFaithData.bibleTranslation || '',
    spiritualStruggle: existingFaithData.spiritualStruggle || '',
  });

  const [christianInfluencesList, setChristianInfluencesList] = useState<string[]>(() => {
    const existing = existingFaithData.christianInfluences || '';
    return existing ? existing.split(',').map(influence => influence.trim()).filter(Boolean) : [];
  });

  const [currentInfluenceInput, setCurrentInfluenceInput] = useState('');

  const questions = [
    {
      id: 'relationshipWithJesus',
      title: 'How would you describe your relationship with Jesus?',
      field: 'relationshipWithJesus' as keyof FaithData,
      type: 'picker',
      options: [
        { label: 'Growing closer', value: 'growing-closer' },
        { label: 'Just starting', value: 'just-starting' },
        { label: "It's complicated", value: 'complicated' },
        { label: 'Strong', value: 'strong' },
      ],
      required: true,
    },
    {
      id: 'churchInvolvement',
      title: 'How involved are you in a church community?',
      field: 'churchInvolvement' as keyof FaithData,
      type: 'picker',
      options: [
        { label: 'Very involved', value: 'very-involved' },
        { label: 'Somewhat involved', value: 'somewhat-involved' },
        { label: 'Not currently involved', value: 'not-involved' },
        { label: 'Looking for a church', value: 'looking' },
      ],
      required: true,
    },
    {
      id: 'prayerFrequency',
      title: 'How often do you pray?',
      field: 'prayerFrequency' as keyof FaithData,
      type: 'picker',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'A few times a week', value: 'few-times-week' },
        { label: 'Occasionally', value: 'occasionally' },
        { label: 'Rarely', value: 'rarely' },
      ],
      required: true,
    },
    {
      id: 'christianInfluences',
      title: 'Who are your biggest Christian influences?',
      subtitle: 'Add influences one by one or separate multiple with commas. Tap the X to remove.',
      field: 'christianInfluences' as keyof FaithData,
      type: 'chip-input',
      required: false,
    },
    {
      id: 'bibleTranslation',
      title: 'What is your preferred Bible translation?',
      field: 'bibleTranslation' as keyof FaithData,
      type: 'picker',
      options: [
        { label: 'NIV', value: 'niv' },
        { label: 'ESV', value: 'esv' },
        { label: 'KJV', value: 'kjv' },
        { label: 'NLT', value: 'nlt' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      id: 'spiritualStruggle',
      title: 'What is your biggest spiritual struggle?',
      subtitle: 'e.g., Consistency in prayer, doubt',
      field: 'spiritualStruggle' as keyof FaithData,
      type: 'text-input',
      required: false,
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

  const handleValueChange = (field: keyof FaithData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
};

  const addInfluence = (influence: string) => {
    const trimmedInfluence = influence.trim();
    if (trimmedInfluence && !christianInfluencesList.includes(trimmedInfluence)) {
      const newList = [...christianInfluencesList, trimmedInfluence];
      setChristianInfluencesList(newList);
      handleValueChange('christianInfluences', newList.join(', '));
      setCurrentInfluenceInput('');
    }
  };

  const removeInfluence = (influenceToRemove: string) => {
    const newList = christianInfluencesList.filter(influence => influence !== influenceToRemove);
    setChristianInfluencesList(newList);
    handleValueChange('christianInfluences', newList.join(', '));
  };

  const handleInfluenceInputSubmit = () => {
    if (currentInfluenceInput.includes(',')) {
      const influences = currentInfluenceInput.split(',');
      influences.forEach(influence => {
        const trimmed = influence.trim();
        if (trimmed && !christianInfluencesList.includes(trimmed)) {
          addInfluence(trimmed);
        }
      });
      setCurrentInfluenceInput('');
    } else if (currentInfluenceInput.trim()) {
      addInfluence(currentInfluenceInput);
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
   
  const handleFinish = () => {
    dispatch(saveFaithData(formData));  
    navigation.navigate('Onboarding6');
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
              currentStep={5}
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
            {currentQuestionData.subtitle && (
                <Text style={styles.questionSubtitle}>
                    {currentQuestionData.subtitle}
                </Text>
            )}

            {/* Conditional Input */}
            {currentQuestionData.type === 'picker' && currentQuestionData.options && (
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
            )}

            {currentQuestionData.type === 'chip-input' && (
              <View>
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
                <TextInput
                  mode="outlined"
                  label="Add an influence"
                  placeholder="e.g., C.S. Lewis, Pastor John"
                  value={currentInfluenceInput}
                  onChangeText={setCurrentInfluenceInput}
                  onSubmitEditing={handleInfluenceInputSubmit}
                  onBlur={handleInfluenceInputSubmit}
                  style={styles.input}
                  right={
                    currentInfluenceInput.trim() ? (
                      <TextInput.Icon
                        icon="plus"
                        onPress={handleInfluenceInputSubmit}
                      />
                    ) : null
                  }
                />
              </View>
            )}

            {currentQuestionData.type === 'text-input' && (
              <TextInput
                mode="outlined"
                label={currentQuestionData.title}
                placeholder={currentQuestionData.subtitle}
                value={formData[currentQuestionData.field]}
                onChangeText={(text) => handleValueChange(currentQuestionData.field, text)}
                style={styles.input}
              />
            )}
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
  influencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  influenceChip: {
    backgroundColor: `${Colors.primary.main}10`,
    borderColor: Colors.primary.main,
  },
  influenceChipText: {
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
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

export default Onboarding5Screen;
