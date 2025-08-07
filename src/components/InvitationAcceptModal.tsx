/**
 * InvitationAcceptModal Component
 * 
 * This modal appears when a user opens the app via an invitation link.
 * It shows details about the invitation and allows the user to accept
 * or decline the trusted partner connection.
 * 
 * Features:
 * - Shows inviter information
 * - Displays invitation type and description
 * - Accept/Decline actions
 * - Beautiful UI with animations
 * - Integration with invitation service
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Portal,
  Modal,
  Button,
  Card,
} from 'react-native-paper';
import Icon from './Icon';
import { Colors, Icons } from '../constants';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  acceptInvitation, 
  clearProcessingInvitation,
  clearError 
} from '../store/slices/invitationSlice';
import InvitationService from '../services/invitationService';
import type { Invitation } from '../store/slices/invitationSlice';

/**
 * InvitationAcceptModal Component
 */
const InvitationAcceptModal: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { currentUser } = useAppSelector(state => state.user);
  const { 
    processingInvitation, 
    isProcessingDeepLink, 
    loading, 
    error 
  } = useAppSelector(state => state.invitation);

  /**
   * Handle Accept Invitation
   */
  const handleAccept = async () => {
    if (!processingInvitation || !currentUser) {
      Alert.alert('Error', 'Unable to process invitation. Please try again.');
      return;
    }

    try {
      await dispatch(acceptInvitation({
        invitationId: processingInvitation.id,
        userInfo: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
        },
      })).unwrap();

      // Show success message
      const invitationSummary = InvitationService.createInvitationSummary(processingInvitation);
      
      Alert.alert(
        'Connection Established! 🎉',
        `You are now connected with ${processingInvitation.inviterName} as a ${invitationSummary.title.toLowerCase()}.`,
        [
          {
            text: 'Great!',
            onPress: () => {
              dispatch(clearProcessingInvitation());
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'Unable to accept invitation. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handle Decline Invitation
   */
  const handleDecline = () => {
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            dispatch(clearProcessingInvitation());
            Alert.alert(
              'Invitation Declined',
              'You have declined the invitation.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  /**
   * Get invitation details for display
   */
  const getInvitationDetails = (invitation: Invitation) => {
    const summary = InvitationService.createInvitationSummary(invitation);
    return summary;
  };

  // Don't render if no invitation is being processed
  if (!processingInvitation) {
    return null;
  }

  const invitationDetails = getInvitationDetails(processingInvitation);

  return (
    <Portal>
      <Modal
        visible={!!processingInvitation}
        dismissable={false}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <View style={styles.iconContainer}>
            <Icon 
              name={invitationDetails.icon} 
              color={Colors.primary.main} 
              size="xl" 
            />
          </View>
          <Text style={styles.modalTitle}>Invitation Received!</Text>
          <Text style={styles.modalSubtitle}>
            You've been invited to connect with someone
          </Text>
        </View>

        <Card style={styles.invitationCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.inviterInfo}>
              <View style={styles.inviterAvatar}>
                <Icon 
                  name="person-circle-outline" 
                  color={Colors.primary.main} 
                  size="xl" 
                />
              </View>
              <View style={styles.inviterDetails}>
                <Text style={styles.inviterName}>{processingInvitation.inviterName}</Text>
                <Text style={styles.inviterEmail}>{processingInvitation.inviterEmail}</Text>
              </View>
            </View>

            <View style={styles.invitationDetails}>
              <Text style={styles.detailsTitle}>{invitationDetails.title}</Text>
              <Text style={styles.detailsDescription}>
                {invitationDetails.description}
              </Text>
              
              {processingInvitation.metadata?.message && (
                <View style={styles.customMessage}>
                  <Text style={styles.messageLabel}>Personal Message:</Text>
                  <Text style={styles.messageText}>
                    "{processingInvitation.metadata.message}"
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {error && (
          <View style={styles.errorContainer}>
            <Icon 
              name="alert-circle-outline" 
              color={Colors.error.main} 
              size="md" 
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleDecline}
            style={styles.declineButton}
            labelStyle={styles.declineButtonLabel}
            disabled={loading}
          >
            Decline
          </Button>
          
          <Button
            mode="contained"
            onPress={handleAccept}
            style={styles.acceptButton}
            labelStyle={styles.acceptButtonLabel}
            loading={loading}
            disabled={loading}
          >
            {invitationDetails.actionText}
          </Button>
        </View>

        <Text style={styles.footerText}>
          By accepting, you'll be connected and can support each other on your spiritual journey.
        </Text>
      </Modal>
    </Portal>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  invitationCard: {
    backgroundColor: Colors.background.primary,
    marginBottom: 20,
  },
  cardContent: {
    padding: 20,
  },
  inviterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inviterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary.main}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inviterDetails: {
    flex: 1,
  },
  inviterName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  inviterEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  invitationDetails: {
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  customMessage: {
    backgroundColor: `${Colors.primary.main}08`,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.error.main}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error.main,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  declineButton: {
    flex: 1,
    borderColor: Colors.border.primary,
  },
  declineButtonLabel: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
  },
  acceptButtonLabel: {
    color: Colors.white,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default InvitationAcceptModal;
