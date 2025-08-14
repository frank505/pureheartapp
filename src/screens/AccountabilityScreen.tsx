/**
 * AccountabilityScreen Component
 * 
 * This screen implements the accountability partner feature as shown in the design.
 * Features include:
 * - Partner profile display
 * - Daily check-in with mood slider
 * - Quick action buttons (Check-in, SOS, Prayer Request, Share Victory)
 * - Emergency contact access
 * 
 * The design focuses on spiritual accountability and support between partners.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Text, Surface, Button, ProgressBar, Portal, Modal, TextInput, RadioButton, Checkbox, Chip } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import PartnerGroupSelector from '../components/PartnerGroupSelector';
import { Colors, Icons } from '../constants';
import groupService, { GroupSummary } from '../services/groupService';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCheckIns,
  createCheckIn,
  resetCheckinStatus,
} from '../store/slices/checkinsSlice';
import { fetchPartners, generateInvitationHash, acceptByCode, sendInvitesByEmail, fetchGroups } from '../store/slices/invitationSlice';
import { getStreaks } from '../store/slices/streaksSlice';
import VictoryStories from '../components/VictoryStories';
// import InvitationService from '../services/invitationService';

/**
 * AccountabilityScreen Component
 * 
 * Main accountability partner screen with all features
 */
interface AccountabilityScreenProps {
  navigation?: any;
  route?: any;
}

