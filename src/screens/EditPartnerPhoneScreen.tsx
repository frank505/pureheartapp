/**
 * EditPartnerPhoneScreen Component
 * 
 * Screen for editing a partner's phone number.
 * Features:
 * - Mobile number input with country code selection
 * - Validation and error handling
 * - Save/Cancel functionality
 * - Only allows editing partners the user added (not partners who added them)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface } from 'react-native-paper';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import MobileNumberInput from '../components/MobileNumberInput';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updatePartnerPhone } from '../store/slices/invitationSlice';
import partnerService from '../services/partnerService';

interface EditPartnerPhoneScreenProps {
  navigation?: any;
  route?: {
    params: {
      partner: {
        id: string;
        name: string;
        phoneNumber?: string | null;
        canEdit: boolean; // Indicates if this user can edit this partner's phone
      };
    };
  };
}

const EditPartnerPhoneScreen: React.FC<EditPartnerPhoneScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.invitation);
  
  const partner = route?.params?.partner;
  
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (partner?.phoneNumber) {
      setFullPhoneNumber(partner.phoneNumber);
    }
  }, [partner]);

  // Check if user can edit this partner
  useEffect(() => {
    if (!partner?.canEdit) {
      Alert.alert(
        'Cannot Edit',
        'You can only edit phone numbers for partners you invited, not partners who invited you.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    }
  }, [partner, navigation]);

  const handlePhoneChange = (value: string) => {
    setFullPhoneNumber(value);
    setError(''); // Clear error when user types
  };

  const handleSave = async () => {
    if (!partner) return;

    setError('');

    // Validate phone number
    const validation = partnerService.validatePhoneNumber(fullPhoneNumber);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid phone number');
      return;
    }

    try {
    const data =  await dispatch(
        updatePartnerPhone({
          partnerId: parseInt(partner.id),
          phoneNumber: fullPhoneNumber,
        })
      ).unwrap();
      

      Alert.alert(
        'Success',
        'Partner phone number updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update phone number. Please try again.'
      );
    }
  };

  const handleCancel = () => {
    navigation?.goBack();
  };

  const handleRemovePhone = () => {
    Alert.alert(
      'Remove Phone Number',
      'Are you sure you want to remove this partner\'s phone number?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                updatePartnerPhone({
                  partnerId: parseInt(partner?.id || '0'),
                  phoneNumber: '',
                })
              ).unwrap();

              Alert.alert(
                'Success',
                'Partner phone number removed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation?.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', 'Failed to remove phone number.');
            }
          },
        },
      ]
    );
  };

  if (!partner?.canEdit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Phone Number</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.content}>
          <Surface style={styles.errorCard} elevation={1}>
            <Icon name="information-circle-outline" color={Colors.warning.main} size="lg" />
            <Text style={styles.errorTitle}>Cannot Edit</Text>
            <Text style={styles.errorDescription}>
              You can only edit phone numbers for partners you invited, not partners who invited you.
            </Text>
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Phone Number</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Surface style={styles.partnerCard} elevation={1}>
            <View style={styles.partnerInfo}>
              <Icon name="person-outline" color={Colors.primary.main} size="lg" />
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>{partner?.name}</Text>
                <Text style={styles.partnerSubtitle}>Accountability Partner</Text>
              </View>
            </View>
          </Surface>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Mobile Number</Text>
            <Text style={styles.sectionDescription}>
              Add or update your partner's mobile number for emergency contact.
            </Text>

            <MobileNumberInput
              value={fullPhoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="Enter mobile number"
              error={error}
              style={styles.phoneInput}
            />

            {partner?.phoneNumber && (
              <View style={styles.currentPhoneSection}>
                <Text style={styles.currentPhoneLabel}>Current Number:</Text>
                <Text style={styles.currentPhoneNumber}>
                  {partnerService.formatPhoneNumber(partner.phoneNumber)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {partner?.phoneNumber && (
            <Button
              mode="outlined"
              onPress={handleRemovePhone}
              style={[styles.footerButton, styles.removeButton]}
              labelStyle={styles.removeButtonLabel}
              icon="trash-outline"
            >
              Remove Number
            </Button>
          )}
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={[styles.footerButton, styles.cancelButton]}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.footerButton, styles.saveButton]}
              loading={loading}
              disabled={loading || !fullPhoneNumber.trim()}
            >
              Save
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  partnerCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  partnerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  formSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  phoneInput: {
    marginBottom: 16,
  },
  currentPhoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentPhoneLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  currentPhoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: Colors.border.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
  },
  removeButton: {
    marginBottom: 12,
    borderColor: Colors.error.main,
  },
  removeButtonLabel: {
    color: Colors.error.main,
  },
  
  // Error state styles
  errorCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EditPartnerPhoneScreen;
