/**
 * Onboarding Screen 9 
 * 
 * Seventh onboarding screen for setting up accountability partnerships
 * and support systems.
 * 
 * Features:
 * - Background image with supportive imagery
 * - Accountability matching options
 * - Support group options
 * - Privacy and safety promises
 * - Encouragement and motivation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { Text, Portal, Modal, Button, Divider, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import Icon from '../../components/Icon';
import { Colors, ColorUtils, Icons } from '../../constants';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveAccountabilityPreferences } from '../../store/slices/onboardingSlice';
import {} from '../../store/slices/invitationSlice';

import { ProgressIndicator } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Onboarding8ScreenProps {
  navigation: any;
  route: {
    params?: {
      userData?: any;
      assessmentData?: any;
      faithData?: any;
    };
  };
}

/**
 * Seventh Onboarding Screen Component
 * 
 * Accountability and support setup.
 */
  const Onboarding8Screen: React.FC<Onboarding8ScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store (persisted) or route params (fallback)
  const storedPersonalInfo = useAppSelector(state => state.onboarding.personalInfo);
  const storedAssessmentData = useAppSelector(state => state.onboarding.assessmentData);
  const storedFaithData = useAppSelector(state => state.onboarding.faithData);
  const existingAccountabilityPrefs = useAppSelector(state => state.onboarding.accountabilityPreferences);
  
  const userData = route.params?.userData || storedPersonalInfo;
  const assessmentData = route.params?.assessmentData || storedAssessmentData;
  const faithData = route.params?.faithData || storedFaithData;
  const userName = userData?.firstName || storedPersonalInfo.firstName || 'Friend';

  // State for tracking selected option
  const [selectedOption, setSelectedOption] = useState<string | null>(
    existingAccountabilityPrefs.preferredType || null
  );
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const handleInviteTrusted = async () => {
    const optionValue = 'trusted-person';
    setSelectedOption(optionValue);
    setInviteModalVisible(true);
  };

  const handleSendInvites = () => {
    if (emails.length === 0) {
      Alert.alert('No Emails', 'Please add at least one email to send invites.');
      return;
    }
    dispatch(saveAccountabilityPreferences({
      preferredType: 'trusted-person',
      hasSelectedOption: true,
      invitedEmails: emails,
      invitationCode: invitationCode,
    }));
    setInviteModalVisible(false);
    Alert.alert('Invites Sent', 'Your accountability invites have been saved and will be sent upon completing your setup.');
  };

  const handleEmailInputSubmit = () => {
    const newEmails = currentEmail.split(',')
      .map(email => email.trim())
      .filter(Boolean);

    if (newEmails.length === 0) return;

    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    newEmails.forEach(email => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (validEmails.length > 0) {
      setEmails(prevEmails => [...prevEmails, ...validEmails]);
    }

    if (invalidEmails.length > 0) {
      Alert.alert('Invalid or Duplicate Email', `The following emails could not be added: ${invalidEmails.join(', ')}`);
    }

    setCurrentEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };


  const handleStartSolo = () => {
    const optionValue = 'solo';
    setSelectedOption(optionValue);
    // Save accountability preference
    dispatch(saveAccountabilityPreferences({ 
      preferredType: optionValue, 
      hasSelectedOption: true 
    }));
    console.log('Start Solo - preference saved');
  };

  const handleAIAccountability = () => {
    const optionValue = 'ai-accountability';
    setSelectedOption(optionValue);
    // Save accountability preference
    dispatch(saveAccountabilityPreferences({ 
      preferredType: optionValue, 
      hasSelectedOption: true 
    }));
    console.log('AI Accountability - preference saved');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCompleteSetup = () => {
    // If no specific accountability option was selected, save as solo by default
    if (!selectedOption) {
      const defaultOption = 'solo';
      setSelectedOption(defaultOption);
      dispatch(saveAccountabilityPreferences({ 
        preferredType: defaultOption, 
        hasSelectedOption: true 
      }));
    }
    
    // Debug log to see what we're saving
    console.log('Accountability preferences saved:', selectedOption, 'navigating to final screen');
     
    // Navigate to final screen (all data is now persisted)
    navigation.navigate('Personalization');
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
              currentStep={9}
              totalSteps={9}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeue6gDjpMBs6u0OLPZvitRmCmuly96YpTmBlZGhfew9fe6zDW-6I2QXt6h-2kAImgiVTkkoixRlPR24bh-9MxKuILqcSs7vg2mSSYONKFXQjdnB_x_HFM04z1l68giBIiOheFLSavQGy2dVN5NZ1db3DOcPnPvBS9rU3DPZbfWVmfyz2uaehvvJ-3yRCkf5b6HNxtgEedctYBT3Qe5DQzYz3I2wMhKOKXwBz0KGyMEcW89gzIiCU_JdDOoTp1ubMsqynjVbRj1G2s'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
          </ImageBackground>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>
            {userName}, You Don't Have to Do This Alone
          </Text>
          <Text style={styles.subtitle}>
            "As iron sharpens iron, so one person sharpens another."
          </Text>
          <Text style={styles.verseReference}>
            - Proverbs 27:17
          </Text>

          {/* Accountability Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>
              Personalized Accountability Matching
            </Text>

            <View style={styles.optionsList}>
              {/* Invite Someone You Trust */}
              <TouchableOpacity 
                onPress={handleInviteTrusted}
                style={
                  selectedOption === 'trusted-person' 
                    ? [styles.optionCard, styles.selectedOptionCard]
                    : styles.optionCard
                }
                activeOpacity={0.7}
              >
                <OnboardingCard style={[
                  styles.optionCardInner,
                  selectedOption === 'trusted-person' && styles.selectedOptionCardInner
                ] as any}>
                  <View style={styles.optionContent}>
                    <View style={
                      selectedOption === 'trusted-person'
                        ? [styles.iconContainer, styles.selectedIconContainer]
                        : styles.iconContainer
                    }>
                      <Text style={styles.iconText}>👤</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={
                        selectedOption === 'trusted-person'
                          ? [styles.optionTitle, styles.selectedOptionTitle]
                          : styles.optionTitle
                      }>Invite Someone You Trust</Text>
                      <Text style={styles.optionDescription}>Guide on how they can support</Text>
                    </View>
                    {selectedOption === 'trusted-person' ? (
                      <Text style={styles.checkIcon}>✓</Text>
                    ) : (
                      <Text style={styles.chevronIcon}>›</Text>
                    )}
                  </View>
                </OnboardingCard>
              </TouchableOpacity>

              {/* Start Solo */}
              <TouchableOpacity 
                onPress={handleStartSolo}
                style={
                  selectedOption === 'solo' 
                    ? [styles.optionCard, styles.selectedOptionCard]
                    : styles.optionCard
                }
                activeOpacity={0.7}
              >
                <OnboardingCard style={[
                  styles.optionCardInner,
                  selectedOption === 'solo' && styles.selectedOptionCardInner
                ] as any}>
                  <View style={styles.optionContent}>
                    <View style={
                      selectedOption === 'solo'
                        ? [styles.iconContainer, styles.selectedIconContainer]
                        : styles.iconContainer
                    }>
                      <Text style={styles.iconText}>🙋‍♂️</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={
                        selectedOption === 'solo'
                          ? [styles.optionTitle, styles.selectedOptionTitle]
                          : styles.optionTitle
                      }>Start Solo</Text>
                      <Text style={styles.optionDescription}>Emergency support available</Text>
                    </View>
                    {selectedOption === 'solo' ? (
                      <Text style={styles.checkIcon}>✓</Text>
                    ) : (
                      <Text style={styles.chevronIcon}>›</Text>
                    )}
                  </View>
                </OnboardingCard>
              </TouchableOpacity>

              {/* AI Accountability */}
              <TouchableOpacity 
                onPress={handleAIAccountability}
                style={
                  selectedOption === 'ai-accountability' 
                    ? [styles.optionCard, styles.selectedOptionCard]
                    : styles.optionCard
                }
                activeOpacity={0.7}
              >
                <OnboardingCard style={[
                  styles.optionCardInner,
                  selectedOption === 'ai-accountability' && styles.selectedOptionCardInner
                ] as any}>
                  <View style={styles.optionContent}>
                    <View style={
                      selectedOption === 'ai-accountability'
                        ? [styles.iconContainer, styles.selectedIconContainer]
                        : styles.iconContainer
                    }>
                      <Text style={styles.iconText}>🤖</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={
                        selectedOption === 'ai-accountability'
                          ? [styles.optionTitle, styles.selectedOptionTitle]
                          : styles.optionTitle
                      }>AI Accountability Partner</Text>
                      <Text style={styles.optionDescription}>24/7 intelligent support & guidance</Text>
                    </View>
                    {selectedOption === 'ai-accountability' ? (
                      <Text style={styles.checkIcon}>✓</Text>
                    ) : (
                      <Text style={styles.chevronIcon}>›</Text>
                    )}
                  </View>
                </OnboardingCard>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Promise */}
          <View style={styles.promiseSection}>
            <Text style={styles.promiseTitle}>
              Personalized Safety Promise
            </Text>
            <Text style={styles.promiseText}>
              Your privacy is our priority. We'll never share your information without your explicit consent.
            </Text>
          </View>

          {/* Encouragement */}
          <View style={styles.encouragementSection}>
            <Text style={styles.encouragementTitle}>
              Custom Encouragement
            </Text>
            <Text style={styles.encouragementText}>
              Remember, every step forward is a victory. You're stronger than you think, and we're here to support you.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title="Complete My Setup & Start Today"
          onPress={handleCompleteSetup}
          variant="primary"
        />
      </View>

      {/* Share Modal for Invitation */}
      <Portal>
        <Modal
          visible={isInviteModalVisible}
          onDismiss={() => setInviteModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Invite Trusted Partners</Text>
          <Text style={styles.modalSubtitle}>Enter the emails of people you trust.</Text>
          {emails.length > 0 && (
            <View style={styles.chipContainer}>
              {emails.map((email, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  onClose={() => removeEmail(email)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {email}
                </Chip>
              ))}
            </View>
          )}
          <TextInput
            mode="outlined"
            label="Add email(s)"
            placeholder="friend@example.com, partner@work.com"
            value={currentEmail}
            onChangeText={setCurrentEmail}
            onSubmitEditing={handleEmailInputSubmit}
            onBlur={handleEmailInputSubmit}
            style={styles.emailInput}
            autoCapitalize="none"
            keyboardType="email-address"
            right={
              currentEmail.trim() ? (
                <TextInput.Icon
                  icon="plus"
                  onPress={handleEmailInputSubmit}
                />
              ) : null
            }
          />
          <TextInput
            label="Invitation Code (Optional)"
            value={invitationCode}
            onChangeText={setInvitationCode}
            style={styles.codeInput}
          />
          <Button mode="contained" onPress={handleSendInvites} style={styles.sendButton}>
            Send Invites
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Space for bottom button
  },
  heroContainer: {
    height: 256,
    marginBottom: 24,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    paddingHorizontal: 24,
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
    fontStyle: 'italic',
    marginBottom: 4,
  },
  verseReference: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    transform: [{ scale: 1 }],
  },
  optionCardInner: {
    margin: 0,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  chevronIcon: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  checkIcon: {
    fontSize: 24,
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  selectedOptionCard: {
    transform: [{ scale: 1.02 }],
  },
  selectedOptionCardInner: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
    backgroundColor: ColorUtils.withOpacity(Colors.primary.main, 0.15),
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary.main,
  },
  selectedOptionTitle: {
    color: Colors.primary.main,
  },
  promiseSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  promiseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  promiseText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  encouragementSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
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
  // Modal styles for sharing
  modalContent: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 16,
  },
  shareOption: {
    alignItems: 'center',
    minWidth: 70,
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  modalDivider: {
    marginVertical: 16,
    backgroundColor: Colors.border.primary,
  },
  copyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: `${Colors.primary.main}10`,
    borderRadius: 8,
    marginBottom: 16,
  },
  copyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.main,
  },
  skipButton: {
    borderColor: Colors.border.primary,
    borderWidth: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: `${Colors.primary.main}10`,
    borderColor: Colors.primary.main,
  },
  chipText: {
    color: Colors.text.primary,
  },
  emailInput: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
  },
  codeInput: {
    marginBottom: 16,
  },
  sendButton: {
    marginTop: 8,
  },
});

export default Onboarding8Screen;
