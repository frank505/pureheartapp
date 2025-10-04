import React from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';
import { useAppSelector } from '../../store/hooks';

const ProofSubmittedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const activeCommitment = useAppSelector((state) => state.commitments.activeCommitment);
  const currentProof = useAppSelector((state) => state.commitments.currentProof);

  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successIcon,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Icon name="checkmark-circle" size={100} color={Colors.primary.main} />
          </View>
        </Animated.View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Proof Submitted!</Text>
          <Text style={styles.subtitle}>
            Your proof has been successfully submitted
          </Text>
        </View>

        {/* Status Card */}
        <Surface style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="hourglass-outline" size={32} color={Colors.primary.main} />
            <Text style={styles.statusTitle}>Awaiting Verification</Text>
          </View>
          <Text style={styles.statusDescription}>
            {activeCommitment?.requirePartnerVerification
              ? 'Your accountability partner will review your proof and verify that you completed the action.'
              : 'Your proof will be automatically accepted since you did not require partner verification.'}
          </Text>
        </Surface>

        {/* What Happens Next */}
        <Surface style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What Happens Next?</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.primary.main }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {activeCommitment?.requirePartnerVerification
                    ? 'Partner Reviews Proof'
                    : 'Automatic Acceptance'}
                </Text>
                <Text style={styles.stepDescription}>
                  {activeCommitment?.requirePartnerVerification
                    ? 'Your partner will review your photos, location, and description'
                    : 'Your proof will be automatically accepted'}
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.secondary.main }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Verification Decision</Text>
                <Text style={styles.stepDescription}>
                  {activeCommitment?.requirePartnerVerification
                    ? 'Partner approves or rejects with detailed feedback'
                    : 'Your action is marked as completed'}
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.warning.main }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Continue Your Journey</Text>
                <Text style={styles.stepDescription}>
                  Once verified, you can continue working toward your commitment goal
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Proof Summary */}
        {currentProof && (
          <Surface style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Submission</Text>
            <View style={styles.summaryItem}>
              <Icon name="calendar-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.summaryText}>
                Submitted: {new Date(currentProof.submittedAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Icon name="image-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.summaryText}>
                {currentProof.mediaUrl ? 1 : 0} photo(s)/video(s)
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Icon name="location-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.summaryText}>Location verified</Text>
            </View>
          </Surface>
        )}

        {/* Notification Info */}
        <Surface style={styles.notificationCard}>
          <Icon name="notifications-outline" size={32} color={Colors.primary.main} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>We'll Notify You</Text>
            <Text style={styles.notificationText}>
              You'll receive a push notification when your proof is verified
            </Text>
          </View>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ActiveCommitmentDashboard' as any)}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            icon="home-outline"
          >
            Back to Dashboard
          </Button>
          {activeCommitment?.requirePartnerVerification && (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('PartnerVerification' as any)}
              style={styles.button}
            >
              Check Verification Status
            </Button>
          )}
          <Button
            mode="text"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
          >
            Go Home
          </Button>
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
  successIcon: {
    alignItems: 'center',
    marginVertical: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  nextStepsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.primary.light + '15',
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ProofSubmittedScreen;
