/**
 * ProfileSettingsScreen Component
 * 
 * Profile & Settings screen focused on personal information and account settings.
 * Subscription content moved to separate screen.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface ProfileSettingsScreenProps {
  navigation?: any;
  route?: any;
}

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleChangeInfo = (type: string) => {
    Alert.alert(
      `Change ${type}`,
      `Update your ${type.toLowerCase()}`,
      [{ text: 'Cancel' }, { text: 'Update', onPress: () => {} }]
    );
  };

  const handleAccountabilitySettings = () => {
    Alert.alert(
      'Accountability Settings',
      'Manage your accountability partners and reports',
      [{ text: 'OK' }]
    );
  };

  const handleAIAccountabilitySettings = () => {
    Alert.alert(
      'AI Accountability Partner',
      'Configure your AI accountability companion for 24/7 support and guidance',
      [
        { text: 'Cancel' },
        { text: 'Configure', onPress: () => {
          // Navigate to AI Companion screen
          if (navigation) {
            navigation.navigate('AICompanion');
          }
        }}
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Manage your notification preferences',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Manage your privacy preferences',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon 
            name={Icons.navigation.back.name} 
            color={Colors.text.primary} 
            size="md" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Surface style={styles.card} elevation={2}>
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>Ethan</Text>
              </View>
              <TouchableOpacity onPress={() => handleChangeInfo('Name')}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>ethan.miller@example.com</Text>
              </View>
              <TouchableOpacity onPress={() => handleChangeInfo('Email')}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Password</Text>
                <Text style={styles.infoValue}>********</Text>
              </View>
              <TouchableOpacity onPress={() => handleChangeInfo('Password')}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>

        {/* App Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accountability Settings</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem} onPress={handleAccountabilitySettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Accountability Partners</Text>
                <Text style={styles.settingDescription}>Manage your accountability partners</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={handleAccountabilitySettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Accountability Reports</Text>
                <Text style={styles.settingDescription}>Set up your accountability reports</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={handleAIAccountabilitySettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>AI Accountability Partner 🤖</Text>
                <Text style={styles.settingDescription}>24/7 intelligent support & guidance</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Daily reminders and encouragement</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Weekly progress reports</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Data Privacy</Text>
                <Text style={styles.settingDescription}>Control how your data is used</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profile Visibility</Text>
                <Text style={styles.settingDescription}>Manage who can see your profile</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingDescription}>Get answers to common questions</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Contact Support</Text>
                <Text style={styles.settingDescription}>Get help from our team</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingDescription}>Read our terms and conditions</Text>
              </View>
              <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
            </TouchableOpacity>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Delete Account</Text>
              <Icon name="chevron-forward-outline" color={Colors.error.main} size="md" />
            </TouchableOpacity>
          </Surface>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // Cards
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
  },
  
  // Personal Info
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
  },

  // Settings
  settingsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error.main,
  },
});

export default ProfileSettingsScreen;