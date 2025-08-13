import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Portal, Modal, Divider } from 'react-native-paper';
import Icon from './Icon';
import { Colors, Icons, IconNames } from '../constants';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { hideShareModal } from '../store/slices/invitationSlice';
import InvitationService, { ShareOptions } from '../services/invitationService';

const sharingOptions = [
  { platform: 'whatsapp' as const, label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { platform: 'sms' as const, label: 'Text Message', icon: 'chatbubble-outline', color: Colors.primary.main },
  { platform: 'email' as const, label: 'Email', icon: 'mail-outline', color: Colors.secondary.main },
  { platform: 'twitter' as const, label: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
  { platform: 'facebook' as const, label: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
  { platform: 'instagram' as const, label: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
];

const ShareInvitationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shareModalVisible, invitationToShare } = useAppSelector(state => state.invitation);

  const handleShare = async (platform: ShareOptions['platform']) => {
    if (!invitationToShare) return;
    try {
      await InvitationService.shareInvitation(invitationToShare, { platform });
      dispatch(hideShareModal());
    } catch (error) {
      console.error('Error sharing invitation:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!invitationToShare) return;
    try {
      await InvitationService.copyInvitationUrl(invitationToShare);
      dispatch(hideShareModal());
    } catch (error) {
      console.error('Error copying invitation:', error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={shareModalVisible}
        onDismiss={() => dispatch(hideShareModal())}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Share Invitation</Text>
        <Text style={styles.modalSubtitle}>Choose how you'd like to share your invitation</Text>
        <View style={styles.shareOptions}>
          {sharingOptions.map((option) => (
            <TouchableOpacity key={option.platform} style={styles.shareOption} onPress={() => handleShare(option.platform)}>
              <View style={[styles.shareIconContainer, { backgroundColor: `${option.color}15` }]}>
                <Icon name={option.icon} color={option.color} size="lg" />
              </View>
              <Text style={styles.shareLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Divider style={styles.modalDivider} />
        <TouchableOpacity style={styles.copyOption} onPress={handleCopyLink}>
          <Icon name={IconNames.actions.copy} color={Colors.primary.main} size="md" />
          <Text style={styles.copyLabel}>Copy Link</Text>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
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

export default ShareInvitationModal;
