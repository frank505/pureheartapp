import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Alert } from 'react-native';
import { fetchSettings, updateSettings } from '../services/settingsService';

/**
 * SettingsScreen Component
 * 
 * This screen provides users with various app settings and preferences.
 * Users can configure notifications, privacy, appearance, and account settings.
 * 
 * Features:
 * - Toggle switches for preferences
 * - Grouped settings sections for better organization
 * - Account management options
 * - Support and feedback links
 * - Clear visual hierarchy with icons and descriptions
 */
const SettingsScreen: React.FC = () => {
  // State for API-backed settings
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [weeklyEmailEnabled, setWeeklyEmailEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const s = await fetchSettings();
        if (!mounted) return;
        setNotificationsEnabled(Boolean(s.enable_push_notifications));
        setWeeklyEmailEnabled(Boolean(s.weekly_email_notifications));
      } catch (e) {
        Alert.alert('Error', 'Failed to load settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = async (key: 'enable_push_notifications' | 'weekly_email_notifications', value: boolean) => {
    try {
      setLoading(true);
      const s = await updateSettings({ [key]: value });
      setNotificationsEnabled(Boolean(s.enable_push_notifications));
      setWeeklyEmailEnabled(Boolean(s.weekly_email_notifications));
    } catch (e) {
      Alert.alert('Error', 'Failed to update setting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive updates and reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(v) => handleToggle('enable_push_notifications', v)}
                trackColor={{ false: '#767577', true: '#3498db' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                disabled={loading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingIcon}>📧</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Weekly Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get weekly progress updates
                  </Text>
                </View>
              </View>
              <Switch
                value={weeklyEmailEnabled}
                onValueChange={(v) => handleToggle('weekly_email_notifications', v)}
                trackColor={{ false: '#767577', true: '#3498db' }}
                thumbColor={weeklyEmailEnabled ? '#ffffff' : '#f4f3f4'}
                disabled={loading}
              />
            </View>
          </View>

          {/* Privacy Section removed for now */}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>👤</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Account Information</Text>
                <Text style={styles.settingDescription}>
                  Manage your account details
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>🔑</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your password
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Delete Account</Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>❓</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingDescription}>
                  Get help and find answers
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>📧</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Contact Support</Text>
                <Text style={styles.settingDescription}>
                  Send us a message
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.settingIcon}>⭐</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Rate App</Text>
                <Text style={styles.settingDescription}>
                  Leave a review on the App Store
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>PureHeart v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionItem: {
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 16,
  },
  actionArrow: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#95a5a6',
  },
});

export default SettingsScreen;