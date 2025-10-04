import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Modal, TextInput, Button, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, ScreenHeader } from '../components';
import { Colors, Icons } from '../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPartners, acceptByCode } from '../store/slices/invitationSlice';
import { getUserType } from '../utils/userTypeUtils';

const HubScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const onboardingUserType = useAppSelector((s) => s.onboarding.userType);
  
  const isSmall = false; // You can implement responsive design logic here if needed
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [asyncStorageUserType, setAsyncStorageUserType] = useState<'partner' | 'user' | null>(null);

  // Load user type from AsyncStorage on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadUserType = async () => {
        const userType = await getUserType();
        console.log('[HubScreen] Loaded user type from AsyncStorage:', userType);
        setAsyncStorageUserType(userType);
      };
      loadUserType();
    }, [])
  );
  
  // Also reload when Redux state changes (from toggle)
  useEffect(() => {
    const loadUserType = async () => {
      const userType = await getUserType();
      console.log('[HubScreen] Redux changed, reloading from AsyncStorage:', userType);
      setAsyncStorageUserType(userType);
    };
    loadUserType();
  }, [currentUser?.userType, onboardingUserType]);

  // Determine if user is a partner/accountability buddy
  // Priority: 1) AsyncStorage (most reliable), 2) currentUser.userType, 3) onboarding store
  const isPartner = asyncStorageUserType === 'partner' || 
                    (!asyncStorageUserType && currentUser?.userType === 'partner') ||
                    (!asyncStorageUserType && !currentUser?.userType && onboardingUserType === 'partner');
  
  // Debug log to track isPartner changes
  useEffect(() => {
    console.log('[HubScreen] isPartner changed to:', isPartner, '{ asyncStorage:', asyncStorageUserType, 'redux:', currentUser?.userType, 'onboarding:', onboardingUserType, '}');
  }, [isPartner, asyncStorageUserType, currentUser?.userType, onboardingUserType]);

  const handleAcceptPartner = async () => {
    const code = partnerCode.trim();
    if (!code) return;
    try {
      setAccepting(true);
      await dispatch(acceptByCode(code)).unwrap();
      setAcceptVisible(false);
      setPartnerCode('');
      await dispatch(fetchPartners());
      Alert.alert('Connected', 'You are now connected as accountability partners.');
    } catch (e: any) {
      Alert.alert('Join failed', e?.message || 'Invalid or expired code');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Hub" navigation={navigation} showBackButton={false} />
      <ScrollView>
        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="flash" color={Colors.primary.main} size="md" />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
          </View>
          <View style={styles.quickActionsGrid}>
            {[
              // Partner-related actions - hidden for partners
              ...(!isPartner ? [
                { 
                  icon: 'person-add-outline', 
                  label: 'Invite Partner', 
                  onPress: () => navigation?.navigate('InvitePartner'),
                  color: Colors.primary.main,
                  special: 'invite'
                },
                { 
                  icon: 'people-outline', 
                  label: 'Partners', 
                  onPress: () => navigation?.navigate('PartnersList'),
                  color: Colors.secondary.main
                },
                { 
                  icon: Icons.security.key.name, 
                  label: 'Accept Partner Invite Code',
                  onPress: () => setAcceptVisible(true),
                  color: Colors.primary.dark
                },
              ] : []),
              // Commitment System Actions - NEW
              ...(!isPartner ? [
                { 
                  icon: 'shield-checkmark-outline', 
                  label: 'Create Commitment', 
                  onPress: () => navigation?.navigate('ChooseCommitmentType'),
                  color: Colors.primary.main,
                  special: 'commitment'
                },
                { 
                  icon: 'trending-up-outline', 
                  label: 'My Commitment', 
                  onPress: () => navigation?.navigate('ActiveCommitmentDashboard'),
                  color: Colors.secondary.main
                },
              ] : []),
               {
                  icon: 'hourglass-outline',
                  label: 'Fasting (Partners)',
                  onPress: () => navigation?.navigate('PartnerFastingHub'),
                  color: Colors.secondary.main
                },
              // Common actions - visible for all users
              { 
                icon: 'list-outline', 
                label: 'Prayer Requests', 
                onPress: () => navigation?.navigate('PrayerRequests'),
                color: Colors.primary.light
              },
              { 
                icon: 'hand-right-outline', 
                label: 'Ask for Prayer', 
                onPress: () => navigation?.navigate('CreatePrayerRequest'),
                color: Colors.warning.main
              },
              {
                icon: 'alert-circle-outline',
                label: 'Panic History',
                onPress: () => navigation?.navigate('PanicHistory'),
                color: Colors.error.main
              },
                 ...(!isPartner ? [
              { 
                icon: 'stats-chart-outline', 
                label: 'Analytics', 
                onPress: () => navigation?.navigate('Analytics'),
                color: Colors.secondary.main
               },
               { 
                icon: 'book-outline', 
                label: 'Truth Center', 
                onPress: () => navigation?.navigate('Truth', { screen: 'TruthList' }),
                color: Colors.primary.dark
              }
                 ] : []),
              { 
                icon: 'camera-outline', 
                label: 'Screenshots & Reports', 
                onPress: () => navigation?.navigate('ScreenshotsMain'),
                color: Colors.warning.dark
              },
              
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[
                  styles.quickActionItem,
                  { 
                    backgroundColor: (action.special === 'invite' || action.special === 'commitment') 
                      ? Colors.primary.main 
                      : 'rgba(255,255,255,0.12)' 
                  }
                ]}
                onPress={action.onPress}
                activeOpacity={0.9}
              >
                <Icon
                  name={action.icon}
                  color={(action.special === 'invite' || action.special === 'commitment') ? Colors.white : action.color}
                  size="md"
                />
                <Text
                  style={[
                    styles.quickActionLabel,
                    (action.special === 'invite' || action.special === 'commitment') && styles.inviteLabel
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Community Groups Section */}
        <View style={styles.communitySection}>
          <View style={[styles.sectionHeader, isSmall && styles.sectionHeaderSmall]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="people" color={Colors.primary.main} size="md" />
              <Text style={[styles.sectionTitle, isSmall && styles.sectionTitleSmall]}>Communities</Text>
            </View>
          </View>
          <Surface style={styles.contentCard}>
            <TouchableOpacity onPress={() => navigation?.navigate('NewGroup')} style={styles.communityOption}>
              <Icon name="add-circle-outline" color={Colors.primary.main} size="sm" />
              <Text style={styles.linkText}>New Community</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation?.navigate('AllGroups')} style={styles.communityOption}>
              <Icon name="list-outline" color={Colors.primary.main} size="sm" />
              <Text style={styles.linkText}>View All Communities</Text>
            </TouchableOpacity>
          </Surface>
        </View>

        {/* Victories Section */}
        <View style={styles.victoriesSection}>
          <View style={[styles.sectionHeader, isSmall && styles.sectionHeaderSmall]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="trophy" color={Colors.primary.main} size="md" />
              <Text style={[styles.sectionTitle, isSmall && styles.sectionTitleSmall]}>Victories</Text>
            </View>
          </View>
          <Surface style={styles.contentCard}>
            <TouchableOpacity onPress={() => navigation?.navigate('CreateVictory')} style={styles.communityOption}>
              <Icon name="trophy-outline" color={Colors.primary.main} size="sm" />
              <Text style={styles.linkText}>Share Victory</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation?.navigate('MyVictories')} style={styles.communityOption}>
              <Icon name="medal-outline" color={Colors.primary.main} size="sm" />
              <Text style={styles.linkText}>Victories in Christ</Text>
            </TouchableOpacity>
          </Surface>
        </View>
      </ScrollView>

      <Portal>
        {/* Modal: Accept Partner by Code */}
        <Modal
          visible={acceptVisible}
          onDismiss={() => { setAcceptVisible(false); setPartnerCode(''); }}
          contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}
        >
          <Text style={styles.sectionTitle}>Join as Partner by Code</Text>
          <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>Enter the code you received to become partners.</Text>
          <TextInput
            mode="outlined"
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="Enter invite code (e.g., ph_...)"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button mode="text" onPress={() => { setAcceptVisible(false); setPartnerCode(''); }}>Cancel</Button>
            <Button mode="contained" onPress={handleAcceptPartner} loading={accepting} disabled={accepting || !partnerCode.trim()}>
              Accept
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionHeaderSmall: {
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 4,
  },
  sectionTitleSmall: {
    fontSize: 16,
  },
  quickActionsSection: {
    marginVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionItem: {
    width: '48%',
    height: 96,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  inviteLabel: {
    color: Colors.white,
  },
  communitySection: {
    marginVertical: 16,
  },
  victoriesSection: {
    marginVertical: 16,
  },
  contentCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  communityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
    marginVertical: 12,
  },
});

export default HubScreen;
