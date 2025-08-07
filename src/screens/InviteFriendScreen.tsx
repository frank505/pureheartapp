/**
 * InviteFriendScreen Component
 * 
 * This screen allows users to invite trusted contacts to join PureHeart.
 * Features include:
 * - Creating invitations with custom messages
 * - Selecting invitation type (accountability partner, trusted contact, prayer partner)
 * - Multiple sharing options (WhatsApp, SMS, Email, Social Media)
 * - Copy invitation link to clipboard
 * - Preview of invitation content
 * - Management of sent invitations
 * 
 * The screen integrates with the invitation service for sharing and the Redux store
 * for state management.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  TextInput,
  RadioButton,
  Chip,
  Card,
  Divider,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  createInvitation, 
  clearError,
  showShareModal,
  hideShareModal,
} from '../store/slices/invitationSlice';
import InvitationService, { ShareOptions } from '../services/invitationService';
import type { Invitation } from '../store/slices/invitationSlice';

/**
 * InviteFriendScreen Props Interface
 */
interface InviteFriendScreenProps {
  navigation?: any;
  route?: any;
}

/**
 * Invitation Type Options
 */
type InvitationType = 'accountability_partner' | 'trusted_contact' | 'prayer_partner';

/**
 * InviteFriendScreen Component
 * 
 * Main component for creating and sharing invitations.
 */