const AccountabilityScreen: React.FC<AccountabilityScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  // State for daily check-in mood slider
  const [moodValue, setMoodValue] = useState(0.75); // 75% = "doing well"
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [visibilityOption, setVisibilityOption] = useState<'private' | 'allPartners' | 'selectPartners' | 'group'>('private');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const dispatch = useAppDispatch();
  const { items: checkins, isLoading, isCreating } = useAppSelector((s) => s.checkins);
  const { connectedPartners, groups } = useAppSelector((s) => s.invitation);
  const { streaks } = useAppSelector((s) => s.streaks);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const invitationLoading = useAppSelector((s) => s.invitation.loading);

  const partnerChoices = (connectedPartners || []).map((p) => ({
    id: p.partner?.id ?? p.id,
    name: p.partner ? `${p.partner.firstName} ${p.partner.lastName}` : 'Partner',
  }));

  const todayISO = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = checkins.some((c) => new Date(c.createdAt).toISOString().slice(0, 10) === todayISO);

  /**
   * Handle daily check-in submission
   */
  const handleDailyCheckin = () => {
    // If not checked in today, open modal to create
    if (!hasCheckedInToday) {
      setCheckinVisible(true);
    } else if (navigation) {
      navigation.navigate('CheckInHistory');
    }
  };

  /**
   * Handle SOS (Emergency) action
   */
  const handleSOS = () => {
    Alert.alert(
      'Send SOS',
      'This will immediately notify your accountability partner and emergency contacts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'SOS Sent',
              'Your accountability partner and emergency contacts have been notified.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  /**
   * Handle prayer request
   */
  const handlePrayerRequest = () => {
    navigation?.navigate('PrayerRequests');
  };

  /**
   * Handle share victory
   */
  const handleShareVictory = () => {
    navigation?.navigate('CreateVictory');
  };

  /**
   * Handle invite partner
   */
  const [inviteVisible, setInviteVisible] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [customCode, setCustomCode] = useState('');
  // We no longer display generated invite; we store any generated code into the custom code field

  const [acceptVisible, setAcceptVisible] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [accepting, setAccepting] = useState(false);

  const handleInvitePartner = () => {
    setInviteVisible(true);
  };

  const handleEmailInputSubmit = () => {
    const newEmails = currentEmail.split(',')
      .map(email => email.trim())
      .filter(Boolean);

    if (newEmails.length === 0) return;

    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    newEmails.forEach(email => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (validEmails.length > 0) {
      setEmails(prevEmails => [...prevEmails, ...validEmails]);
    }

    if (invalidEmails.length > 0) {
      Alert.alert('Invalid or Duplicate Email', `The following emails could not be added: ${invalidEmails.join(', ')}`);
    }

    setCurrentEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleGenerateInvite = () => {
    const newHash = generateInvitationHash();
    setCustomCode(newHash);
  };

  const handleEmailSend = async () => {
    if (emails.length === 0) {
      Alert.alert('No emails', 'Add at least one email to send invitations.');
      return;
    }
    try {
      const payload = { emails, hash: customCode?.trim() || undefined } as any;
      await dispatch(sendInvitesByEmail(payload)).unwrap();
      Alert.alert('Invitations sent', 'Your invitations have been sent successfully.');
    } catch (e: any) {
      Alert.alert('Send failed', e?.message || 'Failed to send invitations.');
    }
  };

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

  /**
   * Handle emergency contact
   */
  const handleEmergencyContact = () => {
    Alert.alert(
      'Emergency Contact',
      'Calling emergency contact...',
      [{ text: 'Cancel' }, { text: 'Call', onPress: () => {} }]
    );
  };

  /**
   * Handle scripture sharing
   */
  const handleShareScripture = () => {
    Alert.alert(
      'Share Scripture',
      'Share an encouraging scripture with your partner.',
      [{ text: 'OK' }]
    );
  };

  // Community Groups integration
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const [groups, unread] = await Promise.all([
        groupService.listMyGroups({ page: 1, pageSize: 10 }),
        groupService.unreadCounts(),
      ]);
      setMyGroups(groups.items);
      const map: Record<string, number> = {};
      (unread.items || []).forEach((u: any) => { map[u.groupId] = u.unread; });
      setUnreadMap(map);
    } catch (e) {
      console.error('Failed to load groups', e);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    // Load check-ins to compute today's status and partners for selection
    dispatch(fetchCheckIns({ page: 1, limit: 50 }));
    dispatch(fetchPartners());
    dispatch(fetchGroups());
    dispatch(getStreaks());
  }, [loadGroups, dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(resetCheckinStatus());
      loadGroups();
      dispatch(fetchCheckIns({ page: 1, limit: 50 }));
      dispatch(fetchPartners());
      dispatch(fetchGroups());
      dispatch(getStreaks());
    }, [loadGroups, dispatch])
  );

  const submitCheckIn = async () => {
    try {
      const payload: any = {
        mood: Math.max(0, Math.min(1, moodValue)),
        note: note?.trim() || undefined,
      };
      if (visibilityOption === 'private') {
        payload.visibility = 'private';
      } else {
        payload.visibility = 'partner';
        if (visibilityOption === 'allPartners') {
          payload.partnerIds = partnerChoices.map((p) => p.id);
        } else if (visibilityOption === 'selectPartners') {
          payload.partnerIds = selectedPartnerIds;
        }
      }
      if (visibilityOption === 'group') {
        payload.visibility = 'group';
        payload.groupIds = selectedGroupIds;
      }
     
      await dispatch(createCheckIn(payload)).unwrap();
      setCheckinVisible(false);
      setNote('');
      setSelectedPartnerIds([]);
      setSelectedGroupIds([]);
      setVisibilityOption('private');
      await dispatch(fetchCheckIns({ page: 1, limit: 50 }));
      Alert.alert('Check-in created', 'Your daily check-in has been saved.');
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.message || 'Unable to create check-in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Accountability Partner</Text>
        <ProfileDropdown navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Partner Profile Section removed */}

        {/* Daily Check-In Section */}
        <Surface style={styles.checkInCard} elevation={2}>
          <Text style={styles.sectionTitle}>Daily Check-In</Text>
          <Text style={styles.checkInQuestion}>How's your heart today?</Text>
          
          {streaks && (
            <View style={styles.streaksContainer}>
              <Text>Current Streak: {streaks.currentStreak}</Text>
              <Text>Longest Streak: {streaks.longestStreak}</Text>
            </View>
          )}

          {/* Mood Slider */}
          <View style={styles.moodSlider}>
            <View style={styles.moodIndicators}>
              <View style={styles.moodIcon}>
                <Text style={styles.emoji}>😔</Text>
                <Text style={styles.moodLabel}>Struggling</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={moodValue}
                  color={Colors.primary.main}
                  style={styles.progressBar}
                />
              </View>
              
              <View style={styles.moodIcon}>
                <Text style={styles.emoji}>😊</Text>
                <Text style={styles.moodLabel}>Victorious</Text>
              </View>
            </View>
            
            <View style={styles.moodScale}>
              <Text style={styles.scaleNumber}>1</Text>
              <Text style={styles.scaleNumber}>10</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleDailyCheckin}
            style={styles.shareScriptureButton}
            contentStyle={styles.shareScriptureContent}
            labelStyle={styles.shareScriptureLabel}
            buttonColor={Colors.primary.main}
            loading={isCreating}
            disabled={isCreating}
          >
            {hasCheckedInToday ? 'View Check-ins' : 'Check in today'}
          </Button>
        </Surface>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {/* Daily Check-in */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleDailyCheckin}
            >
              <Icon 
                name={Icons.communication.bell.name} 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Daily Check-in</Text>
            </TouchableOpacity>

            {/* Send SOS */}
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.sosButton]}
              onPress={handleSOS}
            >
              <Icon 
                name={Icons.status.warning.name} 
                color={Colors.white} 
                size="lg" 
              />
              <Text style={[styles.quickActionLabel, styles.sosLabel]}>Send SOS</Text>
            </TouchableOpacity>

            {/* Prayers */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation?.navigate('PrayerRequests')}
            >
              <Icon 
                name="list-outline" 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Prayers</Text>
            </TouchableOpacity>

            {/* Share Prayer */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation?.navigate('CreatePrayerRequest')}
            >
              <Icon 
                name="hand-right-outline" 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Prayer Request</Text>
            </TouchableOpacity>

            {/* Share Victory */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleShareVictory}
            >
              <Icon 
                name="trophy-outline" 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Share Victory</Text>
            </TouchableOpacity>

            {/* My Victories */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation?.navigate('MyVictories')}
            >
              <Icon
                name="medal-outline"
                color={Colors.text.primary}
                size="lg"
              />
              <Text style={styles.quickActionLabel}>My Victories</Text>
            </TouchableOpacity>

            {/* Invite Partner */}
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.inviteButton]}
              onPress={() => navigation?.navigate('InvitePartner')}
            >
              <Icon 
                name="person-add-outline" 
                color={Colors.white} 
                size="lg" 
              />
              <Text style={[styles.quickActionLabel, styles.inviteLabel]}>Invite Partner</Text>
            </TouchableOpacity>

            {/* Accept Invitation */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setAcceptVisible(true)}
            >
              <Icon 
                name={Icons.security.key.name}
                color={Colors.text.primary}
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Accept Invitation</Text>
            </TouchableOpacity>

            {/* Manage Partners */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation?.navigate('PartnersList')}
            >
              <Icon 
                name="people-outline" 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>Manage Partners</Text>
            </TouchableOpacity>

            {/* AI Accountability (coming soon) */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Coming soon', 'AI Accountability is coming soon.')} 
            >
              <Icon 
                name="bulb-outline" 
                color={Colors.text.primary} 
                size="lg" 
              />
              <Text style={styles.quickActionLabel}>AI Accountability</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Groups Section */}
        <View style={styles.communitySection}>
          <View style={[styles.sectionHeader, isSmall && styles.sectionHeaderSmall]}>
            <Text style={[styles.sectionTitle, isSmall && styles.sectionTitleSmall]}>Community Groups</Text>
            <View style={[styles.headerActionsRow, isSmall && styles.headerActionsRowSmall]}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation?.navigate('NewGroup')}
              >
                <Icon name="add-outline" color={Colors.white} size="sm" />
                <Text style={[styles.createButtonText, isSmall && styles.createButtonTextSmall]}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setJoinVisible(true)}
              >
                <Icon name={Icons.security.key.name} color={Colors.white} size="sm" />
                <Text style={[styles.createButtonText, isSmall && styles.createButtonTextSmall]}>Join by Code</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {loadingGroups ? (
            <Text style={{ color: Colors.text.secondary }}>Loading groups…</Text>
          ) : myGroups.length === 0 ? (
            <Text style={{ color: Colors.text.secondary }}>No groups yet. Join or create one.</Text>
          ) : (
            myGroups.map(g => (
              <TouchableOpacity key={g.id} onPress={() => navigation?.navigate('GroupChat', { groupId: g.id, groupName: g.name, memberCount: g.membersCount })}>
                <Surface style={styles.groupCard} elevation={1}>
                  <View style={styles.groupInfo}>
                    <View style={styles.groupAvatarContainer}>
                      <Image source={{ uri: g.iconUrl || 'https://placehold.co/96x96' }} style={styles.groupAvatar} />
                      <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.groupDetails}>
                      <Text style={styles.groupName}>{g.name}</Text>
                      <Text style={styles.groupMessage} numberOfLines={1}>{g.description || 'Tap to open chat'}</Text>
                    </View>
                    <Text style={styles.groupTime}>{unreadMap[g.id] ? `${unreadMap[g.id]} new` : ''}</Text>
                  </View>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Portal>
          {/* Modal: Daily Check-in */}
          <Modal visible={checkinVisible} onDismiss={() => setCheckinVisible(false)} contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}>
            <Text style={styles.sectionTitle}>Daily Check-In</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>Set your mood and choose who can see this.</Text>

            {/* Mood input slider 0..1 */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: Colors.text.secondary, marginBottom: 8 }}>Mood: {Math.round(moodValue * 100)}%</Text>
              <Slider
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={moodValue}
                onValueChange={setMoodValue}
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.background.tertiary}
                thumbTintColor={Colors.primary.main}
              />
            </View>

            {/* Visibility options */}
            <View style={styles.visibilityContainer}>
              <Chip
                selected={visibilityOption === 'private'}
                onPress={() => setVisibilityOption('private')}
                style={styles.chip}
              >
                Private
              </Chip>
              <Chip
                selected={visibilityOption === 'allPartners'}
                onPress={() => setVisibilityOption('allPartners')}
                style={styles.chip}
              >
                All Partners
              </Chip>
              <Chip
                selected={visibilityOption === 'selectPartners'}
                onPress={() => setVisibilityOption('selectPartners')}
                style={styles.chip}
              >
                Select Partners
              </Chip>
              <Chip
                selected={visibilityOption === 'group'}
                onPress={() => setVisibilityOption('group')}
                style={styles.chip}
              >
                Group
              </Chip>
            </View>

            {visibilityOption === 'selectPartners' && (
              <PartnerGroupSelector
                partners={connectedPartners}
                groups={[]}
                selectedPartners={selectedPartnerIds}
                selectedGroups={[]}
                onPartnerSelectionChange={setSelectedPartnerIds}
                onGroupSelectionChange={() => {}}
              />
            )}
            {visibilityOption === 'group' && (
              <PartnerGroupSelector
                partners={[]}
                groups={groups}
                selectedPartners={[]}
                selectedGroups={selectedGroupIds}
                onPartnerSelectionChange={() => {}}
                onGroupSelectionChange={setSelectedGroupIds}
              />
            )}

            {/* Note input */}
            <TextInput
              mode="outlined"
              value={note}
              onChangeText={setNote}
              placeholder="Add an optional note"
              multiline
              style={{ marginBottom: 12 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button mode="text" onPress={() => setCheckinVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={submitCheckIn} disabled={isCreating} loading={isCreating}>Save Check-in</Button>
            </View>
          </Modal>
          {/* Modal: Invite Partner */}
          <Modal
            visible={inviteVisible}
            onDismiss={() => {
              setInviteVisible(false);
              setCurrentEmail('');
              setEmails([]);
              setCustomCode('');
            }}
            contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}
          >
            <Text style={styles.sectionTitle}>Invite Accountability Partner</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>
              Add email addresses. A code will be generated and sent unless you specify a custom code below.
            </Text>

            {/* Chips */}
            {emails.length > 0 && (
              <View style={styles.chipContainer}>
                {emails.map((email, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    onClose={() => removeEmail(email)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {email}
                  </Chip>
                ))}
              </View>
            )}

            <TextInput
              mode="outlined"
              label="Add email(s)"
              placeholder="friend@example.com, partner@work.com"
              value={currentEmail}
              onChangeText={setCurrentEmail}
              onSubmitEditing={handleEmailInputSubmit}
              onBlur={handleEmailInputSubmit}
              style={styles.emailInput}
              autoCapitalize="none"
              keyboardType="email-address"
              right={
                currentEmail.trim() ? (
                  <TextInput.Icon
                    icon="plus"
                    onPress={handleEmailInputSubmit}
                  />
                ) : null
              }
            />

            <TextInput
              mode="outlined"
              value={customCode}
              onChangeText={setCustomCode}
              placeholder="Optional custom code (starts with ph_)"
              style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button
                mode="outlined"
                onPress={handleGenerateInvite}
                loading={invitationLoading}
                disabled={invitationLoading}
              >
                Generate Code
              </Button>
              <Button
                mode="contained"
                onPress={handleEmailSend}
                disabled={invitationLoading || emails.length === 0}
              >
                Invite Partners
              </Button>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button mode="text" onPress={() => { setInviteVisible(false); }}>Close</Button>
            </View>
          </Modal>

          {/* Modal: Accept Partner by Code */}
          {/* Keep accept-by-code modal accessible via a clear button elsewhere */}
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
          <Modal visible={joinVisible} onDismiss={() => setJoinVisible(false)} contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}>
            <Text style={styles.sectionTitle}>Join by Access Code</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>Enter the invite/access code you received via email</Text>
            <TextInput
              mode="outlined"
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Enter code"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button mode="text" onPress={() => { setJoinVisible(false); setJoinCode(''); }}>Cancel</Button>
              <Button
                mode="contained"
                onPress={async () => {
                  try {
                    await groupService.joinByCode(joinCode.trim());
                    setJoinVisible(false);
                    setJoinCode('');
                    await loadGroups();
                  } catch (e: any) {
                    Alert.alert('Join failed', e?.response?.data?.message || 'Invalid or expired code');
                  }
                }}
              >
                Join
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Victory Stories Section */}
        <VictoryStories navigation={navigation} />

        {/* Emergency Contact Section */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={handleEmergencyContact}
          >
            <Surface style={styles.emergencyCard} elevation={1}>
              <View style={styles.emergencyContent}>
                <View style={styles.emergencyIcon}>
                  <Icon 
                    name={Icons.communication.phone.name} 
                    color={Colors.error.main} 
                    size="lg" 
                  />
                </View>
                <View style={styles.emergencyDetails}>
                  <Text style={styles.emergencyTitle}>Call Emergency Contact</Text>
                </View>
              </View>
              <Icon 
                name="chevron-forward-outline" 
                color={Colors.text.secondary} 
                size="md" 
              />
            </Surface>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Partner Section removed

  // Daily Check-in Section
  checkInCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  checkInQuestion: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  moodSlider: {
    marginBottom: 24,
  },
  moodIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodIcon: {
    alignItems: 'center',
    width: 60,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.tertiary,
  },
  moodScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  scaleNumber: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  shareScriptureButton: {
    borderRadius: 8,
  },
  shareScriptureContent: {
    paddingVertical: 8,
  },
  shareScriptureLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Quick Actions Section
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    height: 96,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: Colors.error.main,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  sosLabel: {
    color: Colors.white,
  },
  inviteButton: {
    backgroundColor: Colors.primary.main,
  },
  inviteLabel: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Emergency Section
  emergencySection: {
    marginBottom: 24,
  },
  emergencyButton: {
    borderRadius: 12,
  },
  emergencyCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: `${Colors.error.main}20`, // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyDetails: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },

  // Community Section Styles
  communitySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderSmall: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
    marginLeft: 12,
  },
  headerActionsRowSmall: {
    flexWrap: 'wrap',
    rowGap: 8,
    maxWidth: '60%',
    marginTop: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  createButtonTextSmall: {
    fontSize: 11,
   },
  sectionTitleSmall: {
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: `${Colors.primary.main}10`,
    borderColor: Colors.primary.main,
  },
  chipText: {
    color: Colors.text.primary,
  },
  emailInput: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupAvatarContainer: {
    position: 'relative',
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: Colors.background.secondary,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  groupMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  groupTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  radioOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visibilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
});

export default AccountabilityScreen;