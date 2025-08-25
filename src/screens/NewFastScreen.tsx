import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { FastingStackParamList } from '../navigation/FastingNavigator';
import fastingService from '../services/fastingService';
import { Alert } from 'react-native';

type NewFastScreenRouteProp = RouteProp<RootStackParamList, 'NewFast'>;

const NewFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FastingStackParamList>>();
  const _route = useRoute<NewFastScreenRouteProp>();

  const configuredStartISO = _route.params?.startTime;
  const configuredEndISO = _route.params?.endTime;
  const configuredDays = _route.params?.selectedDays ?? [];
  const configuredFrequency = _route.params?.frequency;

  const [goal, setGoal] = useState('');
  const [smartGoal, setSmartGoal] = useState('');
  const [prayerTimes, setPrayerTimes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [inviteAllPartners, setInviteAllPartners] = useState(true);

  const [invalidTimes, setInvalidTimes] = useState<string[]>([]);
  const [outsideWindowTimes, setOutsideWindowTimes] = useState<string[]>([]);

  const fastWindow = useMemo(() => {
    if (!configuredStartISO || !configuredEndISO) return null;
    const start = new Date(configuredStartISO);
    const end = new Date(configuredEndISO);
    return { start, end } as const;
  }, [configuredStartISO, configuredEndISO]);

  const isTimeWithinWindow = (hh: number, mm: number, start: Date, end: Date) => {
    const t = new Date(start);
    t.setHours(hh, mm, 0, 0);
    const sameDayWindow = end.getTime() >= start.getTime();
    if (sameDayWindow) {
      return t >= start && t <= end;
    }
    // Wraps past midnight: allowed if after start OR before end
    const endSameDay = new Date(start);
    endSameDay.setHours(end.getHours(), end.getMinutes(), 0, 0);
    return t >= start || t <= endSameDay;
  };

  const validatePrayerTimes = (input: string) => {
    const raw = input.split(',').map((t) => t.trim()).filter(Boolean);
    const normalized: string[] = [];
    const invalid: string[] = [];
    const outOfWindow: string[] = [];
    for (const t of raw) {
      const parsed = parseTimeTo24h(t);
      if (!parsed) {
        invalid.push(t);
        continue;
      }
      if (fastWindow) {
        const [hh, mm] = parsed.split(':').map(Number);
        if (!isTimeWithinWindow(hh, mm, fastWindow.start, fastWindow.end)) {
          outOfWindow.push(t);
          continue;
        }
      }
      normalized.push(parsed);
    }
    return { normalized, invalid, outOfWindow } as const;
  };

  const onPrayerTimesChange = (text: string) => {
    setPrayerTimes(text);
    const v = validatePrayerTimes(text);
    setInvalidTimes(v.invalid);
    setOutsideWindowTimes(v.outOfWindow);
  };

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
      const { normalized, invalid, outOfWindow } = validatePrayerTimes(prayerTimes);
      if (invalid.length) {
        Alert.alert(
          'Invalid prayer time(s)',
          `Please use times like 06:00, 12:00, 18:00 or 6 AM, 6:30pm. Invalid: ${invalid.join(', ')}`
        );
        return;
      }
      if (outOfWindow.length) {
        Alert.alert(
          'Prayer times outside fast window',
          `These times are outside your fast hours and were rejected: ${outOfWindow.join(', ')}`
        );
        return;
      }

      setSubmitting(true);
      const now = new Date();
      const defaultEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const type = (_route.params?.fastType ?? 'custom') as 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';

      // Build schedule per backend schema
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      let schedule: any;
      // Normalize a base window for fixed schedules
      let startAt = fastWindow ? new Date(fastWindow.start) : now;
      let endAt = fastWindow ? new Date(fastWindow.end) : new Date(defaultEnd);
      if (type === 'breakthrough') {
        // Force 24h window for breakthrough
        endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
      }
      if (endAt <= startAt) {
        // Ensure a valid positive duration
        endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
      }
      if (fastWindow) {
        // Determine if this is likely recurring (daily, nightly, weekly, or custom with frequency) vs fixed
        const isRecurring = type === 'daily' || type === 'nightly' || type === 'weekly' || (!!configuredFrequency);
        if (isRecurring) {
          // Use HH:mm window from configured ISO dates
          const pad = (n: number) => n.toString().padStart(2, '0');
          const window = {
            start: `${pad(fastWindow.start.getHours())}:${pad(fastWindow.start.getMinutes())}`,
            end: `${pad(fastWindow.end.getHours())}:${pad(fastWindow.end.getMinutes())}`,
          };
          schedule = {
            kind: 'recurring',
            frequency: configuredFrequency ?? (type === 'weekly' ? 'weekly' : 'daily'),
            ...(configuredFrequency === 'weekly' || type === 'weekly'
              ? { daysOfWeek: (configuredDays || []).map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(d)).filter((n) => n >= 0) }
              : {}),
            window,
            timezone,
          };
        } else {
          schedule = {
            kind: 'fixed',
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
            timezone,
          };
        }
      } else {
        // Fallback: create a 24h fixed fast starting now
        schedule = {
          kind: 'fixed',
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          timezone,
        };
      }

      const payload = {
        type,
        schedule,
        goal: goal?.trim() || undefined,
        smartGoal: smartGoal?.trim() || undefined,
        prayerTimes: normalized, // backend defaults to [] if omitted
        verse: undefined,
        prayerFocus: undefined,
        reminderEnabled,
        widgetEnabled,
        addAccountabilityPartners: !!inviteAllPartners,
      } as const;

      const sanitized = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined && v !== null)
      );

  await fastingService.create(sanitized as any);
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
      // Block leaving the Prayer Commitment step if there are invalid/out-of-window times
      if (step === 2) {
        const v = validatePrayerTimes(prayerTimes);
        setInvalidTimes(v.invalid);
        setOutsideWindowTimes(v.outOfWindow);
        if (v.invalid.length || v.outOfWindow.length) {
          Alert.alert(
            'Fix prayer times',
            v.invalid.length
              ? `Invalid: ${v.invalid.join(', ')}`
              : `Outside fast window: ${v.outOfWindow.join(', ')}`
          );
          return;
        }
      }
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
                onChangeText={onPrayerTimesChange}
                placeholder="Prayer Times (e.g., 06:00, 12:30, 18:00 or 6 AM, 12 PM, 6:30pm)"
                style={styles.input}
                placeholderTextColor="#93acc8"
                selectionColor={Colors.primary.main}
                underlineStyle={{ display: 'none' }}
                theme={{ colors: { text: Colors.white } }}
              />
              {!!invalidTimes.length && (
                <Text style={{ color: '#ff6b6b', marginTop: 6 }}>
                  Invalid: {invalidTimes.join(', ')}
                </Text>
              )}
              {!!outsideWindowTimes.length && (
                <Text style={{ color: '#ffb86c', marginTop: 6 }}>
                  Outside fast window: {outsideWindowTimes.join(', ')}
                </Text>
              )}
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 8,
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