const InviteFriendScreen: React.FC<InviteFriendScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { currentUser } = useAppSelector(state => state.user);
  const { 
    loading, 
    error, 
    shareModalVisible, 
    invitationToShare,
    sentInvitations 
  } = useAppSelector(state => state.invitation);

  // Local state
  const [selectedType, setSelectedType] = useState<InvitationType>('accountability_partner');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null);

  /**
   * Clear error when component mounts
   */
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Invitation Type Options
   */
  const invitationTypes = [
    {
      value: 'accountability_partner' as InvitationType,
      label: 'Accountability Partner',
      description: 'Someone to support you in your spiritual journey',
      icon: 'people-outline',
      color: Colors.primary.main,
    },
    {
      value: 'trusted_contact' as InvitationType,
      label: 'Trusted Contact',
      description: 'Someone who can receive emergency alerts',
      icon: 'shield-outline',
      color: Colors.secondary.main,
    },
    {
      value: 'prayer_partner' as InvitationType,
      label: 'Prayer Partner',
      description: 'Someone to pray with and share prayer requests',
      icon: 'hand-right-outline',
      color: Colors.warning.main,
    },
  ];

  /**
   * Social Media Sharing Options
   */
  const sharingOptions = [
    {
      platform: 'whatsapp' as const,
      label: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
    },
    {
      platform: 'sms' as const,
      label: 'Text Message',
      icon: 'chatbubble-outline',
      color: Colors.primary.main,
    },
    {
      platform: 'email' as const,
      label: 'Email',
      icon: 'mail-outline',
      color: Colors.secondary.main,
    },
    {
      platform: 'twitter' as const,
      label: 'Twitter',
      icon: 'logo-twitter',
      color: '#1DA1F2',
    },
    {
      platform: 'facebook' as const,
      label: 'Facebook',
      icon: 'logo-facebook',
      color: '#4267B2',
    },
    {
      platform: 'instagram' as const,
      label: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
    },
  ];

  /**
   * Create Invitation
   * 
   * Creates a new invitation with the specified parameters.
   */
  const handleCreateInvitation = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to create invitations.');
      return;
    }

    try {
      const invitationData = {
        inviterName: currentUser.name,
        inviterEmail: currentUser.email,
        inviterUserId: currentUser.id,
        invitationType: selectedType,
        customMessage: customMessage.trim() || undefined,
        inviteeEmail: recipientEmail.trim() || undefined,
      };

      const invitation = await dispatch(createInvitation(invitationData)).unwrap();
      setCreatedInvitation(invitation);
      
      // Show share modal
      dispatch(showShareModal(invitation));
      
      Alert.alert(
        'Invitation Created!',
        'Your invitation has been created. Choose how you\'d like to share it.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating invitation:', error);
      // Error is handled by Redux and shown in UI
    }
  };

  /**
   * Share Invitation via Platform
   * 
   * Shares the invitation using the specified platform.
   */
  const handleShare = async (platform: ShareOptions['platform']) => {
    if (!invitationToShare) return;

    try {
      await InvitationService.shareInvitation(invitationToShare, {
        platform,
        customMessage,
      });
      
      // Close share modal after successful share
      dispatch(hideShareModal());
      
      // Navigate back or show success message
      Alert.alert(
        'Invitation Sent!',
        'Your invitation has been shared successfully.',
        [
          {
            text: 'Create Another',
            onPress: () => {
              setCustomMessage('');
              setRecipientEmail('');
              setCreatedInvitation(null);
            }
          },
          {
            text: 'Done',
            onPress: () => navigation?.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Error sharing invitation:', error);
    }
  };

  /**
   * Copy Invitation Link
   * 
   * Copies the invitation URL to clipboard.
   */
  const handleCopyLink = async () => {
    if (!invitationToShare) return;

    try {
      await InvitationService.copyInvitationUrl(invitationToShare);
      dispatch(hideShareModal());
    } catch (error) {
      console.error('Error copying invitation:', error);
    }
  };

  /**
   * Preview Invitation Content
   * 
   * Shows a preview of how the invitation will look when shared.
   */
  const handlePreview = () => {
    if (!createdInvitation) return;
    
    const previewMessage = InvitationService.generateInvitationMessage(
      createdInvitation,
      customMessage
    );
    
    Alert.alert(
      'Invitation Preview',
      previewMessage,
      [{ text: 'OK' }]
    );
  };

  /**
   * Get Selected Type Configuration
   */
  const selectedTypeConfig = invitationTypes.find(type => type.value === selectedType);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite a Friend</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invitation Type Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>What type of connection?</Text>
              <Text style={styles.sectionSubtitle}>
                Choose how you'd like to connect with this person
              </Text>
              
              <View style={styles.typeOptions}>
                {invitationTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      selectedType === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <RadioButton
                      value={type.value}
                      status={selectedType === type.value ? 'checked' : 'unchecked'}
                      onPress={() => setSelectedType(type.value)}
                      color={type.color}
                    />
                    <Icon 
                      name={type.icon} 
                      color={selectedType === type.value ? type.color : Colors.text.secondary} 
                      size="md" 
                    />
                    <View style={styles.typeInfo}>
                      <Text style={[
                        styles.typeLabel,
                        selectedType === type.value && styles.typeLabelSelected
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Custom Message */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Message (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                Add a personal note to your invitation
              </Text>
              
              <TextInput
                mode="outlined"
                placeholder={`Hi! I'd love to have you as my ${selectedTypeConfig?.label.toLowerCase()} on PureHeart...`}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
                numberOfLines={3}
                style={styles.messageInput}
                theme={{
                  colors: {
                    primary: Colors.primary.main,
                    outline: Colors.border.primary,
                  },
                }}
              />
            </Card.Content>
          </Card>

          {/* Recipient Email (Optional) */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Recipient Email (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                Pre-fill email address for easier sharing
              </Text>
              
              <TextInput
                mode="outlined"
                placeholder="friend@example.com"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.emailInput}
                theme={{
                  colors: {
                    primary: Colors.primary.main,
                    outline: Colors.border.primary,
                  },
                }}
              />
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {createdInvitation && (
              <Button
                mode="outlined"
                onPress={handlePreview}
                style={styles.previewButton}
                labelStyle={styles.buttonLabel}
              >
                Preview Message
              </Button>
            )}
            
            <Button
              mode="contained"
              onPress={handleCreateInvitation}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
              labelStyle={styles.buttonLabel}
              icon={() => (
                <Icon 
                  name={Icons.actions.send.name} 
                  color={Colors.white} 
                  size="sm" 
                />
              )}
            >
              {createdInvitation ? 'Update Invitation' : 'Create Invitation'}
            </Button>
          </View>

          {/* Error Display */}
          {error && (
            <Card style={[styles.card, styles.errorCard]}>
              <Card.Content>
                <View style={styles.errorContent}>
                  <Icon 
                    name={Icons.status.error.name} 
                    color={Colors.error.main} 
                    size="md" 
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Recent Invitations */}
          {sentInvitations.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Recent Invitations</Text>
                <Divider style={styles.divider} />
                
                {sentInvitations.slice(0, 3).map((invitation, index) => (
                  <View key={invitation.id} style={styles.recentInvitation}>
                    <View style={styles.invitationInfo}>
                      <Text style={styles.invitationEmail}>
                        {invitation.inviteeEmail || 'Email not provided'}
                      </Text>
                      <Text style={styles.invitationDate}>
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Chip
                      mode="outlined"
                      textStyle={styles.chipText}
                      style={[
                        styles.statusChip,
                        invitation.status === 'accepted' && styles.acceptedChip,
                        invitation.status === 'pending' && styles.pendingChip,
                      ]}
                    >
                      {invitation.status}
                    </Chip>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        {/* Share Modal */}
        <Portal>
          <Modal
            visible={shareModalVisible}
            onDismiss={() => dispatch(hideShareModal())}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Share Invitation</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you'd like to share your invitation
            </Text>

            <View style={styles.shareOptions}>
              {sharingOptions.map((option) => (
                <TouchableOpacity
                  key={option.platform}
                  style={styles.shareOption}
                  onPress={() => handleShare(option.platform)}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: `${option.color}15` }]}>
                    <Icon 
                      name={option.icon} 
                      color={option.color} 
                      size="lg" 
                    />
                  </View>
                  <Text style={styles.shareLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Divider style={styles.modalDivider} />

            <TouchableOpacity style={styles.copyOption} onPress={handleCopyLink}>
              <Icon 
                name={Icons.actions.copy.name} 
                color={Colors.primary.main} 
                size="md" 
              />
              <Text style={styles.copyLabel}>Copy Link</Text>
            </TouchableOpacity>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  typeOptions: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  typeOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: `${Colors.primary.main}10`,
  },
  typeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: Colors.primary.main,
  },
  typeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  messageInput: {
    backgroundColor: Colors.background.primary,
  },
  emailInput: {
    backgroundColor: Colors.background.primary,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  previewButton: {
    borderColor: Colors.primary.main,
  },
  createButton: {
    backgroundColor: Colors.primary.main,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: `${Colors.error.main}10`,
    borderColor: Colors.error.main,
    borderWidth: 1,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error.main,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: Colors.border.primary,
  },
  recentInvitation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  invitationDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusChip: {
    backgroundColor: Colors.background.primary,
  },
  chipText: {
    fontSize: 12,
  },
  acceptedChip: {
    backgroundColor: `${Colors.secondary.main}15`,
    borderColor: Colors.secondary.main,
  },
  pendingChip: {
    backgroundColor: `${Colors.warning.main}15`,
    borderColor: Colors.warning.main,
  },
  modalContent: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  shareOption: {
    alignItems: 'center',
    minWidth: 80,
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  modalDivider: {
    marginVertical: 20,
    backgroundColor: Colors.border.primary,
  },
  copyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: `${Colors.primary.main}10`,
    borderRadius: 8,
  },
  copyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.main,
  },
});

export default InviteFriendScreen;
