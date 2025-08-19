import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Modal, TextInput, Button, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenHeader } from '../components';
import { Colors, Icons } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch } from '../store/hooks';
import { fetchPartners, acceptByCode } from '../store/slices/invitationSlice';

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isSmall = false; // You can implement responsive design logic here if needed
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [accepting, setAccepting] = useState(false);
  const dispatch = useAppDispatch();

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
      <ScreenHeader title="Menu" iconName="menu-outline" navigation={navigation} />
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
                icon: 'trophy-outline', 
                label: 'Share Victory', 
                onPress: () => navigation?.navigate('CreateVictory'),
                color: Colors.primary.main
              },
              { 
                icon: 'medal-outline', 
                label: 'My Victories', 
                onPress: () => navigation?.navigate('MyVictories'),
                color: Colors.secondary.main
              },
              { 
                icon: 'book-outline', 
                label: 'Truth Center', 
                onPress: () => navigation?.navigate('Truth', { screen: 'TruthList' }),
                color: Colors.primary.dark
              },
            ].map((action, index) => (
              <TouchableOpacity
                key={action.label}
                style={[
                  styles.quickActionItem,
                  { backgroundColor: action.special === 'invite' ? Colors.primary.main : Colors.background.secondary }
                ]}
                onPress={action.onPress}
              >
                <Icon
                  name={action.icon}
                  color={action.special === 'invite' ? Colors.white : action.color}
                  size="md"
                />
                <Text
                  style={[
                    styles.quickActionLabel,
                    action.special === 'invite' && styles.inviteLabel
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
              <Text style={[styles.sectionTitle, isSmall && styles.sectionTitleSmall]}>Community Groups</Text>
            </View>
          </View>
          <Surface style={styles.contentCard}>
            <TouchableOpacity onPress={() => navigation?.navigate('AllGroups')}>
              <Text style={styles.linkText}>View All Community Groups</Text>
            </TouchableOpacity>
          </Surface>
        </View>

        {/* Overcomers Stories Section */}
        <View style={styles.storiesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="book" color={Colors.primary.main} size="md" />
              <Text style={styles.sectionTitle}>Overcomers Stories</Text>
            </View>
          </View>
          <Surface style={styles.contentCard}>
            <TouchableOpacity onPress={() => navigation?.navigate('MyVictories')}>
              <Text style={styles.linkText}>View Victory Stories</Text>
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
  storiesSection: {
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
});

export default MenuScreen;
