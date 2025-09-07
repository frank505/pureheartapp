/**
 * ProfileSettingsScreen Component
 * 
 * Profile & Settings screen focused on personal information and account settings.
 * Subscription content moved to separate screen.
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, getUserDetails } from '../store/slices/userSlice';
import { fetchSettings, updateSettings } from '../services/settingsService';
import { ContentFilter } from '../services/contentFilter';
import { AppBlocking, AppBlockingData } from '../services/appBlocking';

interface ProfileSettingsScreenProps {
  navigation?: any;
  route?: any;
}
 
const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector((state) => state.user);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);
  const [enablePushNotifications, setEnablePushNotifications] = useState<boolean>(false);
  const [weeklyEmailNotifications, setWeeklyEmailNotifications] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  // Content Filter States
  const [contentFilterEnabled, setContentFilterEnabled] = useState<boolean>(false);
  const [contentFilterLoading, setContentFilterLoading] = useState<boolean>(true);

  // App Blocking States
  const [appBlockingData, setAppBlockingData] = useState<AppBlockingData>({
    applicationCount: 0,
    categoryCount: 0,
    totalCount: 0,
    hasSelection: false,
  });
  const [appBlockingLoading, setAppBlockingLoading] = useState<boolean>(false);


  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const s = await fetchSettings();
        if (!mounted) return;
        setEnablePushNotifications(Boolean(s.enable_push_notifications));
        setWeeklyEmailNotifications(Boolean(s.weekly_email_notifications));
      } catch (e) {
        // best-effort; show alert but keep UI usable
        Alert.alert('Error', 'Failed to load settings.');
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  // Content Filter Effects
  useEffect(() => {
    let mounted = true;
    const loadContentFilterStatus = async () => {
      if (Platform.OS !== 'ios') {
        setContentFilterLoading(false);
        return;
      }
      
      try {
        const status = await ContentFilter.isFilterEnabled();
        if (!mounted) return;
        setContentFilterEnabled(status);
      } catch (error) {
        console.error('Failed to get content filter status:', error);
      } finally {
        if (mounted) setContentFilterLoading(false);
      }
    };
    
    loadContentFilterStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // App Blocking Effects
  useEffect(() => {
    let mounted = true;
    const loadAppBlockingData = async () => {
      if (Platform.OS !== 'ios') {
        return;
      }
      
      try {
        const data = await AppBlocking.getBlockedApps();
        if (!mounted) return;
        setAppBlockingData(data);
      } catch (error) {
        console.error('Failed to get blocked apps:', error);
      }
    };
    
    loadAppBlockingData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First and last names cannot be empty.');
      return;
    }

    try {
      await dispatch(updateProfile({ firstName, lastName, username })).unwrap();
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  // Accountability settings moved to Accountability screen

  // No-op: notifications are managed inline below via API-backed toggles

  const handleToggleSetting = async (key: 'enable_push_notifications' | 'weekly_email_notifications', value: boolean) => {
    try {
      setSettingsLoading(true);
      const updated = await updateSettings({ [key]: value });
      setEnablePushNotifications(Boolean(updated.enable_push_notifications));
      setWeeklyEmailNotifications(Boolean(updated.weekly_email_notifications));
    } catch (e) {
      Alert.alert('Error', 'Failed to update setting.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Content Filter Functions
  const toggleContentFilter = async () => {
    if (contentFilterEnabled) {
      // If currently enabled, disable it
      try {
        setContentFilterLoading(true);
        const result = await ContentFilter.disableFilter();
        if (result) {
          setContentFilterEnabled(false);
          Alert.alert('Content Filter Disabled', 'Content filtering has been turned off.');
        }
      } catch (error) {
        console.error('Failed to disable content filter:', error);
        Alert.alert('Error', 'Failed to disable content filter');
      } finally {
        setContentFilterLoading(false);
      }
    } else {
      // If currently disabled, enable it
      try {
        setContentFilterLoading(true);
        const result = await ContentFilter.enableFilter();
        if (result) {
          // Wait a bit then check the status
          setTimeout(async () => {
            try {
              const status = await ContentFilter.isFilterEnabled();
              setContentFilterEnabled(status);
            } catch (error) {
              console.error('Failed to check content filter status:', error);
            } finally {
              setContentFilterLoading(false);
            }
          }, 1000);
        } else {
          setContentFilterLoading(false);
        }
      } catch (error) {
        console.error('Failed to toggle content filter:', error);
        setContentFilterLoading(false);
      }
    }
  };

  // App Blocking Functions
  const handleBlockApps = async () => {
    try {
      setAppBlockingLoading(true);
      const result = await AppBlocking.showFamilyActivityPicker();
      if (result) {
        setAppBlockingData(result);
        const message = result.totalCount > 0 
          ? `${result.totalCount} app${result.totalCount !== 1 ? 's' : ''} and categories are now blocked.`
          : 'App restrictions have been updated.';
        Alert.alert('Apps Updated', message);
      }
    } catch (error: any) {
      console.error('Failed to show app picker:', error);
      // Error handling is done in the service, no need to show additional alerts here
    } finally {
      setAppBlockingLoading(false);
    }
  };

  const handleClearBlockedApps = async () => {
    Alert.alert(
      'Clear Blocked Apps',
      'Are you sure you want to remove all app restrictions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setAppBlockingLoading(true);
              await AppBlocking.clearAllBlockedApps();
              setAppBlockingData({
                applicationCount: 0,
                categoryCount: 0,
                totalCount: 0,
                hasSelection: false,
              });
              Alert.alert('Success', 'All app restrictions have been removed.');
            } catch (error) {
              console.error('Failed to clear blocked apps:', error);
              Alert.alert('Error', 'Failed to clear app restrictions.');
            } finally {
              setAppBlockingLoading(false);
            }
          }
        }
      ]
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
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSaveChanges}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Surface>
        </View>

        {/* Accountability Settings removed; now managed in Accountability screen */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive updates and reminders</Text>
              </View>
              <ActivityIndicator animating={settingsLoading} color={Colors.primary.main} style={{ marginRight: 8 }} />
              <Switch
                value={enablePushNotifications}
                onValueChange={(val) => handleToggleSetting('enable_push_notifications', val)}
                trackColor={{ false: '#767577', true: Colors.primary.main }}
                thumbColor={enablePushNotifications ? '#ffffff' : '#f4f3f4'}
                disabled={settingsLoading}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Weekly Email</Text>
                <Text style={styles.settingDescription}>Weekly progress reports via email</Text>
              </View>
              <ActivityIndicator animating={settingsLoading} color={Colors.primary.main} style={{ marginRight: 8 }} />
              <Switch
                value={weeklyEmailNotifications}
                onValueChange={(val) => handleToggleSetting('weekly_email_notifications', val)}
                trackColor={{ false: '#767577', true: Colors.primary.main }}
                thumbColor={weeklyEmailNotifications ? '#ffffff' : '#f4f3f4'}
                disabled={settingsLoading}
              />
            </View>
          </Surface>
        </View>

        {/* Content Filter Section - iOS Only */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safari Content Filter</Text>
            <Surface style={styles.settingsCard} elevation={2}>
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Content Filter</Text>
                  <Text style={styles.settingDescription}>Block adult content in Safari</Text>
                </View>
                {contentFilterLoading ? (
                  <ActivityIndicator color={Colors.primary.main} style={{ marginRight: 8 }} />
                ) : (
                  <Switch
                    value={contentFilterEnabled}
                    onValueChange={toggleContentFilter}
                    trackColor={{ false: '#767577', true: Colors.primary.main }}
                    thumbColor={contentFilterEnabled ? '#ffffff' : '#f4f3f4'}
                    disabled={contentFilterLoading}
                  />
                )}
              </View>
            </Surface>
          </View>
        )}

        {/* App Blocking Section - iOS Only */}
        {Platform.OS === 'ios' && AppBlocking.isAppBlockingSupported() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Restrictions</Text>
            <Surface style={styles.settingsCard} elevation={2}>
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={handleBlockApps}
                disabled={appBlockingLoading}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Block Apps</Text>
                  <Text style={styles.settingDescription}>
                    {appBlockingData.hasSelection
                      ? `${appBlockingData.totalCount} app${appBlockingData.totalCount !== 1 ? 's' : ''} and categories blocked`
                      : 'Choose apps and categories to block'
                    }
                  </Text>
                </View>
                {appBlockingLoading ? (
                  <ActivityIndicator color={Colors.primary.main} style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
                )}
              </TouchableOpacity>

              {appBlockingData.hasSelection && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity 
                    style={styles.settingItem} 
                    onPress={handleClearBlockedApps}
                    disabled={appBlockingLoading}
                  >
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingTitle, { color: Colors.error.main }]}>
                        Clear All Restrictions
                      </Text>
                      <Text style={styles.settingDescription}>
                        Remove all app and category blocks
                      </Text>
                    </View>
                    {appBlockingLoading ? (
                      <ActivityIndicator color={Colors.error.main} style={{ marginRight: 8 }} />
                    ) : (
                      <Icon name="chevron-forward-outline" color={Colors.error.main} size="md" />
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Surface>
          </View>
        )}

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
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 8,
    color: Colors.error.main,
    textAlign: 'center',
  },
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