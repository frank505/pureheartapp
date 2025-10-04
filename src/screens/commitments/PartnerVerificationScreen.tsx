import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyProof } from '../../store/slices/commitmentsSlice';

const PartnerVerificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const currentProof = useAppSelector((state) => state.commitments.currentProof);
  const user = useAppSelector((state) => state.user);
  const [decision, setDecision] = React.useState<'approved' | 'rejected' | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!currentProof || !decision) return;

    setSubmitting(true);
    try {
      await dispatch(
        verifyProof({
          commitmentId: currentProof.commitmentId,
          payload: {
            proofId: currentProof.id,
            approved: decision === 'approved',
            encouragementMessage: decision === 'approved' ? feedback.trim() : undefined,
            rejectionNotes: decision === 'rejected' ? feedback.trim() : undefined,
          },
        })
      ).unwrap();

      navigation.navigate('ProofSubmitted');
    } catch (error: any) {
      console.error('Verification failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentProof) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="alert-circle-outline" size={64} color={Colors.error.main} />
          <Text style={styles.errorText}>No proof to verify</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
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
          <Icon name="shield-checkmark-outline" size={64} color={Colors.primary.main} />
          <Text style={styles.title}>Verify Proof</Text>
          <Text style={styles.subtitle}>Review and verify your partner's service action</Text>
        </View>

        {/* Proof Info */}
        <Surface style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>Submitted by: {currentProof.userId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>
              {new Date(currentProof.submittedAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="time-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>
              Status: Awaiting Verification
            </Text>
          </View>
        </Surface>

        {/* Media Gallery */}
        <Surface style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Photos/Videos</Text>
          <View style={styles.mediaGrid}>
            {currentProof.mediaUrl && (
              <TouchableOpacity style={styles.mediaItem}>
                <Image source={{ uri: currentProof.mediaUrl }} style={styles.mediaImage} />
              </TouchableOpacity>
            )}
          </View>
        </Surface>

        {/* Description */}
        <Surface style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>Service action completed</Text>
        </Surface>

        {/* Location */}
        <Surface style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Icon name="location-outline" size={24} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Location Verified</Text>
          </View>
          <Text style={styles.locationCoords}>
            Location data available
          </Text>
        </Surface>

        {/* Verification Decision */}
        <Surface style={styles.decisionCard}>
          <Text style={styles.decisionTitle}>Your Decision</Text>
          <Text style={styles.decisionSubtitle}>
            Did your partner genuinely complete the service action?
          </Text>

          <View style={styles.decisionButtons}>
            <TouchableOpacity
              style={[
                styles.decisionButton,
                styles.approveButton,
                decision === 'approved' && styles.decisionButtonActive,
              ]}
              onPress={() => setDecision('approved')}
            >
              <Icon
                name="checkmark-circle"
                size={48}
                color={decision === 'approved' ? Colors.white : Colors.primary.main}
              />
              <Text
                style={[
                  styles.decisionButtonText,
                  decision === 'approved' && styles.decisionButtonTextActive,
                ]}
              >
                Approve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.decisionButton,
                styles.rejectButton,
                decision === 'rejected' && styles.decisionButtonActive,
              ]}
              onPress={() => setDecision('rejected')}
            >
              <Icon
                name="close-circle"
                size={48}
                color={decision === 'rejected' ? Colors.white : Colors.error.main}
              />
              <Text
                style={[
                  styles.decisionButtonText,
                  decision === 'rejected' && styles.decisionButtonTextActive,
                ]}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Feedback */}
        {decision && (
          <Surface style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>
              {decision === 'approved' ? 'Encouragement (Optional)' : 'Reason for Rejection'}
            </Text>
            <Text style={styles.feedbackSubtitle}>
              {decision === 'approved'
                ? 'Send an encouraging message to your partner'
                : 'Explain why you are rejecting this proof'}
            </Text>
            <TextInput
              mode="outlined"
              value={feedback}
              onChangeText={setFeedback}
              placeholder={
                decision === 'approved'
                  ? 'Great job! Keep up the good work...'
                  : 'Please provide more photos showing...'
              }
              multiline
              numberOfLines={4}
              style={styles.feedbackInput}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{feedback.length}/500</Text>
          </Surface>
        )}

        {/* Submit Button */}
        {decision && (
          <View style={styles.submitSection}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting || (decision === 'rejected' && !feedback.trim())}
              style={[
                styles.submitButton,
                decision === 'approved' ? styles.approveSubmitButton : styles.rejectSubmitButton,
              ]}
              contentStyle={styles.submitButtonContent}
            >
              {submitting
                ? 'Submitting...'
                : decision === 'approved'
                ? 'Approve Proof'
                : 'Reject Proof'}
            </Button>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        )}
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
  errorText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
  mediaCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  locationCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationCoords: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  decisionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  decisionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  decisionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  decisionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  approveButton: {
    backgroundColor: Colors.primary.light + '20',
    borderColor: Colors.primary.light,
  },
  rejectButton: {
    backgroundColor: Colors.error.light + '20',
    borderColor: Colors.error.light,
  },
  decisionButtonActive: {
    borderWidth: 3,
  },
  decisionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
  },
  decisionButtonTextActive: {
    color: Colors.white,
  },
  feedbackCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: Colors.background.primary,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
  submitSection: {
    gap: 12,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 8,
  },
  approveSubmitButton: {
    backgroundColor: Colors.primary.main,
  },
  rejectSubmitButton: {
    backgroundColor: Colors.error.main,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  cancelButton: {
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
    marginTop: 16,
  },
});

export default PartnerVerificationScreen;
