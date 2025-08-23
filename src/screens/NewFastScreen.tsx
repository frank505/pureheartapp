import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import fastingService from '../services/fastingService';
import { Alert } from 'react-native';

type NewFastScreenRouteProp = RouteProp<RootStackParamList, 'NewFast'>;

const NewFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const _route = useRoute<NewFastScreenRouteProp>();

  const [goal, setGoal] = useState('');
  const [smartGoal, setSmartGoal] = useState('');
  const [prayerTimes, setPrayerTimes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [inviteAllPartners, setInviteAllPartners] = useState(true);

  // Multi-step slideshow state
  const steps = [
    'Goal',
    'SMART Goal',
    'Prayer Commitment',
    'Accountability Partner',
  ] as const;
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Extract readable error messages from different API error shapes
  const getErrorMessage = (err: any): string => {
    const status = err?.response?.status;
    const statusText = err?.response?.statusText;
    const data = err?.response?.data;
    if (!data) {
      return err?.message || (status ? `${status} ${statusText || ''}`.trim() : 'Something went wrong');
    }
    if (typeof data === 'string') return data;
    // Common NestJS/Joi shapes: { message: string | string[], error: string, statusCode: number }
    if (Array.isArray(data?.message)) return data.message.join('\n');
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.errors)) {
      return data.errors.map((e: any) => e?.message || JSON.stringify(e)).join('\n');
    }
    if (Array.isArray(data?.details)) {
      return data.details.map((d: any) => d?.message || JSON.stringify(d)).join('\n');
    }
    if (data?.error) return `${data.error}${data.description ? `: ${data.description}` : ''}`;
    return err?.message || 'Something went wrong';
  };

  // Convert a variety of time inputs (e.g., "6 AM", "6:30pm", "18:00") to HH:mm; return null if invalid
  const parseTimeTo24h = (input: string): string | null => {
    const s = (input || '').trim().toLowerCase();
    if (!s) return null;
    // Match: H[:MM][ ](am|pm)?
    const m = s.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);
    if (!m) return null;
    let hours = parseInt(m[1], 10);
    let minutes = m[2] ? parseInt(m[2], 10) : 0;
    const meridiem = m[3];

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    if (minutes < 0 || minutes > 59) return null;

    if (meridiem) {
      if (hours < 1 || hours > 12) return null;
      if (meridiem === 'am') {
        hours = hours === 12 ? 0 : hours;
      } else if (meridiem === 'pm') {
        hours = hours === 12 ? 12 : hours + 12;
      }
    } else {
      if (hours < 0 || hours > 23) return null;
    }

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const submitCreateFast = async () => {
    try {
      // Validate and normalize prayer times to HH:mm expected by backend
      const rawTimes = prayerTimes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const normalizedTimes: string[] = [];
      const invalid: string[] = [];
      for (const t of rawTimes) {
        const parsed = parseTimeTo24h(t);
        if (parsed) normalizedTimes.push(parsed);
        else invalid.push(t);
      }
      if (invalid.length) {
        Alert.alert(
          'Invalid prayer time(s)',
          `Please use times like 06:00, 12:00, 18:00 or 6 AM, 6:30pm. Invalid: ${invalid.join(', ')}`
        );
        return;
      }

      setSubmitting(true);
      const now = new Date();
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const payload = {
        type: _route.params?.fastType ?? 'custom',
        goal: goal?.trim() || undefined,
        smartGoal: smartGoal?.trim() || undefined,
        prayerTimes: normalizedTimes,
        verse: undefined,
        prayerFocus: undefined,
        reminderEnabled,
        widgetEnabled,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        addAccountabilityPartners: inviteAllPartners,
      } as const;

      await fastingService.create(payload);
      Alert.alert('Fast created', 'Your fast has been created.');
  // Redirect into the Fasting flow entry so it can refetch and route appropriately
  (navigation as any).navigate('FastingEntry');
    } catch (e: any) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      submitCreateFast();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  };

  const progressDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: steps.length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === step ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.sectionTitle}>What is your goal for this fast?</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={goal}
                onChangeText={setGoal}
                style={styles.input}
                selectionColor={Colors.primary.main}
                underlineStyle={{ display: 'none' }}
                theme={{ colors: { text: Colors.white } }}
              />
            </View>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.sectionTitle}>SMART Goal Setting</Text>
            <Text style={styles.description}>
              Define a SMART goal to focus your fast and track progress in overcoming your addiction. 
              This will help you stay committed and see tangible results.
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={smartGoal}
                onChangeText={setSmartGoal}
                placeholder="Describe your SMART goal for addiction recovery"
                multiline
                numberOfLines={6}
                style={[styles.input, styles.textArea]}
                placeholderTextColor="#93acc8"
                selectionColor={Colors.primary.main}
                underlineStyle={{ display: 'none' }}
                theme={{ colors: { text: Colors.white } }}
              />
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.sectionTitle}>Prayer Commitment</Text>
            <Text style={styles.description}>
              Commit to specific prayer times during your fast to strengthen your spiritual connection 
              and seek guidance. Consider setting reminders to stay consistent.
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={prayerTimes}
                onChangeText={setPrayerTimes}
                placeholder="Prayer Times (e.g., 06:00, 12:30, 18:00 or 6 AM, 12 PM, 6:30pm)"
                style={styles.input}
                placeholderTextColor="#93acc8"
                selectionColor={Colors.primary.main}
                underlineStyle={{ display: 'none' }}
                theme={{ colors: { text: Colors.white } }}
              />
            </View>

            <View style={styles.reminderContainer}>
              <View style={styles.reminderIcon}>
                <Icon name="alarm" size={24} color={Colors.white} />
              </View>
              <View style={styles.reminderText}>
                <Text style={styles.reminderTitle}>Set Prayer Reminders</Text>
                <Text style={styles.reminderDescription}>
                  Receive notifications to remind you of your prayer times.
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#243447', true: '#1979e6' }}
                thumbColor={Colors.white}
                ios_backgroundColor="#243447"
              />
            </View>

            <View style={styles.reminderContainer}>
              <View style={styles.reminderIcon}>
                <Icon name="apps" size={24} color={Colors.white} />
              </View>
              <View style={styles.reminderText}>
                <Text style={styles.reminderTitle}>Add to Widget</Text>
                <Text style={styles.reminderDescription}>
                  Add fast progress tracking to your home screen widget.
                </Text>
              </View>
              <Switch
                value={widgetEnabled}
                onValueChange={setWidgetEnabled}
                trackColor={{ false: '#243447', true: '#1979e6' }}
                thumbColor={Colors.white}
                ios_backgroundColor="#243447"
              />
            </View>
          </>
        );
  case 3:
        return (
          <>
            <Text style={styles.sectionTitle}>Accountability Partner</Text>
            <Text style={styles.description}>
              Having an accountability partner can significantly boost your success. 
              They provide support, encouragement, and help you stay on track.
            </Text>

            <View style={styles.reminderContainer}>
              <View style={styles.reminderIcon}>
                <Icon name="people" size={24} color={Colors.white} />
              </View>
              <View style={styles.reminderText}>
                <Text style={styles.reminderTitle}>Invite All Partners</Text>
                <Text style={styles.reminderDescription}>
                  Automatically invite all accountability partners to track your fast.
                </Text>
              </View>
              <Switch
                value={inviteAllPartners}
                onValueChange={setInviteAllPartners}
                trackColor={{ false: '#243447', true: '#1979e6' }}
                thumbColor={Colors.white}
                ios_backgroundColor="#243447"
              />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Fast</Text>
          <View style={styles.headerSpacer} />
        </View>

        {progressDots()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.backButton]} onPress={handleBack}>
              <Text style={styles.backButtonText}>{step === 0 ? 'Close' : 'Back'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nextButton, submitting && styles.nextButtonDisabled]} onPress={handleNext} disabled={submitting}>
              <Text style={[styles.nextButtonText, submitting && styles.nextButtonTextDisabled]}>{step === steps.length - 1 ? (submitting ? 'Saving…' : 'Finish') : 'Next'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  backgroundColor: Colors.background.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
  backgroundColor: Colors.primary.main,
  },
  inactiveDot: {
  backgroundColor: Colors.background.tertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
    lineHeight: 24,
  },
  inputContainer: {
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#1a2532',
    borderWidth: 1,
    borderColor: '#344b65',
    borderRadius: 8,
    color: Colors.white,
    paddingHorizontal: 15,
    height: 56,
    fontSize: 16,
  },
  textArea: {
    height: 144,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#243447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  reminderDescription: {
    color: '#93acc8',
    fontSize: 14,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#243447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  prayerText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
  },

  footer: {
    padding: 12,
  },
  backButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border?.primary || '#344b65',
    flexGrow: 1,
  },
  backButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButton: {
    height: 40,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonTextDisabled: {
    color: Colors.text.secondary,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default NewFastScreen;
