/**
 * Onboarding Screen 9 - How They Heard About Us
 * 
 * Special onboarding screen to understand how users discovered the app.
 * This information is valuable for marketing and outreach efforts.
 * 
 * Features:
 * - Progress indicator
 * - Single-choice selection
 * - Clean, user-friendly interface
 * - Auto-save functionality
 */

import React, { useState } from 'react';
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
import { saveHowTheyHeardData } from '../../store/slices/onboardingSlice';

interface Onboarding9ScreenProps {
  navigation: any;
}

// Options for how they heard about us
const hearAboutUsOptions = [
  { id: 'social-media', label: 'Social Media (Instagram, Facebook, TikTok)', icon: '📱' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
  { id: 'podcast', label: 'Podcast', icon: '🎧' },
  { id: 'friend-family', label: 'Friend or Family Member', icon: '👥' },
  { id: 'church', label: 'Church or Ministry', icon: '⛪' },
  { id: 'google-search', label: 'Google Search', icon: '🔍' },
  { id: 'app-store', label: 'App Store / Play Store', icon: '📲' },
  { id: 'blog-article', label: 'Blog or Article', icon: '📝' },
  { id: 'conference', label: 'Conference or Event', icon: '🎤' },
  { id: 'counselor-therapist', label: 'Counselor or Therapist', icon: '🩺' },
  { id: 'other', label: 'Other', icon: '💭' },
];

/**
 * How They Heard About Us Screen Component
 */
const Onboarding9Screen: React.FC<Onboarding9ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  // Get existing data from Redux store
  const existingData = useAppSelector(state => state.onboarding.howTheyHeard);
  
  // Initialize with existing selection if available
  const [selectedOption, setSelectedOption] = useState<string>(existingData?.source || '');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Auto-save selection to Redux store
    dispatch(saveHowTheyHeardData({
      source: optionId,
      completedAt: new Date().toISOString(),
    }));
  };

  const handleContinue = () => {
    if (!selectedOption) {
      Alert.alert('Selection Required', 'Please select how you heard about us.');
      return;
    }

    // Navigate to next screen
    navigation.navigate('Onboarding10');
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
              currentStep={4}
              totalSteps={9}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            How Did You Hear About Us?
          </Text>
          <Text style={styles.subtitle}>
            Help us understand how you discovered PureHeart so we can reach more people who need support.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {hearAboutUsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleOptionSelect(option.id)}
              style={
                selectedOption === option.id 
                  ? [styles.optionCard, styles.selectedOptionCard]
                  : styles.optionCard
              }
              activeOpacity={0.7}
            >
              <OnboardingCard style={[
                styles.optionCardInner,
                selectedOption === option.id && styles.selectedOptionCardInner
              ] as any}>
                <View style={styles.optionContent}>
                  <View style={
                    selectedOption === option.id
                      ? [styles.iconContainer, styles.selectedIconContainer]
                      : styles.iconContainer
                  }>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={
                      selectedOption === option.id
                        ? [styles.optionLabel, styles.selectedOptionLabel]
                        : styles.optionLabel
                    }>{option.label}</Text>
                  </View>
                  {selectedOption === option.id ? (
                    <Text style={styles.checkIcon}>✓</Text>
                  ) : (
                    <Text style={styles.chevronIcon}>›</Text>
                  )}
                </View>
              </OnboardingCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <OnboardingButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedOption}
          style={styles.continueButton}
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
    paddingBottom: 120, // Space for button
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
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
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
    lineHeight: 24,
    maxWidth: 350,
  },
  optionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
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
    backgroundColor: Colors.background.secondary,
    borderWidth: 2,
    borderColor: Colors.border.primary,
  },
  selectedOptionCardInner: {
    borderColor: Colors.primary.main,
    backgroundColor: `${Colors.primary.main}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary.main,
  },
  optionIcon: {
    fontSize: 24,
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
  },
  continueButton: {
    borderRadius: 12,
  },
});

export default Onboarding9Screen;
