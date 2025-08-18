/**
 * EmergencyPartnerSelectModal Component
 * 
 * Modal for selecting a partner to call in emergency situations.
 * Features:
 * - List of partners with phone numbers
 * - Option to add phone number for partners without one
 * - Direct calling functionality
 * - Emergency-focused UI design
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Modal, Text, Surface, Button, ActivityIndicator } from 'react-native-paper';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getPartnersWithPhones } from '../store/slices/invitationSlice';
import partnerService from '../services/partnerService';

interface EmergencyPartnerSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  navigation?: any;
}

interface PartnerWithCallInfo {
  id: string;
  name: string;
  phoneNumber: string | null;
  canEdit: boolean; // Whether the user can edit this partner's phone number
  since: string;
}

const EmergencyPartnerSelectModal: React.FC<EmergencyPartnerSelectModalProps> = ({
  visible,
  onDismiss,
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const { connectedPartners, loading } = useAppSelector((state) => state.invitation);
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [partners, setPartners] = useState<PartnerWithCallInfo[]>([]);

  useEffect(() => {
    if (visible) {
      loadPartners();
    }
  }, [visible]);

  useEffect(() => {
    // Transform connected partners into call-ready format
    const transformedPartners: PartnerWithCallInfo[] = connectedPartners.map((partner) => {
      const name = partner.partner 
        ? `${partner.partner.firstName} ${partner.partner.lastName}`.trim()
        : 'Unknown Partner';
      
      // Determine if user can edit this partner's phone number
      // User can edit if they are the one who sent the invitation (they are userId, not receiverId)
      const canEdit = true; // For now, allowing all partners to be edited - backend will enforce

      return {
        id: partner.id,
        name,
        phoneNumber: partner.phoneNumber || null,
        canEdit,
        since: partner.since,
      };
    });

    setPartners(transformedPartners);
  }, [connectedPartners, currentUser]);

  const loadPartners = async () => {
    try {
      await dispatch(getPartnersWithPhones()).unwrap();
    } catch (error) {
      console.error('Failed to load partners:', error);
    }
  };

  const handleCall = (partner: PartnerWithCallInfo) => {
    if (!partner.phoneNumber) {
      handleAddPhoneNumber(partner);
      return;
    }

    Alert.alert(
      'Emergency Call',
      `Call ${partner.name} at ${partnerService.formatPhoneNumber(partner.phoneNumber)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => makePhoneCall(partner),
        },
      ]
    );
  };

  const makePhoneCall = async (partner: PartnerWithCallInfo) => {
    if (!partner.phoneNumber) return;

    try {
      const phoneUrl = `tel:${partner.phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        onDismiss(); // Close modal after initiating call
      } else {
        Alert.alert(
          'Unable to Call',
          'Your device cannot make phone calls. Please contact your partner through another method.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Call Failed',
        'Unable to initiate the call. Please try again or contact your partner through another method.'
      );
    }
  };

  const handleAddPhoneNumber = (partner: PartnerWithCallInfo) => {
    Alert.alert(
      'No Phone Number',
      `${partner.name} doesn't have a phone number saved. Would you like to add one?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Number',
          onPress: () => {
            onDismiss();
            // Navigate to edit phone screen
            navigation?.navigate('EditPartnerPhone', {
              partner: {
                id: partner.id,
                name: partner.name,
                phoneNumber: partner.phoneNumber,
                canEdit: partner.canEdit,
              },
            });
          },
        },
      ]
    );
  };

  const renderPartnerItem = ({ item }: { item: PartnerWithCallInfo }) => (
    <TouchableOpacity
      style={styles.partnerItem}
      onPress={() => handleCall(item)}
      activeOpacity={0.7}
    >
      <View style={styles.partnerIcon}>
        <Icon name="person" color={Colors.primary.main} size="lg" />
      </View>
      
      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{item.name}</Text>
        {item.phoneNumber ? (
          <Text style={styles.partnerPhone}>
            {partnerService.formatPhoneNumber(item.phoneNumber)}
          </Text>
        ) : (
          <Text style={styles.noPhone}>No phone number</Text>
        )}
      </View>

      <View style={styles.partnerAction}>
        {item.phoneNumber ? (
          <View style={[styles.actionButton, styles.callButton]}>
            <Icon name="call" color={Colors.white} size="md" />
          </View>
        ) : (
          <View style={[styles.actionButton, styles.addButton]}>
            <Icon name="add" color={Colors.primary.main} size="md" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" color={Colors.text.secondary} size="xl" />
      <Text style={styles.emptyTitle}>No Partners Found</Text>
      <Text style={styles.emptyDescription}>
        You need to connect with accountability partners first to use this emergency feature.
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          onDismiss();
          navigation?.navigate('AccountabilityScreen');
        }}
        style={styles.emptyButton}
      >
        Add Partners
      </Button>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <Surface style={styles.modalContent} elevation={5}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon name="call" color={Colors.error.main} size="lg" />
          </View>
          <Text style={styles.title}>Call My Brother</Text>
          <Text style={styles.subtitle}>Select a partner to call for emergency support</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Icon name="close" color={Colors.text.primary} size="md" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.main} />
              <Text style={styles.loadingText}>Loading partners...</Text>
            </View>
          ) : partners.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={partners}
              renderItem={renderPartnerItem}
              keyExtractor={(item) => item.id}
              style={styles.partnersList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.partnersListContent}
            />
          )}
        </View>

        {/* Footer */}
        {partners.length > 0 && (
          <View style={styles.footer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        )}
      </Surface>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },

  // Header
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    position: 'relative',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.error.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },

  // Content
  content: {
    flex: 1,
    minHeight: 200,
  },
  partnersList: {
    flex: 1,
  },
  partnersListContent: {
    padding: 16,
  },

  // Partner Item
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  partnerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  partnerPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  noPhone: {
    fontSize: 14,
    color: Colors.warning.main,
    fontStyle: 'italic',
  },
  partnerAction: {
    marginLeft: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: Colors.secondary.main, // Using secondary for success/call action
  },
  addButton: {
    backgroundColor: `${Colors.primary.main}20`,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyButton: {
    borderRadius: 8,
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  cancelButton: {
    borderRadius: 8,
  },
});

export default EmergencyPartnerSelectModal;
