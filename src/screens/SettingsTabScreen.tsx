import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Switch, Platform, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader } from '../components';
import { Colors } from '../constants';
import { Text, Surface, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import Icon from '../components/Icon';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, getUserDetails, logout } from '../store/slices/userSlice';
import { fetchSettings, updateSettings } from '../services/settingsService';
import { ContentFilter } from '../services/contentFilter';
import { AppBlocking, AppBlockingData } from '../services/appBlocking';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';

const SettingsTabScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { currentUser, loading } = useAppSelector((s) => s.user);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [enablePushNotifications, setEnablePushNotifications] = useState(false);
  const [weeklyEmailNotifications, setWeeklyEmailNotifications] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const [contentFilterEnabled, setContentFilterEnabled] = useState(false);
  const [contentFilterLoading, setContentFilterLoading] = useState(true);

  const [appBlockingData, setAppBlockingData] = useState<AppBlockingData>({
    applicationCount: 0,
    categoryCount: 0,
    totalCount: 0,
    hasSelection: false,
  });
  const [appBlockingLoading, setAppBlockingLoading] = useState(false);

  // Rate app state
  const [rating, setRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Store links (update APP_STORE_ID when available)
  const APP_STORE_ID = '123456789'; // TODO: replace with real App Store ID
  const PLAY_PACKAGE = 'com.pureheart';
  const storeUrls = Platform.select({
    ios: {
      app: `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`,
      web: `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`,
    },
    android: {
      app: `market://details?id=${PLAY_PACKAGE}`,
      web: `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`,
    },
    default: {
      app: `https://thepurityapp.com`,
      web: `https://thepurityapp.com`,
    }
  }) as { app: string; web: string };

  const openStoreForReview = async () => {
    const primary = storeUrls.app;
    const fallback = storeUrls.web;
    try {
      const supported = await Linking.canOpenURL(primary);
      if (supported) await Linking.openURL(primary);
      else await Linking.openURL(fallback);
    } catch {
      try { await Linking.openURL(fallback); } catch {}
    }
  };

  const handleSubmitRating = async () => {
    if (!rating) { return; }
    setSubmittingRating(true);
    try {
      // Simple flow: always send to store review page
      await openStoreForReview();
    } finally {
      setSubmittingRating(false);
    }
  };

  useEffect(() => { dispatch(getUserDetails()); }, [dispatch]);

  // If navigated with autoEnablePush, try to enable push and ensure OS permission
  useEffect(() => {
    const auto = route?.params?.autoEnablePush;
    if (!auto) return;
    let cancelled = false;
    (async () => {
      try {
        // Check OS permission
        const anyMessaging: any = messaging();
        let status: number | undefined = undefined;
        if (typeof anyMessaging.hasPermission === 'function') {
          status = await anyMessaging.hasPermission();
        } else if (typeof anyMessaging.getAuthorizationStatus === 'function') {
          status = await anyMessaging.getAuthorizationStatus();
        }
        if (status == null) {
          const req = await messaging().requestPermission({ provisional: true });
          status = req as any;
        }
        const enabled = status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          Alert.alert(
            'Enable Notifications',
            'Notifications are turned off in system settings. Open settings to enable them.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          if (!cancelled) setEnablePushNotifications(false);
          return;
        }
        // OS permission OK -> enable backend setting
        if (!cancelled) await handleToggleSetting('enable_push_notifications', true);
      } catch {
        // no-op
      }
    })();
    return () => { cancelled = true; };
  }, [route?.params?.autoEnablePush]);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const s = await fetchSettings();
        if (!mounted) return;
        setEnablePushNotifications(Boolean(s.enable_push_notifications));
        setWeeklyEmailNotifications(Boolean(s.weekly_email_notifications));
      } catch {
        Alert.alert('Error', 'Failed to load settings.');
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };
    loadSettings();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadContentFilterStatus = async () => {
      if (Platform.OS !== 'ios') { setContentFilterLoading(false); return; }
      try {
        const status = await ContentFilter.isFilterEnabled();
        if (!mounted) return;
        setContentFilterEnabled(status);
      } catch (e) {
        console.warn('Failed to get content filter status', e);
      } finally {
        if (mounted) setContentFilterLoading(false);
      }
    };
    loadContentFilterStatus();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadAppBlockingData = async () => {
      if (Platform.OS !== 'ios') return;
      try {
        const data = await AppBlocking.getBlockedApps();
        if (!mounted) return;
        setAppBlockingData(data);
      } catch (e) {
        console.warn('Failed to get blocked apps', e);
      }
    };
    loadAppBlockingData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleSaveChanges = async () => {
    if (!firstName || !lastName) { Alert.alert('Validation Error', 'First and last names cannot be empty.'); return; }
    try {
      await dispatch(updateProfile({ firstName, lastName, username })).unwrap();
      Alert.alert('Success', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleToggleSetting = async (key: 'enable_push_notifications' | 'weekly_email_notifications', value: boolean) => {
    try {
      setSettingsLoading(true);
      const updated = await updateSettings({ [key]: value });
      setEnablePushNotifications(Boolean(updated.enable_push_notifications));
      setWeeklyEmailNotifications(Boolean(updated.weekly_email_notifications));
    } catch {
      Alert.alert('Error', 'Failed to update setting.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleContentFilter = async () => {
    if (contentFilterEnabled) {
      try {
        setContentFilterLoading(true);
        const result = await ContentFilter.disableFilter();
        if (result) {
          setContentFilterEnabled(false);
          Alert.alert('Content Filter Disabled', 'Content filtering has been turned off.');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to disable content filter');
      } finally {
        setContentFilterLoading(false);
      }
    } else {
      try {
        setContentFilterLoading(true);
        const result = await ContentFilter.enableFilter();
        if (result) {
          setTimeout(async () => {
            try { const status = await ContentFilter.isFilterEnabled(); setContentFilterEnabled(status); }
            catch (e) { console.warn('Failed to check status', e); }
            finally { setContentFilterLoading(false); }
          }, 1000);
        } else {
          setContentFilterLoading(false);
        }
      } catch (e) {
        setContentFilterLoading(false);
      }
    }
  };

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
    } catch (e) {
      // handled in service
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
        { text: 'Clear All', style: 'destructive', onPress: async () => {
            try {
              setAppBlockingLoading(true);
              await AppBlocking.clearAllBlockedApps();
              setAppBlockingData({ applicationCount: 0, categoryCount: 0, totalCount: 0, hasSelection: false });
              Alert.alert('Success', 'All app restrictions have been removed.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear app restrictions.');
            } finally {
              setAppBlockingLoading(false);
            }
          } 
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Background gradient to match LibraryScreen vibe */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader title="Account" navigation={navigation} showGrowthTracker={false} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Quick account actions moved from profile dropdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('NotificationsCenter' as never)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="notifications-outline" color={Colors.text.primary} size={22} />
                <View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>View your recent notifications</Text>
                </View>
              </View>
              <Icon name="chevron-forward" color={Colors.text.secondary} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Subscription' as never)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="diamond-outline" color={Colors.primary.main} size={22} />
                <View>
                  <Text style={styles.settingTitle}>Subscription</Text>
                  <Text style={styles.settingDescription}>Manage your plan and billing</Text>
                </View>
              </View>
              <Icon name="chevron-forward" color={Colors.text.secondary} size={20} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="log-out-outline" color={Colors.error.main} size={22} />
                <View>
                  <Text style={[styles.settingTitle, { color: Colors.error.main }]}>Logout</Text>
                  <Text style={styles.settingDescription}>Sign out of your account</Text>
                </View>
              </View>
              <Icon name="chevron-forward" color={Colors.text.secondary} size={20} />
            </TouchableOpacity>
          </Surface>
        </View>
        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Surface style={styles.card} elevation={2}>
            <TextInput label="First Name" value={firstName} onChangeText={setFirstName} mode="outlined" style={styles.input} />
            <TextInput label="Last Name" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />
            <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
            <Button mode="contained" onPress={handleSaveChanges} loading={loading} disabled={loading} style={styles.saveButton}>Save Changes</Button>
            {/* Intentionally not showing global user error here to avoid noisy messages on load. */}
          </Surface>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive updates and reminders</Text>
              </View>
              <ActivityIndicator animating={settingsLoading} color={Colors.primary.main} style={{ marginRight: 8 }} />
              <Switch value={enablePushNotifications} onValueChange={(v) => handleToggleSetting('enable_push_notifications', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Weekly Email</Text>
                <Text style={styles.settingDescription}>Weekly progress reports via email</Text>
              </View>
              <ActivityIndicator animating={settingsLoading} color={Colors.primary.main} style={{ marginRight: 8 }} />
              <Switch value={weeklyEmailNotifications} onValueChange={(v) => handleToggleSetting('weekly_email_notifications', v)} />
            </View>
          </Surface>
        </View>

        {/* Content Filter iOS */}
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
                  <Switch value={contentFilterEnabled} onValueChange={toggleContentFilter} />
                )}
              </View>
            </Surface>
          </View>
        )}

        {/* App Blocking iOS */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Blocking</Text>
            <Surface style={styles.settingsCard} elevation={2}>
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Blocked Apps</Text>
                  <Text style={styles.settingDescription}>{appBlockingData.totalCount} items are selected</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button mode="outlined" onPress={handleBlockApps} loading={appBlockingLoading}>
                    Choose
                  </Button>
                  <Button mode="text" onPress={handleClearBlockedApps} disabled={appBlockingLoading}>
                    Clear
                  </Button>
                </View>
              </View>
            </Surface>
          </View>
        )}
    
     
       {/* Android Content Filter Section */}
        {Platform.OS === 'android' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Android Content Filter</Text>
            <Surface style={styles.settingsCard} elevation={2}>
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => navigation.navigate('AndroidContentFilter')}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>🛡️ Advanced Content Protection</Text>
                  <Text style={styles.settingDescription}>
                    Monitor and block inappropriate content across all browsers and apps
                  </Text>
                </View>
                <Icon name="chevron-forward-outline" color={Colors.text.secondary} size="md" />
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Content Filter Status</Text>
                  <Text style={styles.settingDescription}>
                    {contentFilterEnabled ? 'Active - Monitoring all content' : 'Inactive - No protection active'}
                  </Text>
                </View>
                {contentFilterLoading ? (
                  <ActivityIndicator color={Colors.primary.main} style={{ marginRight: 8 }} />
                ) : (
                  <Icon 
                    name={contentFilterEnabled ? "shield-checkmark" : "shield-outline"} 
                    color={contentFilterEnabled ? Colors.secondary.main : Colors.text.secondary} 
                    size="md" 
                  />
                )}
              </View>
            </Surface>
          </View>
        )}


        {/* Rate App (iOS & Android) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate the App</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <View style={[styles.settingItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={[styles.settingContent, { width: '100%' }]}> 
                <Text style={styles.settingTitle}>How are we doing?</Text>
                <Text style={styles.settingDescription}>Tap to rate and share your love on the store</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                {[1,2,3,4,5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)} style={{ padding: 4 }}>
                    <Icon name={i <= rating ? 'star' : 'star-outline'} size={24} color={i <= rating ? '#fbbf24' : Colors.text.secondary} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button mode="contained" onPress={handleSubmitRating} disabled={!rating || submittingRating} loading={submittingRating}>
                  Submit Rating
                </Button>
                <Button mode="text" onPress={openStoreForReview}>
                  Write a Review
                </Button>
              </View>
            </View>
          </Surface>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginBottom: 12 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  errorText: { marginTop: 8, color: Colors.error.main, textAlign: 'center' },
  settingsCard: { backgroundColor: Colors.background.secondary, borderRadius: 12, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  settingDescription: { fontSize: 13, color: Colors.text.secondary },
  divider: { height: 1, backgroundColor: Colors.border.primary },
});

export default SettingsTabScreen;
