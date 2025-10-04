/**
 * Set Target Date & Partner Screen
 * 
 * Fourth screen in the action commitment flow.
 * User sets target clean date and selects accountability partner.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { Text, Surface, Button, Switch, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ScreenHeader, Icon } from '../../components';
import PartnerGroupSelector from '../../components/PartnerGroupSelector';
import { Colors } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPartners } from '../../store/slices/invitationSlice';

type Props = NativeStackScreenProps<any, 'SetTargetDate'>;

const SetTargetDateScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const selectedAction = useAppSelector((state) => state.commitments.selectedAction);
  const partners = useAppSelector((state) => state.invitation.connectedPartners);

  const [targetDate, setTargetDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default 30 days from now
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | number | null>(null);
  const [requirePartnerVerification, setRequirePartnerVerification] = useState(true);
  const [allowPublicShare, setAllowPublicShare] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  useEffect(() => {
    // Fetch partners on mount
    dispatch(fetchPartners());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select first partner if available
    if (partners.length > 0 && !selectedPartnerId && partners[0].partner) {
      setSelectedPartnerId(partners[0].partner.id);
    }
  }, [partners, selectedPartnerId]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setTargetDate(date);
    }
  };

  const handleContinue = () => {
    // Validate inputs
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);

    if (targetDate < minDate) {
      Alert.alert('Invalid Date', 'Target date must be at least 1 day in the future.');
      return;
    }

    if (targetDate > maxDate) {
      Alert.alert('Invalid Date', 'Target date cannot be more than 90 days in the future.');
      return;
    }

    if (!selectedPartnerId && requirePartnerVerification) {
      Alert.alert(
        'Partner Required',
        'Please select an accountability partner or disable partner verification.'
      );
      return;
    }

    // Navigate to review screen with commitment data
    navigation.navigate('ReviewCommitment', {
      commitmentData: {
        actionId: selectedAction?.id,
        targetDate: targetDate.toISOString(),
        partnerId: selectedPartnerId,
        requirePartnerVerification,
        allowPublicShare,
      },
    });
  };

  const selectedPartner = partners.find((p) => p.partner && p.partner.id === selectedPartnerId);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilTarget = (): number => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Set Target Date"
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
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>Step 4 of 5</Text>
          </View>

          {/* Target Date Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Stay Clean Until</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Choose a target date to stay clean. You can set a goal between 1 and 90 days from now.
            </Text>

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
              icon="calendar-outline"
            >
              {formatDate(targetDate)}
            </Button>

            <View style={styles.daysCountContainer}>
              <Icon name="flag" size={20} color={Colors.primary.main} />
              <Text style={styles.daysCountText}>
                {getDaysUntilTarget()} days from now
              </Text>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={targetDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
              />
            )}
          </Surface>

          {/* Partner Selection Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="people" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Accountability Partner</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Choose a partner who will verify your action completion if you relapse.
            </Text>

            {partners.length > 0 ? (
              <>
                <Button
                  mode="outlined"
                  onPress={() => setShowPartnerModal(true)}
                  style={styles.partnerButton}
                  contentStyle={styles.partnerButtonContent}
                  icon="person-outline"
                >
                  {selectedPartner
                    ? selectedPartner.partner?.username || 'Partner'
                    : 'Select Partner'}
                </Button>

                {selectedPartner && (
                  <View style={styles.partnerInfo}>
                    <Icon name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.partnerInfoText}>
                      {selectedPartner.partner?.username || 'Partner'} will verify your proof
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noPartnersContainer}>
                <Icon name="alert-circle-outline" size={48} color={Colors.text.secondary} />
                <Text style={styles.noPartnersTitle}>No Partners Yet</Text>
                <Text style={styles.noPartnersText}>
                  You need an accountability partner to use this feature.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Hub')}
                  style={styles.addPartnerButton}
                >
                  Add Partner
                </Button>
              </View>
            )}
          </Surface>

          {/* Verification Settings */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="shield-checkmark" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Verification Settings</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Require Partner Verification</Text>
                <Text style={styles.settingDescription}>
                  Your partner must approve your proof before it counts (Recommended)
                </Text>
              </View>
              <Switch
                value={requirePartnerVerification}
                onValueChange={setRequirePartnerVerification}
                trackColor={{ false: '#767577', true: Colors.primary.light }}
                thumbColor={requirePartnerVerification ? Colors.primary.main : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Share Redemption Story</Text>
                <Text style={styles.settingDescription}>
                  Allow community to see your redemption story (anonymously)
                </Text>
              </View>
              <Switch
                value={allowPublicShare}
                onValueChange={setAllowPublicShare}
                trackColor={{ false: '#767577', true: Colors.primary.light }}
                thumbColor={allowPublicShare ? Colors.primary.main : '#f4f3f4'}
              />
            </View>
          </Surface>

          {/* Continue Button */}
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonLabel}
            disabled={partners.length === 0}
          >
            Continue to Review
          </Button>
        </ScrollView>

        {/* Partner Selection Modal */}
        <Portal>
          <Modal
            visible={showPartnerModal}
            onDismiss={() => setShowPartnerModal(false)}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Accountability Partner</Text>
              <Button onPress={() => setShowPartnerModal(false)}>Done</Button>
            </View>

            <ScrollView style={styles.partnerList}>
              {partners.filter(p => p.partner).map((partnerRel) => (
                <Button
                  key={partnerRel.partner!.id}
                  mode={
                    selectedPartnerId === partnerRel.partner!.id ? 'contained' : 'outlined'
                  }
                  onPress={() => {
                    setSelectedPartnerId(partnerRel.partner!.id);
                    setShowPartnerModal(false);
                  }}
                  style={styles.partnerListItem}
                  contentStyle={styles.partnerListItemContent}
                  icon="person"
                >
                  {partnerRel.partner!.username || `Partner ${partnerRel.partner!.id}`}
                </Button>
              ))}
            </ScrollView>
          </Modal>
        </Portal>
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
  section: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  dateButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  dateButtonContent: {
    paddingVertical: 8,
  },
  daysCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primary.light,
    borderRadius: 12,
  },
  daysCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  partnerButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  partnerButtonContent: {
    paddingVertical: 8,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
  },
  partnerInfoText: {
    fontSize: 14,
    color: '#10b981',
    flex: 1,
  },
  noPartnersContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noPartnersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  noPartnersText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  addPartnerButton: {
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  continueButton: {
    borderRadius: 12,
    elevation: 2,
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  continueButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: Colors.background.secondary,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  partnerList: {
    padding: 16,
  },
  partnerListItem: {
    marginBottom: 12,
    borderRadius: 12,
  },
  partnerListItemContent: {
    paddingVertical: 8,
  },
});

export default SetTargetDateScreen;
