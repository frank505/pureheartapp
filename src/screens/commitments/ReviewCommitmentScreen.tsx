/**
 * Review Commitment Screen
 * 
 * Fifth screen in the action commitment flow.
 * Final review before creating the commitment.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenHeader, Icon } from '../../components';
import { Colors } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCommitment } from '../../store/slices/commitmentsSlice';

type Props = NativeStackScreenProps<any, 'ReviewCommitment'>;

const ReviewCommitmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const selectedAction = useAppSelector((state) => state.commitments.selectedAction);
  const partners = useAppSelector((state) => state.invitation.connectedPartners);
  const [creating, setCreating] = useState(false);

  const { commitmentData } = route.params as any;

  const selectedPartner = partners.find(
    (p) => p.partner && p.partner.id === commitmentData.partnerId
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = async () => {
    if (!selectedAction) {
      Alert.alert('Error', 'No action selected');
      return;
    }

    try {
      setCreating(true);

      await dispatch(
        createCommitment({
          commitmentType: 'ACTION',
          actionId: selectedAction.id,
          targetDate: commitmentData.targetDate,
          partnerId: commitmentData.partnerId,
          requirePartnerVerification: commitmentData.requirePartnerVerification,
          allowPublicShare: commitmentData.allowPublicShare,
        })
      ).unwrap();

      // Success! Navigate to success screen
      navigation.navigate('CommitmentSuccess');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to create commitment. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Review Commitment"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>Final Step</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Icon name="shield-checkmark" size={64} color={Colors.primary.main} />
            <Text style={styles.title}>Review Your Commitment</Text>
            <Text style={styles.subtitle}>
              Please review all details carefully before confirming. This commitment will become active immediately.
            </Text>
          </View>

          {/* Summary Card */}
          <Surface style={styles.summaryCard}>
            {/* Commitment Goal */}
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <Icon name="flag" size={20} color={Colors.primary.main} />
                <Text style={styles.summaryHeaderText}>Your Goal</Text>
              </View>
              <Text style={styles.summaryValue}>
                Stay clean until {formatDate(commitmentData.targetDate)}
              </Text>
            </View>

            {/* Action to Complete */}
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <Icon name="heart" size={20} color="#ef4444" />
                <Text style={styles.summaryHeaderText}>If You Relapse</Text>
              </View>
              <Text style={styles.summaryValue}>{selectedAction?.title}</Text>
              <View style={styles.actionDetails}>
                <View style={styles.actionDetailItem}>
                  <Icon name="time-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.actionDetailText}>
                    {selectedAction?.estimatedHours} hours
                  </Text>
                </View>
                <View style={styles.actionDetailItem}>
                  <Icon name="camera-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.actionDetailText}>Photo proof required</Text>
                </View>
              </View>
            </View>

            {/* Partner */}
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <Icon name="people" size={20} color={Colors.primary.main} />
                <Text style={styles.summaryHeaderText}>Accountability Partner</Text>
              </View>
              <Text style={styles.summaryValue}>
                {selectedPartner?.partner?.username || 'Partner'}
                {commitmentData.requirePartnerVerification && ' will verify'}
              </Text>
            </View>

            {/* Deadline */}
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <Icon name="alarm" size={20} color="#f59e0b" />
                <Text style={styles.summaryHeaderText}>Proof Deadline</Text>
              </View>
              <Text style={styles.summaryValue}>
                48 hours after reporting relapse
              </Text>
            </View>

            {/* Public Sharing */}
            {commitmentData.allowPublicShare && (
              <View style={styles.summarySection}>
                <View style={styles.summaryHeader}>
                  <Icon name="globe" size={20} color={Colors.primary.main} />
                  <Text style={styles.summaryHeaderText}>Public Sharing</Text>
                </View>
                <Text style={styles.summaryValue}>
                  Your redemption story will be shared anonymously with the community
                </Text>
              </View>
            )}
          </Surface>

          {/* Important Notes */}
          <Surface style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Icon name="information-circle" size={24} color="#f59e0b" />
              <Text style={styles.notesTitle}>Important</Text>
            </View>
            <View style={styles.notesList}>
              <View style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>
                  Once activated, this commitment cannot be canceled
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>
                  You must complete the action within 48 hours of reporting a relapse
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>
                  Your partner will be notified when you report a relapse
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>
                  Missing the deadline will impact your completion rate and streak
                </Text>
              </View>
            </View>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              contentStyle={styles.buttonContent}
              disabled={creating}
            >
              Go Back
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.confirmButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.confirmButtonLabel}
              loading={creating}
              disabled={creating}
            >
              I Commit to This
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border.primary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
  },
  progressText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 3,
  },
  summarySection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  actionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  actionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  notesCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fffbeb',
    marginBottom: 24,
    elevation: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f59e0b',
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    flexDirection: 'row',
    gap: 12,
  },
  noteBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
    width: 20,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  backButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.primary,
  },
  confirmButton: {
    borderRadius: 12,
    elevation: 3,
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  confirmButtonLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
});

export default ReviewCommitmentScreen;
