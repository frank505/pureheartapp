import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FastingStackParamList } from '../navigation/FastingNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';

// Use types from Fasting navigator
// type ConfigureFastRouteProp = RouteProp<RootStackParamList, 'ConfigureFast'>;
type ConfigureFastRouteProp = RouteProp<FastingStackParamList, 'ConfigureFast'>;

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ConfigureFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FastingStackParamList>>() ;
  const route = useRoute<ConfigureFastRouteProp>();
  const { fastType } = route.params;

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [scheduleType, setScheduleType] = useState<'recurring' | 'fixed'>('recurring');
  const [selectedDuration, setSelectedDuration] = useState<'12h' | '24h' | '3d' | '7d'>('24h');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);

  // Prefill defaults based on fast type (e.g., Nightly 6pm–6am)
  useEffect(() => {
    if (fastType === 'nightly') {
      const now = new Date();
      const start = new Date(now);
      start.setHours(18, 0, 0, 0); // 6:00 PM today
      const end = new Date(start);
      end.setDate(end.getDate() + 1); // next day
      end.setHours(6, 0, 0, 0); // 6:00 AM next day
      setStartTime(start);
      setEndTime(end);
    }
  }, [fastType]);

  // If in fixed mode, keep endTime in sync with startTime and selected duration
  useEffect(() => {
    if (scheduleType !== 'fixed') return;
    const next = computeFixedEnd(startTime, selectedDuration);
    setEndTime(next);
  }, [scheduleType, selectedDuration, startTime]);

  const computeFixedEnd = (start: Date, duration: '12h' | '24h' | '3d' | '7d') => {
    const res = new Date(start);
    switch (duration) {
      case '12h':
        res.setHours(res.getHours() + 12);
        break;
      case '24h':
        res.setHours(res.getHours() + 24);
        break;
      case '3d':
        res.setDate(res.getDate() + 3);
        break;
      case '7d':
        res.setDate(res.getDate() + 7);
        break;
    }
    return res;
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('StartFast');
  };

  const handleDayPress = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const clampNightlyStart = (d: Date) => {
    const startMin = new Date(d);
    startMin.setHours(18, 0, 0, 0);
    const startMax = new Date(d);
    startMax.setHours(23, 59, 0, 0);
    if (d < startMin) {
      setHelperMessage('Nightly fast starts no earlier than 6:00 PM. Adjusted to 6:00 PM.');
      return startMin;
    }
    if (d > startMax) {
      setHelperMessage('Nightly fast start must be between 6:00 PM and 11:59 PM. Adjusted.');
      return startMax;
    }
    setHelperMessage(null);
    return d;
  };

  const clampNightlyEnd = (d: Date, startRef: Date) => {
    // End should be next-day between 12:00 AM and 6:00 AM
    const nextDay = new Date(startRef);
    nextDay.setDate(nextDay.getDate() + 1);
    const endMin = new Date(nextDay);
    endMin.setHours(0, 0, 0, 0);
    const endMax = new Date(nextDay);
    endMax.setHours(6, 0, 0, 0);

    // Force date to next day
    const result = new Date(nextDay);
    result.setHours(d.getHours(), d.getMinutes(), 0, 0);

    if (result < endMin) {
      setHelperMessage('Nightly fast ends no earlier than 12:00 AM. Adjusted.');
      return endMin;
    }
    if (result > endMax) {
      setHelperMessage('Nightly fast ends no later than 6:00 AM. Adjusted.');
      return endMax;
    }
    setHelperMessage(null);
    return result;
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    // On Android the picker is a modal; close after a selection or dismissal.
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') {
        setShowStartTimePicker(false);
        return;
      }
      setShowStartTimePicker(false);
    }

    const selected = selectedDate || startTime;
    // Custom + fixed: just set the start time and recompute end
    if (fastType === 'custom' && scheduleType === 'fixed') {
      const s = new Date(startTime);
      s.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setStartTime(s);
      setHelperMessage(null);
      return;
    }
    if (fastType === 'nightly') {
      const clamped = clampNightlyStart(selected);
      setStartTime(clamped);
      setEndTime((prev) => clampNightlyEnd(prev, clamped));
    } else {
      setStartTime(selected);
      setHelperMessage(null);
      // For non-fixed schedules, ensure end time remains after start time
      if (scheduleType !== 'fixed') {
        setEndTime((prev) => {
          if (prev <= selected) {
            const adjusted = new Date(selected);
            adjusted.setHours(selected.getHours() + 1, selected.getMinutes(), 0, 0);
            return adjusted;
          }
          return prev;
        });
      }
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') {
        setShowEndTimePicker(false);
        return;
      }
      setShowEndTimePicker(false);
    }

    const selected = selectedDate || endTime;
    if (fastType === 'custom' && scheduleType === 'fixed') {
      // End time is derived from duration; do not allow manual edit in fixed mode.
      setHelperMessage(null);
      return;
    }
    if (fastType === 'nightly') {
      const clamped = clampNightlyEnd(selected, startTime);
      setEndTime(clamped);
    } else {
      if (selected <= startTime) {
        const fixed = new Date(startTime);
        fixed.setHours(startTime.getHours() + 1);
        setHelperMessage('End time adjusted to be after start time.');
        setEndTime(fixed);
      } else {
        setHelperMessage(null);
        setEndTime(selected);
      }
    }
  };

  const handleNext = () => {
    // Enforce invariant: endTime must be strictly after startTime
    let safeStart = startTime;
    let safeEnd = endTime;
    if (safeEnd <= safeStart) {
      const adjusted = new Date(safeStart);
      adjusted.setHours(safeStart.getHours() + 1, safeStart.getMinutes(), 0, 0);
      setEndTime(adjusted);
      safeEnd = adjusted;
    }

    const base = {
      fastType,
      startTime: safeStart.toISOString(),
      endTime: safeEnd.toISOString(),
    } as const;

    if (fastType === 'custom') {
      if (scheduleType === 'recurring') {
        navigation.navigate('NewFast', {
          ...base,
          selectedDays,
          frequency,
        });
      } else {
        // Fixed one-time custom fast
        navigation.navigate('NewFast', base as any);
      }
      return;
    }

    if (fastType === 'weekly') {
      // Weekly recurring requires selected days
      navigation.navigate('NewFast', {
        ...base,
        frequency: 'weekly',
        selectedDays,
      } as any);
      return;
    }

    if (fastType === 'daily' || fastType === 'nightly') {
      navigation.navigate('NewFast', {
        ...base,
        frequency: 'daily',
      } as any);
      return;
    }

    // breakthrough or others: pass base only
    navigation.navigate('NewFast', base as any);
  };
  
  const renderDailyConfig = () => (
    <>
      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)} activeOpacity={0.7} testID="open-start-time">
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            value={startTime.toLocaleTimeString()}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {showStartTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            onChange={onStartTimeChange}
          />
          <View style={styles.pickerActions}>
            <Button onPress={() => setShowStartTimePicker(false)}>Close</Button>
          </View>
        </View>
      )}
      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)} activeOpacity={0.7} testID="open-end-time">
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            value={endTime.toLocaleTimeString()}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {showEndTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            onChange={onEndTimeChange}
          />
          <View style={styles.pickerActions}>
            <Button onPress={() => setShowEndTimePicker(false)}>Close</Button>
          </View>
        </View>
      )}
    </>
  );

  const renderWeeklyConfig = () => (
    <>
      <Text style={styles.label}>Select Days</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map(day => (
          <TouchableOpacity 
            key={day} 
            style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
            onPress={() => handleDayPress(day)}
          >
            <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextSelected]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderDailyConfig()}
    </>
  );

  const renderFixedConfig = () => (
    <>
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)} activeOpacity={0.7}>
        <View pointerEvents="none">
          <TextInput style={styles.input} value={startTime.toLocaleDateString()} editable={false} />
        </View>
      </TouchableOpacity>
      {showStartDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, date?: Date) => {
              if (Platform.OS === 'android') {
                if (event?.type === 'dismissed') {
                  setShowStartDatePicker(false);
                  return;
                }
                setShowStartDatePicker(false);
              }
              const d = date || startTime;
              const updated = new Date(startTime);
              updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
              setStartTime(updated);
            }}
          />
          <View style={styles.pickerActions}>
            <Button onPress={() => setShowStartDatePicker(false)}>Close</Button>
          </View>
        </View>
      )}

      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)} activeOpacity={0.7}>
        <View pointerEvents="none">
          <TextInput style={styles.input} value={startTime.toLocaleTimeString()} editable={false} />
        </View>
      </TouchableOpacity>
      {showStartTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            onChange={(event: any, date?: Date) => {
              if (Platform.OS === 'android') {
                if (event?.type === 'dismissed') {
                  setShowStartTimePicker(false);
                  return;
                }
                setShowStartTimePicker(false);
              }
              const d = date || startTime;
              const updated = new Date(startTime);
              updated.setHours(d.getHours(), d.getMinutes(), 0, 0);
              setStartTime(updated);
            }}
          />
          <View style={styles.pickerActions}>
            <Button onPress={() => setShowStartTimePicker(false)}>Close</Button>
          </View>
        </View>
      )}

      <Text style={styles.label}>Duration</Text>
      <View style={styles.switchContainer}>
        <Button mode={selectedDuration === '12h' ? 'contained' : 'outlined'} onPress={() => setSelectedDuration('12h')}>12 hours</Button>
        <Button mode={selectedDuration === '24h' ? 'contained' : 'outlined'} onPress={() => setSelectedDuration('24h')}>24 hours</Button>
      </View>
      <View style={styles.switchContainer}>
        <Button mode={selectedDuration === '3d' ? 'contained' : 'outlined'} onPress={() => setSelectedDuration('3d')}>3 days</Button>
        <Button mode={selectedDuration === '7d' ? 'contained' : 'outlined'} onPress={() => setSelectedDuration('7d')}>7 days</Button>
      </View>

      <Text style={styles.label}>Ends</Text>
      <View pointerEvents="none">
        <TextInput style={styles.input} value={`${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}`} editable={false} />
      </View>
    </>
  );

  const renderCustomConfig = () => (
    <>
      <Text style={styles.label}>Type</Text>
      <View style={styles.switchContainer}>
        <Button mode={scheduleType === 'recurring' ? 'contained' : 'outlined'} onPress={() => setScheduleType('recurring')}>Recurring</Button>
        <Button mode={scheduleType === 'fixed' ? 'contained' : 'outlined'} onPress={() => setScheduleType('fixed')}>Fixed (one-time)</Button>
      </View>

      {scheduleType === 'fixed' ? (
        renderFixedConfig()
      ) : (
        <>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.switchContainer}>
            <Button mode={frequency === 'daily' ? 'contained' : 'outlined'} onPress={() => setFrequency('daily')}>Daily</Button>
            <Button mode={frequency === 'weekly' ? 'contained' : 'outlined'} onPress={() => setFrequency('weekly')}>Weekly</Button>
          </View>
          {frequency === 'weekly' && (
            <>
              <Text style={styles.label}>Select Days</Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
                    onPress={() => handleDayPress(day)}
                  >
                    <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {renderDailyConfig()}
        </>
      )}
    </>
  );

  const renderContent = () => {
    switch (fastType) {
      case 'daily':
        return renderDailyConfig();
      case 'weekly':
        return renderWeeklyConfig();
      case 'custom':
        return renderCustomConfig();
      case 'nightly':
        return (
          <>
            <Text style={styles.label}>Nightly Fast (6:00 PM – 6:00 AM)</Text>
            {renderDailyConfig()}
          </>
        );
      default:
        return null; // For nightly and breakthrough, maybe no extra config needed or a simpler one
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Your Fast</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content}>
        {renderContent()}
        {!!helperMessage && (
          <Text style={styles.helperMessage}>{helperMessage}</Text>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    elevation: 1000,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginLeft: -48,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
    color: Colors.white,
    height: 50,
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: Colors.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary.main,
  },
  dayText: {
    color: Colors.primary.main,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
  },
  nextButton: {
    height: 48,
    justifyContent: 'center',
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  helperMessage: {
    color: '#ffb86c',
    marginTop: 8,
  },
});

export default ConfigureFastScreen;
