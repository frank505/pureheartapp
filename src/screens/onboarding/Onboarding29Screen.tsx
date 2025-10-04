/**
 * Onboarding Screen 29 – Accountability & Support Setup
 *
 * Users can choose how they want to start (solo, trusted person, AI partner)
 * and optionally invite trusted partners via email before continuing.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { Text, Portal, Modal, Button, TextInput, Chip } from 'react-native-paper';
import messaging, { AuthorizationStatus, FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import deviceTokenService from '../../services/deviceTokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../navigation/RootNavigation';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import { Colors, ColorUtils } from '../../constants';
import { ProgressIndicator } from '../../components';

// Redux
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveAccountabilityPreferences } from '../../store/slices/onboardingSlice';
import { completeOnboarding } from '../../store/slices/appSlice';
import onboardingSubmissionService from '../../services/onboardingSubmissionService';

interface Props {
  navigation: any;
  route: { params?: { userData?: any; assessmentData?: any; faithData?: any } };
}

const Onboarding29Screen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const storedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);
  const storedAssessmentData = useAppSelector((s) => s.onboarding.assessmentData);
  const storedFaithData = useAppSelector((s) => s.onboarding.faithData);
  const existingAccountabilityPrefs = useAppSelector((s) => s.onboarding.accountabilityPreferences);

  const userData = route.params?.userData || storedPersonalInfo;
  const assessmentData = route.params?.assessmentData || storedAssessmentData; // kept if needed later
  const faithData = route.params?.faithData || storedFaithData; // kept if needed later
  const userName = userData?.firstName || storedPersonalInfo.firstName || 'Friend';

  const [selectedOption, setSelectedOption] = useState<string | null>(existingAccountabilityPrefs.preferredType || null);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [emails, setEmails] = useState<string[]>(existingAccountabilityPrefs.invitedEmails || []);
  const [currentEmail, setCurrentEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState(existingAccountabilityPrefs.invitationCode || '');
  const notificationRequesting = useRef(false);
  const [askedNotification, setAskedNotification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const onboardingState = useAppSelector(s => s.onboarding);

  const handleInviteTrusted = () => {
    const optionValue = 'trusted-person';
    setSelectedOption(optionValue);
    setInviteModalVisible(true);
  };

  const handleSendInvites = () => {
    if (emails.length === 0) {
      Alert.alert('No Emails', 'Please add at least one email to send invites.');
      return;
    }
    dispatch(
      saveAccountabilityPreferences({
        preferredType: 'trusted-person',
        hasSelectedOption: true,
        invitedEmails: emails,
        invitationCode,
      })
    );
    setInviteModalVisible(false);
    Alert.alert('Invites Saved', 'Your accountability invites will be sent after setup.');
  };

  const handleEmailInputSubmit = () => {
    const newEmails = currentEmail
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (!newEmails.length) return;

    const valid: string[] = [];
    const invalid: string[] = [];
    newEmails.forEach((email) => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)) valid.push(email);
      else invalid.push(email);
    });
    if (valid.length) setEmails((prev) => [...prev, ...valid]);
    if (invalid.length) Alert.alert('Invalid / Duplicate', invalid.join(', '));
    setCurrentEmail('');
  };

  const removeEmail = (email: string) => setEmails((prev) => prev.filter((e) => e !== email));

  const pickOption = (opt: 'partner' | 'group' | 'trusted-person' | 'solo' | 'ai-accountability') => {
    setSelectedOption(opt);
    dispatch(saveAccountabilityPreferences({ preferredType: opt, hasSelectedOption: true }));
  };

  const requestNotificationPermission = async () => {
    if (notificationRequesting.current || askedNotification) return;
    notificationRequesting.current = true;
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        Alert.alert(
          'Stay Encouraged',
          'Enable notifications so we can send motivation, scripture and check‑ins.',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'OK' }
          ]
        );
      }
    } catch (e) {
      // silent
    } finally {
      setAskedNotification(true);
      notificationRequesting.current = false;
    }
  };

  const initializePushNotifications = async () => {
    const getDevicePlatform = (): 'ios' | 'android' | null => {
      if (Platform.OS === 'ios') return 'ios';
      if (Platform.OS === 'android') return 'android';
      return null;
    };

    // Request permission already handled earlier via requestNotificationPermission()
    try {
      const token = await messaging().getToken();
      if (token) {
        const platform = getDevicePlatform();
        if (platform) {
          deviceTokenService.register(token, platform).catch(() => undefined);
        }
        AsyncStorage.setItem('fcm_token', token).catch(() => undefined);
      }
    } catch (e) {
      // silent
    }

    // Register listeners (only once; simple guard via ref)
    if (!(initializePushNotifications as any)._registered) {
      (initializePushNotifications as any)._registered = true;

      messaging().onTokenRefresh(async (token) => {
        const platform = getDevicePlatform();
        if (platform) deviceTokenService.register(token, platform).catch(() => undefined);
        AsyncStorage.setItem('fcm_token', token).catch(() => undefined);
      });

      messaging().onMessage(async () => {
        // in-app foreground handling (could display toast)
      });

      messaging().getInitialNotification().then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage?.data?.type === 'group_message') {
          const groupId = String(remoteMessage.data.groupId);
          const groupName = remoteMessage.data.groupName ? String(remoteMessage.data.groupName) : undefined;
          setTimeout(() => navigate('GroupChat', { groupId, groupName }), 300);
        } else if (remoteMessage?.data?.type === 'sensitive_content' && remoteMessage?.data?.sensitiveImageId) {
          const imageId = Number(remoteMessage.data.sensitiveImageId);
          setTimeout(() => navigate('ImageDetail', { imageId }), 300);
        }
      });

      messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        if (remoteMessage?.data?.type === 'group_message') {
          const groupId = String(remoteMessage.data.groupId);
          const groupName = remoteMessage.data.groupName ? String(remoteMessage.data.groupName) : undefined;
          navigate('GroupChat', { groupId, groupName });
        } else if (remoteMessage?.data?.type === 'sensitive_content' && remoteMessage?.data?.sensitiveImageId) {
          const imageId = Number(remoteMessage.data.sensitiveImageId);
          navigate('ImageDetail', { imageId });
        }
      });
    }
  };

  const handleCompleteSetup = async () => {
    if (!selectedOption) {
      pickOption('solo');
    }
    setSubmitting(true);
    try {
      // Request notifications (previously after personalization)
      await requestNotificationPermission();
      await initializePushNotifications();

      // Aggregate all onboarding data
      const payload = {
        personalInfo: onboardingState.personalInfo,
        assessmentData: onboardingState.assessmentData,
        additionalAssessmentData: onboardingState.additionalAssessmentData,
        faithData: onboardingState.faithData,
        howTheyHeard: onboardingState.howTheyHeard,
        accountabilityPreferences: {
          ...onboardingState.accountabilityPreferences,
          preferredType: selectedOption || onboardingState.accountabilityPreferences.preferredType || 'solo',
        },
        recoveryJourneyData: onboardingState.recoveryJourneyData,
        dependencyAssessment: onboardingState.dependencyAssessment,
        clientMeta: { submittedAt: new Date().toISOString() },
      };
      try {
        await onboardingSubmissionService.submitOnboarding(payload as any);
      } catch (e) {
        // Non-fatal; allow onboarding to complete even if submission call fails
      }
      // Mark onboarding complete in app slice
      dispatch(completeOnboarding());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            {/* Assuming 29 is final step now; adjust total if more added */}
            <ProgressIndicator currentStep={29} totalSteps={29} variant="bars" showStepText={true} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroContainer}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeue6gDjpMBs6u0OLPZvitRmCmuly96YpTmBlZGhfew9fe6zDW-6I2QXt6h-2kAImgiVTkkoixRlPR24bh-9MxKuILqcSs7vg2mSSYONKFXQjdnB_x_HFM04z1l68giBIiOheFLSavQGy2dVN5NZ1db3DOcPnPvBS9rU3DPZbfWVmfyz2uaehvvJ-3yRCkf5b6HNxtgEedctYBT3Qe5DQzYz3I2wMhKOKXwBz0KGyMEcW89gzIiCU_JdDOoTp1ubMsqynjVbRj1G2s',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
          </ImageBackground>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>{userName}, You Don't Have to Do This Alone</Text>
          <Text style={styles.subtitle}>"As iron sharpens iron, so one person sharpens another."</Text>
            <Text style={styles.verseReference}>- Proverbs 27:17</Text>

          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Choose Your Path</Text>
            <Text style={styles.trustEmphasis}>⚠️ Important: Only invite someone you trust with your life — someone who genuinely wants to see you grow and succeed.</Text>
            <View style={styles.optionsList}>
              <TouchableOpacity onPress={handleInviteTrusted} style={selectedOption === 'trusted-person' ? [styles.optionCard, styles.selectedOptionCard] : styles.optionCard} activeOpacity={0.7}>
                <OnboardingCard style={[styles.optionCardInner, selectedOption === 'trusted-person' && styles.selectedOptionCardInner] as any}>
                  <View style={styles.optionContent}>
                    <View style={selectedOption === 'trusted-person' ? [styles.iconContainer, styles.selectedIconContainer] : styles.iconContainer}>
                      <Text style={styles.iconText}>👤</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={selectedOption === 'trusted-person' ? [styles.optionTitle, styles.selectedOptionTitle] : styles.optionTitle}>Invite Someone You Trust 100%</Text>
                      <Text style={styles.optionDescription}>They'll receive a guide on how to support you</Text>
                    </View>
                    {selectedOption === 'trusted-person' ? <Text style={styles.checkIcon}>✓</Text> : <Text style={styles.chevronIcon}>›</Text>}
                  </View>
                </OnboardingCard>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => pickOption('solo')} style={selectedOption === 'solo' ? [styles.optionCard, styles.selectedOptionCard] : styles.optionCard} activeOpacity={0.7}>
                <OnboardingCard style={[styles.optionCardInner, selectedOption === 'solo' && styles.selectedOptionCardInner] as any}>
                  <View style={styles.optionContent}>
                    <View style={selectedOption === 'solo' ? [styles.iconContainer, styles.selectedIconContainer] : styles.iconContainer}>
                      <Text style={styles.iconText}>🙋‍♂️</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={selectedOption === 'solo' ? [styles.optionTitle, styles.selectedOptionTitle] : styles.optionTitle}>Start Solo</Text>
                      <Text style={styles.optionDescription}>Emergency support available anytime</Text>
                    </View>
                    {selectedOption === 'solo' ? <Text style={styles.checkIcon}>✓</Text> : <Text style={styles.chevronIcon}>›</Text>}
                  </View>
                </OnboardingCard>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.promiseSection}>
            <Text style={styles.promiseTitle}>Personalized Safety Promise</Text>
            <Text style={styles.promiseText}>Your privacy is our priority. We'll never share your information without your explicit consent.</Text>
          </View>

            <View style={styles.encouragementSection}>
            <Text style={styles.encouragementTitle}>Custom Encouragement</Text>
            <Text style={styles.encouragementText}>Remember, every step forward is a victory. You're stronger than you think, and we're here to support you.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
  <OnboardingButton title={submitting ? 'Finishing…' : 'Complete My Setup & Start Today'} onPress={handleCompleteSetup} variant="primary" disabled={submitting} />
      </View>

      <Portal>
        <Modal visible={isInviteModalVisible} onDismiss={() => setInviteModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Invite Trusted Partners</Text>
          <Text style={styles.modalSubtitle}>Enter the emails of people you trust.</Text>
          {emails.length > 0 && (
            <View style={styles.chipContainer}>
              {emails.map((email) => (
                <Chip key={email} mode="outlined" onClose={() => removeEmail(email)} style={styles.chip} textStyle={styles.chipText}>
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
            right={currentEmail.trim() ? <TextInput.Icon icon="plus" onPress={handleEmailInputSubmit} /> : null}
          />
          <TextInput label="Invitation Code (Optional)" value={invitationCode} onChangeText={setInvitationCode} style={styles.codeInput} />
          <Button mode="contained" onPress={handleSendInvites} style={styles.sendButton}>
            Send Invites
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: Colors.text.primary },
  progressWrapper: { flex: 1, alignItems: 'center', marginHorizontal: 16 },
  headerSpacer: { width: 40 },
  scrollContent: { flexGrow: 1, paddingBottom: 120 },
  heroContainer: { height: 256, marginBottom: 24 },
  heroImage: { flex: 1, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  contentContainer: { paddingHorizontal: 24 },
  mainTitle: { fontSize: 28, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: Colors.text.secondary, textAlign: 'center', fontStyle: 'italic', marginBottom: 4 },
  verseReference: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', fontStyle: 'italic', marginBottom: 32 },
  optionsContainer: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  trustEmphasis: { fontSize: 14, color: '#f5993d', textAlign: 'center', marginBottom: 20, lineHeight: 20, paddingHorizontal: 8, fontWeight: '600' },
  optionsList: { gap: 16 },
  optionCard: { transform: [{ scale: 1 }] },
  optionCardInner: { margin: 0, padding: 16 },
  optionContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 28 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 },
  optionDescription: { fontSize: 14, color: Colors.text.secondary },
  chevronIcon: { fontSize: 24, color: Colors.text.secondary },
  checkIcon: { fontSize: 24, color: Colors.primary.main, fontWeight: 'bold' },
  selectedOptionCard: { transform: [{ scale: 1.02 }] },
  selectedOptionCardInner: { borderWidth: 2, borderColor: Colors.primary.main, backgroundColor: ColorUtils.withOpacity(Colors.primary.main, 0.15) },
  selectedIconContainer: { backgroundColor: Colors.primary.main },
  selectedOptionTitle: { color: Colors.primary.main },
  promiseSection: { alignItems: 'center', marginBottom: 32 },
  promiseTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  promiseText: { fontSize: 16, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  encouragementSection: { alignItems: 'center', marginBottom: 24 },
  encouragementTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  encouragementText: { fontSize: 16, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background.primary, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(74,74,74,0.3)' },
  modalContent: { backgroundColor: Colors.background.secondary, margin: 16, borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', marginBottom: 24 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: `${Colors.primary.main}10`, borderColor: Colors.primary.main },
  chipText: { color: Colors.text.primary },
  emailInput: { backgroundColor: Colors.background.tertiary, marginBottom: 16 },
  codeInput: { marginBottom: 16 },
  sendButton: { marginTop: 8 },
});

export default Onboarding29Screen;
