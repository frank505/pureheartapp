/**
 * Onboarding Screen 5 - Assessment Questions
 * 
 * Fifth onboarding screen for understanding the user's struggle through
 * assessment questions to personalize their recovery journey.
 * 
 * Features:
 * - Progress indicator (Step 4 of 7)
 * - Hero image with name personalization
 * - Assessment questions with text input fields
 * - Auto-save functionality for user responses
 * - Bible verse for encouragement
 * - Back button navigation
 * - Continue to next step
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveAssessmentData } from '../../store/slices/onboardingSlice';

interface Onboarding5ScreenProps {
  navigation: any;
  route: {
    params?: {
      userData?: any;
    };
  };
}

interface AssessmentQuestion {
  id: string;
  question: string;
  currentAnswer: string;
  icon: string;
  type: 'text' | 'options';
  options?: { label: string; value: string }[];
}

/**
 * Fifth Onboarding Screen Component
 * 
 * Assessment questions to understand user's journey.
 */
const Onboarding5Screen: React.FC<Onboarding5ScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  
  // Get user data from Redux store (persisted) or route params (fallback)
  const storedPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  const existingAssessmentData = useAppSelector(state => state.onboarding.assessmentData);
  
  const userData = route.params?.userData || storedPersonalInfo;
  const userName = userData?.firstName || storedPersonalInfo.firstName || 'Friend';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialize assessment data with existing data if available or defaults
  const [assessmentData, setAssessmentData] = useState<AssessmentQuestion[]>(
    existingAssessmentData.questions || [
      {
        id: 'triggers',
        question: 'What are your primary triggers for unwanted behavior?',
        currentAnswer: '',
        icon: '⚡',
        type: 'text',
      },
      {
        id: 'frequency',
        question: 'How often do you engage in this behavior?',
        currentAnswer: '',
        icon: '📊',
        type: 'options',
        options: [
          { label: 'Multiple times a day', value: 'daily-multiple' },
          { label: 'Once a day', value: 'daily-once' },
          { label: 'A few times a week', value: 'weekly-few' },
          { label: 'Once a week', value: 'weekly-once' },
          { label: 'A few times a month', value: 'monthly-few' },
          { label: 'Rarely', value: 'rarely' },
        ],
      },
      {
        id: 'fear',
        question: 'What is your biggest fear or concern related to this struggle?',
        currentAnswer: '',
        icon: '😰',
        type: 'text',
      },
      {
        id: 'vulnerability',
        question: 'In which situations do you feel most vulnerable?',
        currentAnswer: '',
        icon: '🌙',
        type: 'options',
        options: [
          { label: 'When I\'m alone', value: 'alone' },
          { label: 'When I\'m stressed or anxious', value: 'stressed' },
          { label: 'Late at night', value: 'late-night' },
          { label: 'When I\'m bored', value: 'bored' },
          { label: 'After a conflict or disappointment', value: 'conflict' },
          { label: 'Other', value: 'other' },
        ],
      },
      {
        id: 'motivation',
        question: 'What is your primary motivation for seeking freedom?',
        currentAnswer: '',
        icon: '🙏',
        type: 'options',
        options: [
          { label: 'My relationship with God', value: 'god' },
          { label: 'My spouse or partner', value: 'partner' },
          { label: 'My family', value: 'family' },
          { label: 'My own mental and emotional health', value: 'self-health' },
          { label: 'A desire for a life of integrity', value: 'integrity' },
          { label: 'Other', value: 'other' },
        ],
      },
    ]
  );

  const updateQuestionAnswer = (questionId: string, answer: string) => {
    const updatedData = assessmentData.map(question => 
      question.id === questionId 
        ? { ...question, currentAnswer: answer }
        : question
    );
    setAssessmentData(updatedData);
    
    // Auto-save the data
    dispatch(saveAssessmentData({ questions: updatedData }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessmentData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleContinue();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const currentQuestion = assessmentData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === assessmentData.length - 1;

  const handleContinue = () => {
    // Save assessment data to Redux store (persisted to AsyncStorage)
    dispatch(saveAssessmentData({ questions: assessmentData }));
    
    // Debug log to see what we're saving
    console.log('Assessment data saved to Redux store:', assessmentData);
    
    // Navigate to next screen (data is now persisted)
    navigation.navigate('Onboarding6', { 
      userData: userData,
      assessmentData: assessmentData 
    });
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
              totalSteps={10}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Question Progress */}
        <View style={styles.questionProgressContainer}>
          <Text style={styles.questionProgress}>
            Question {currentQuestionIndex + 1} of {assessmentData.length}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Assessment Question */}
          <OnboardingCard style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionIcon}>{currentQuestion.icon}</Text>
              <Text style={styles.questionText}>
                {currentQuestion.question}
              </Text>
            </View>

            {currentQuestion.type === 'text' ? (
              <TextInput
                mode="outlined"
                placeholder="Enter your response..."
                value={currentQuestion.currentAnswer}
                onChangeText={(text) => updateQuestionAnswer(currentQuestion.id, text)}
                multiline={true}
                numberOfLines={4}
                style={styles.questionInput}
                contentStyle={styles.questionInputContent}
                outlineStyle={styles.questionInputOutline}
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
            ) : (
              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateQuestionAnswer(currentQuestion.id, option.value)}
                    style={
                      currentQuestion.currentAnswer === option.value
                        ? [styles.optionCard, styles.selectedOptionCard]
                        : styles.optionCard
                    }
                    activeOpacity={0.7}
                  >
                    <OnboardingCard style={[
                      styles.optionCardInner,
                      currentQuestion.currentAnswer === option.value && styles.selectedOptionCardInner
                    ] as any}>
                      <View style={styles.optionContent}>
                        <View style={styles.optionTextContainer}>
                          <Text style={
                            currentQuestion.currentAnswer === option.value
                              ? [styles.optionLabel, styles.selectedOptionLabel]
                              : styles.optionLabel
                          }>{option.label}</Text>
                        </View>
                        {currentQuestion.currentAnswer === option.value ? (
                          <Text style={styles.checkIcon}>✓</Text>
                        ) : (
                          <Text style={styles.chevronIcon}>›</Text>
                        )}
                      </View>
                    </OnboardingCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </OnboardingCard>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title={isLastQuestion ? "Continue" : "Next"}
          onPress={handleNext}
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
  contentContainer: {
    paddingHorizontal: 24,
  },
  questionCard: {
    backgroundColor: Colors.background.secondary,
    padding: 24,
    borderRadius: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  questionIcon: {
    fontSize: 28,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 24,
  },
  questionInput: {
    backgroundColor: Colors.background.tertiary,
    minHeight: 120,
  },
  questionInputContent: {
    color: Colors.text.primary,
    paddingTop: 12,
  },
  questionInputOutline: {
    borderColor: Colors.border.primary,
    borderWidth: 1,
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
    borderTopColor: Colors.border.primary,
  },
});

export default Onboarding5Screen;
