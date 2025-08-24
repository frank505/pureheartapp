import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type FastMonitorScreenRouteProp = RouteProp<RootStackParamList, 'FastMonitor'>;

const FastMonitorScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<FastMonitorScreenRouteProp>();
  const { startDate, endDate, fastType, purpose } = route.params;

  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const remaining = end.getTime() - now.getTime();

        if (remaining <= 0) {
          clearInterval(interval);
          // Handle fast completion
          return;
        }

        // Calculate remaining time
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);

        setHours(String(h).padStart(2, '0'));
        setMinutes(String(m).padStart(2, '0'));
        setSeconds(String(s).padStart(2, '0'));

        // Calculate progress
        const progressPercent = (elapsed / totalDuration) * 100;
        setProgress(Math.min(progressPercent, 100));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate, isPaused]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndFast = () => {
    // TODO: Handle ending the fast early
    navigation.replace('MainTabs');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            {/* User avatar placeholder */}
            <View style={styles.avatarImage} />
          </View>
        </View>

        <Text style={styles.dateText}>{formatDate(new Date())}</Text>

        <Text style={styles.sectionTitle}>Remaining Time</Text>
        
        <View style={styles.timerContainer}>
          <View style={styles.timeBlock}>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{hours}</Text>
            </View>
            <Text style={styles.timeLabel}>Hours</Text>
          </View>

          <View style={styles.timeBlock}>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{minutes}</Text>
            </View>
            <Text style={styles.timeLabel}>Minutes</Text>
          </View>

          <View style={styles.timeBlock}>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{seconds}</Text>
            </View>
            <Text style={styles.timeLabel}>Seconds</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Fasting Progress</Text>
            <Text style={styles.progressText}>{Math.round(progress)}/100%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {purpose && (
          <Text style={styles.purposeText}>
            {purpose}
          </Text>
        )}

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handlePauseResume}
            style={[styles.actionButton, styles.pauseButton]}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            mode="contained"
            onPress={handleEndFast}
            style={[styles.actionButton, styles.endButton]}
          >
            End Fasting
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={() => {/* TODO: Handle prayer & support */}}
          style={styles.supportButton}
        >
          Prayer & Support
        </Button>

        <View style={styles.timeline}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{formatDate(startDate)}</Text>
            <Text style={styles.timelineSubtitle}>Starting Time</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{formatDate(endDate)}</Text>
            <Text style={styles.timelineSubtitle}>End Time</Text>
          </View>
        </View>

        <View style={styles.communitySection}>
          {/* Add community avatars here */}
          <Text style={styles.communityText}>530K people are fasting with you now</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111922',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#111922',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#111922',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#111922',
    backgroundColor: '#243447',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#243447',
  },
  dateText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  timeValue: {
    backgroundColor: '#243447',
    borderRadius: 8,
    width: '90%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  timeText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeLabel: {
    color: Colors.white,
    fontSize: 14,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    color: Colors.white,
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#344b65',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1979e6',
    borderRadius: 4,
  },
  purposeText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  pauseButton: {
    backgroundColor: '#243447',
  },
  endButton: {
    backgroundColor: '#1979e6',
  },
  supportButton: {
    backgroundColor: '#243447',
    marginHorizontal: 16,
    marginVertical: 12,
    height: 40,
    borderRadius: 8,
  },
  timeline: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  timelineLine: {
    width: 1.5,
    height: 16,
    backgroundColor: '#344b65',
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 12,
  },
  timelineTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  timelineSubtitle: {
    color: '#93acc8',
    fontSize: 16,
  },
  communitySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  communityText: {
    color: '#93acc8',
    fontSize: 14,
    paddingVertical: 4,
  },
});

export default FastMonitorScreen;
