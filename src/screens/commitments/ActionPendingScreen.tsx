import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Text, Surface, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';
import { useAppSelector } from '../../store/hooks';

type ActionPendingScreenRouteProp = RouteProp<RootStackParamList, 'ActionPending'>;

const { width } = Dimensions.get('window');

const ActionPendingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ActionPendingScreenRouteProp>();
  const activeCommitment = useAppSelector((state) => state.commitments.activeCommitment);

  const [timeRemaining, setTimeRemaining] = useState({
    hours: 48,
    minutes: 0,
    seconds: 0,
  });
  const [pulseAnim] = useState(new Animated.Value(1));

  // Calculate time remaining until deadline (48 hours from relapse)
  useEffect(() => {
    if (!activeCommitment?.lastRelapse) return;

    const updateTimer = () => {
      const relapseTime = new Date(activeCommitment.lastRelapse!.timestamp).getTime();
      const deadline = relapseTime + (48 * 60 * 60 * 1000); // 48 hours
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeCommitment?.lastRelapse]);

  // Pulse animation for urgent timer
  useEffect(() => {
    if (timeRemaining.hours < 6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [timeRemaining.hours]);

  const progressValue = () => {
    const totalSeconds = 48 * 60 * 60;
    const remainingSeconds = 
      timeRemaining.hours * 3600 + 
      timeRemaining.minutes * 60 + 
      timeRemaining.seconds;
    return 1 - (remainingSeconds / totalSeconds);
  };

  const isUrgent = timeRemaining.hours < 6;
  const isExpired = timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0;

  if (!activeCommitment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="alert-circle-outline" size={64} color={Colors.error.main} />
          <Text style={styles.errorText}>No active commitment found</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
          >
            Go Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Icon 
            name={isExpired ? "close-circle" : "time-outline"} 
            size={64} 
            color={isExpired ? Colors.error.main : isUrgent ? Colors.warning.main : Colors.primary.main} 
          />
          <Text style={styles.title}>
            {isExpired ? 'Action Deadline Passed' : 'Action Required'}
          </Text>
          <Text style={styles.subtitle}>
            {isExpired 
              ? 'You missed the 48-hour deadline'
              : 'Complete your service action to stay on track'
            }
          </Text>
        </View>

        {/* Countdown Timer */}
        {!isExpired && (
          <Animated.View style={[styles.timerCard, { transform: [{ scale: pulseAnim }] }]}>
            <Surface style={[styles.timerSurface, isUrgent && styles.timerUrgent]}>
              <Text style={[styles.timerLabel, isUrgent && styles.timerLabelUrgent]}>
                Time Remaining
              </Text>
              <View style={styles.timerDisplay}>
                <View style={styles.timerUnit}>
                  <Text style={[styles.timerValue, isUrgent && styles.timerValueUrgent]}>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.timerUnitLabel, isUrgent && styles.timerUnitLabelUrgent]}>
                    Hours
                  </Text>
                </View>
                <Text style={[styles.timerSeparator, isUrgent && styles.timerSeparatorUrgent]}>
                  :
                </Text>
                <View style={styles.timerUnit}>
                  <Text style={[styles.timerValue, isUrgent && styles.timerValueUrgent]}>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.timerUnitLabel, isUrgent && styles.timerUnitLabelUrgent]}>
                    Minutes
                  </Text>
                </View>
                <Text style={[styles.timerSeparator, isUrgent && styles.timerSeparatorUrgent]}>
                  :
                </Text>
                <View style={styles.timerUnit}>
                  <Text style={[styles.timerValue, isUrgent && styles.timerValueUrgent]}>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.timerUnitLabel, isUrgent && styles.timerUnitLabelUrgent]}>
                    Seconds
                  </Text>
                </View>
              </View>
              <ProgressBar 
                progress={progressValue()} 
                color={isUrgent ? Colors.error.main : Colors.primary.main}
                style={styles.progressBar}
              />
            </Surface>
          </Animated.View>
        )}

        {/* Action Details */}
        <Surface style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Icon name="checkmark-circle-outline" size={32} color={Colors.primary.main} />
            <Text style={styles.actionTitle}>Your Action</Text>
          </View>
          <Text style={styles.actionName}>{activeCommitment.action?.title}</Text>
          <Text style={styles.actionDescription}>
            {activeCommitment.action?.description}
          </Text>

          <View style={styles.actionMeta}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.metaText}>
                {activeCommitment.action?.estimatedHours} hours
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.metaText}>
                {activeCommitment.action?.difficulty}
              </Text>
            </View>
          </View>
        </Surface>

        {/* What You Need to Do */}
        <Surface style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>What You Need to Do:</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Complete the service action: {activeCommitment.action?.title}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Take photos/videos as proof (with location)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Upload proof within 48 hours of relapse
              </Text>
            </View>
            {activeCommitment.requirePartnerVerification && (
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>4</Text>
                </View>
                <Text style={styles.instructionText}>
                  Wait for your partner to verify your proof
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Warning Card (if urgent or expired) */}
        {(isUrgent || isExpired) && (
          <Surface style={[styles.warningCard, isExpired && styles.errorCard]}>
            <Icon 
              name={isExpired ? "close-circle" : "alert-circle-outline"} 
              size={32} 
              color={isExpired ? Colors.error.main : Colors.warning.main} 
            />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, isExpired && styles.errorTitle]}>
                {isExpired ? 'Deadline Missed!' : 'Urgent!'}
              </Text>
              <Text style={[styles.warningText, isExpired && styles.errorText]}>
                {isExpired 
                  ? 'You failed to complete the action within 48 hours. Your commitment has ended.'
                  : 'Less than 6 hours remaining. Complete your action now!'
                }
              </Text>
            </View>
          </Surface>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isExpired ? (
            <>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('UploadProof')}
                style={[styles.button, styles.primaryButton]}
                icon="camera"
                contentStyle={styles.buttonContent}
              >
                Upload Proof Now
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('ActiveCommitmentDashboard')}
                style={styles.button}
              >
                View Commitment
              </Button>
            </>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DeadlineMissed')}
                style={[styles.button, styles.primaryButton]}
                contentStyle={styles.buttonContent}
              >
                View Options
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Home')}
                style={styles.button}
              >
                Go Home
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  timerCard: {
    marginBottom: 24,
  },
  timerSurface: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 4,
  },
  timerUrgent: {
    backgroundColor: Colors.error.light,
    borderWidth: 2,
    borderColor: Colors.error.main,
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerLabelUrgent: {
    color: Colors.error.main,
    fontWeight: 'bold',
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerUnit: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  timerValueUrgent: {
    color: Colors.error.main,
  },
  timerUnitLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  timerUnitLabelUrgent: {
    color: Colors.error.main,
  },
  timerSeparator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginHorizontal: 8,
  },
  timerSeparatorUrgent: {
    color: Colors.error.main,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    paddingTop: 6,
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.warning.light,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning.main,
  },
  errorCard: {
    backgroundColor: Colors.error.light,
    borderLeftColor: Colors.error.main,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.warning.dark,
    marginBottom: 4,
  },
  errorTitle: {
    color: Colors.error.main,
  },
  warningText: {
    fontSize: 14,
    color: Colors.warning.dark,
    lineHeight: 20,
  },
  errorText: {
    color: Colors.error.main,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ActionPendingScreen;
