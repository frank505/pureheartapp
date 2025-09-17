import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  AppState,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors } from '../constants/Colors';
import { ContentFilter } from '../services/contentFilter';

interface AndroidPermissionStatus {
  accessibility: boolean;
  usageStats: boolean;
  overlay: boolean;
}

interface UsageStats {
  blockedAttempts: number;
  flaggedContent: number;
  lastActivity: number;
}

interface AndroidContentFilterScreenProps {
  navigation: any;
}

const AndroidContentFilterScreen: React.FC<AndroidContentFilterScreenProps> = ({ navigation }) => {
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<AndroidPermissionStatus>({
    accessibility: false,
    usageStats: false,
    overlay: false,
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    blockedAttempts: 0,
    flaggedContent: 0,
    lastActivity: 0,
  });
  const [customDomains, setCustomDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  // Refresh settings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  // Refresh settings when app becomes active (user returns from settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Increased delay to allow system to properly update permission state
        console.log('App became active, refreshing permissions in 1.5 seconds...');
        setTimeout(() => {
          loadSettings();
        }, 1500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load filter status
      const enabled = await ContentFilter.isFilterEnabled();
      setFilterEnabled(enabled);
      
      // Load permissions status - force fresh checks
      if (Platform.OS === 'android') {
        console.log('Checking Android permissions...');
        
        // Check each permission individually with error handling
        let accessibility = false;
        let usageStats = false;
        let overlay = false;
        
        // Add a small delay to ensure system permission state is updated
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
        
        try {
          accessibility = await ContentFilter.checkAccessibilityPermission();
          console.log('🔍 Accessibility permission check result:', accessibility);
        } catch (error) {
          console.error('❌ Error checking accessibility permission:', error);
        }
        
        try {
          usageStats = await ContentFilter.checkUsageStatsPermission();
          console.log('📊 Usage stats permission check result:', usageStats);
        } catch (error) {
          console.error('❌ Error checking usage stats permission:', error);
        }
        
        try {
          overlay = await ContentFilter.checkOverlayPermission();
          console.log('🔄 Overlay permission check result:', overlay);
        } catch (error) {
          console.error('❌ Error checking overlay permission:', error);
        }
        
        console.log('🎯 Setting permissions state:', { accessibility, usageStats, overlay });
        setPermissions({ accessibility, usageStats, overlay });
        
        // Load usage statistics
        try {
          const stats = await ContentFilter.getUsageStats();
          setUsageStats(stats);
        } catch (error) {
          console.error('Error loading usage stats:', error);
          setUsageStats({
            blockedAttempts: 0,
            flaggedContent: 0,
            lastActivity: 0,
          });
        }
      }
      
      // Load custom domains
      try {
        const domains = await ContentFilter.getCustomBlockedDomains();
        setCustomDomains(domains);
      } catch (error) {
        console.error('Error loading custom domains:', error);
        setCustomDomains([]);
      }
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert(
        'Error Loading Settings',
        'Failed to load content filter settings. Please try again.',
        [{ text: 'OK', onPress: () => setTimeout(loadSettings, 1000) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      setLoading(true);
      
      if (filterEnabled) {
        // Disable filter
        const result = await ContentFilter.disableFilter();
        if (result) {
          setFilterEnabled(false);
          Alert.alert('Filter Disabled', 'Content filtering has been turned off.');
        }
      } else {
        // Check permissions first
        const allPermissions = await ContentFilter.checkAllPermissions();
        
        if (!allPermissions) {
          Alert.alert(
            'Permissions Required',
            'PureHeart needs special permissions to monitor and filter content. Please grant all required permissions.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Grant Permissions', onPress: requestAllPermissions }
            ]
          );
          return;
        }
        
        // Enable filter
        const result = await ContentFilter.enableFilter();
        if (result) {
          setFilterEnabled(true);
          Alert.alert(
            'Filter Enabled', 
            'Content filtering is now active. Inappropriate content will be blocked across all browsers and apps.'
          );
        }
      }
      
    } catch (error) {
      console.error('Failed to toggle filter:', error);
      Alert.alert('Error', 'Failed to toggle content filter');
    } finally {
      setLoading(false);
      loadSettings(); // Refresh status
    }
  };

  const requestAllPermissions = async () => {
    try {
      const result = await ContentFilter.requestAllPermissions();
      if (result) {
        Alert.alert(
          'Permission Setup',
          'Please grant all the requested permissions in the system settings that will open. Return to this screen after granting permissions.',
          [
            { text: 'OK', onPress: () => {
              // Check permissions after a delay
              setTimeout(loadSettings, 2000);
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  const requestSpecificPermission = async (type: 'accessibility' | 'usageStats' | 'overlay') => {
    try {
      let result = false;
      let title = '';
      let message = '';
      
      switch (type) {
        case 'accessibility':
          result = await ContentFilter.requestAccessibilityPermission();
          title = 'Accessibility Permission';
          message = 'Grant accessibility permission to PureHeart to monitor content across apps and browsers.';
          break;
        case 'usageStats':
          result = await ContentFilter.requestUsageStatsPermission();
          title = 'Usage Access Permission';
          message = 'Grant usage access to monitor app usage and block social media apps.';
          break;
        case 'overlay':
          result = await ContentFilter.requestOverlayPermission();
          title = 'Display Over Other Apps';
          message = 'Allow PureHeart to display blocking overlays when inappropriate content is detected.';
          break;
      }
      
      if (result) {
        Alert.alert(
          title, 
          message + ' Please return to this screen after granting the permission.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Check permissions after a longer delay to ensure system updates
              console.log(`Permission request for ${type} completed, refreshing in 2 seconds...`);
              setTimeout(() => {
                loadSettings();
              }, 2000); // Increased delay for better syncing
            }
          }]
        );
      } else {
        Alert.alert(
          'Error', 
          `Failed to request ${type} permission. Please try again or set it manually in Android Settings.`
        );
      }
      
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
      Alert.alert('Error', `Failed to request ${type} permission. Please try again.`);
    }
  };

  // Force refresh permissions - can be called manually
  const refreshPermissions = async () => {
    console.log('🔄 Manual refresh permissions triggered by user');
    try {
      setLoading(true);
      
      if (Platform.OS === 'android') {
        // Multiple checks with delays to ensure we get the most up-to-date state
        console.log('🕐 Performing immediate permission check...');
        
        // First immediate check
        let accessibility = await ContentFilter.checkAccessibilityPermission();
        let usageStats = await ContentFilter.checkUsageStatsPermission();
        let overlay = await ContentFilter.checkOverlayPermission();
        
        console.log('📊 Immediate check results:', { accessibility, usageStats, overlay });
        setPermissions({ accessibility, usageStats, overlay });
        
        // Second check after 1 second delay
        setTimeout(async () => {
          console.log('🕑 Performing delayed permission check...');
          try {
            accessibility = await ContentFilter.checkAccessibilityPermission();
            usageStats = await ContentFilter.checkUsageStatsPermission();
            overlay = await ContentFilter.checkOverlayPermission();
            
            console.log('📊 Delayed check results:', { accessibility, usageStats, overlay });
            setPermissions({ accessibility, usageStats, overlay });
          } catch (error) {
            console.error('❌ Delayed check failed:', error);
          }
        }, 1000);
        
        // Third check after 2 seconds delay  
        setTimeout(async () => {
          console.log('🕒 Performing final permission check...');
          try {
            accessibility = await ContentFilter.checkAccessibilityPermission();
            usageStats = await ContentFilter.checkUsageStatsPermission();
            overlay = await ContentFilter.checkOverlayPermission();
            
            console.log('📊 Final check results:', { accessibility, usageStats, overlay });
            setPermissions({ accessibility, usageStats, overlay });
          } catch (error) {
            console.error('❌ Final check failed:', error);
          } finally {
            setLoading(false);
          }
        }, 2000);
      } else {
        // For iOS, just call loadSettings
        await loadSettings();
      }
      
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      setLoading(false);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh permissions. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const blockSocialMedia = async () => {
    try {
      setLoading(true);
      const result = await ContentFilter.blockSocialMediaApps();
      
      if (result) {
        Alert.alert(
          'Social Media Blocked',
          'Social media apps are now blocked. The app will monitor and prevent access to Instagram, TikTok, Facebook, and other social platforms.'
        );
      }
      
    } catch (error) {
      console.error('Failed to block social media apps:', error);
      Alert.alert('Error', 'Failed to block social media apps');
    } finally {
      setLoading(false);
    }
  };

  const addCustomDomain = async () => {
    if (!newDomain.trim()) {
      Alert.alert('Error', 'Please enter a valid domain');
      return;
    }
    
    try {
      const result = await ContentFilter.addBlockedDomain(newDomain.trim().toLowerCase());
      if (result) {
        setNewDomain('');
        await loadSettings();
        Alert.alert('Domain Added', `${newDomain} has been added to your blocklist.`);
      }
    } catch (error) {
      console.error('Failed to add domain:', error);
      Alert.alert('Error', 'Failed to add domain to blocklist');
    }
  };

  const removeDomain = async (domain: string) => {
    Alert.alert(
      'Remove Domain',
      `Remove ${domain} from your blocklist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await ContentFilter.removeBlockedDomain(domain);
              if (result) {
                await loadSettings();
                Alert.alert('Domain Removed', `${domain} has been removed from your blocklist.`);
              }
            } catch (error) {
              console.error('Failed to remove domain:', error);
              Alert.alert('Error', 'Failed to remove domain from blocklist');
            }
          }
        }
      ]
    );
  };

  const formatLastActivity = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getPermissionIcon = (granted: boolean): string => {
    return granted ? '✅' : '❌';
  };

  const getPermissionColor = (granted: boolean): string => {
    return granted ? Colors.secondary.main : Colors.error.main;
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.notAvailable}>
          Android content filtering is only available on Android devices.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back-outline" color={Colors.text.primary} size="lg" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Android Content Filter</Text>
        <TouchableOpacity 
          style={styles.headerRefreshButton} 
          onPress={refreshPermissions}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary.main} size="small" />
          ) : (
            <Icon name="refresh-outline" color={Colors.primary.main} size="md" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Main Content Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Advanced Protection</Text>
          <Text style={styles.subtitle}>
            System-wide content monitoring and blocking for Android browsers and apps
          </Text>
        </View>

        {/* Debug Info - Remove this section when everything works */}
        {__DEV__ && Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: '#f0f0f0' }]}>
            <Text style={[styles.sectionTitle, { color: '#333' }]}>🐛 Debug Info</Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Loading: {loading ? 'YES' : 'NO'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              Accessibility: {permissions.accessibility ? '✅ GRANTED' : '❌ NOT GRANTED'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              Usage Stats: {permissions.usageStats ? '✅ GRANTED' : '❌ NOT GRANTED'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              Overlay: {permissions.overlay ? '✅ GRANTED' : '❌ NOT GRANTED'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Filter Enabled: {filterEnabled ? 'YES' : 'NO'}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
              onPress={async () => {
                try {
                  const debugInfo = await ContentFilter.getAccessibilityDebugInfo?.();
                  console.log('🐛 DETAILED DEBUG INFO:', debugInfo);
                  Alert.alert(
                    'Debug Info',
                    `Package: ${debugInfo?.packageName}\n` +
                    `Enabled Services: ${debugInfo?.enabledServices}\n` +
                    `Accessibility On: ${debugInfo?.accessibilityEnabled}\n` +
                    `Has Permission: ${debugInfo?.hasPermission}\n` +
                    `Service Running: ${debugInfo?.isRunning}`,
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  console.error('Debug info error:', error);
                }
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
                Show Detailed Debug Info
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Main Filter Toggle */}
      <View style={styles.section}>
        <View style={styles.filterToggle}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Content Filter</Text>
            <Text style={styles.toggleDescription}>
              Monitor and block inappropriate content across all browsers and apps
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.primary.main} />
          ) : (
            <Switch
              value={filterEnabled}
              onValueChange={toggleFilter}
              trackColor={{ false: '#767577', true: Colors.primary.main }}
              thumbColor={filterEnabled ? '#ffffff' : '#f4f3f4'}
            />
          )}
        </View>
      </View>

      {/* Permissions Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Required Permissions</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshPermissions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primary.main} size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          All permissions must be granted for content filtering to work properly
          {loading && ' • Checking permissions...'}
        </Text>
        
        <TouchableOpacity 
          style={styles.permissionItem}
          onPress={() => requestSpecificPermission('accessibility')}
        >
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>
              {getPermissionIcon(permissions.accessibility)} Accessibility Service
            </Text>
            <Text style={styles.permissionDescription}>
              Monitor browser content and app usage
            </Text>
          </View>
          <Text style={[styles.permissionStatus, { color: getPermissionColor(permissions.accessibility) }]}>
            {permissions.accessibility ? 'Granted' : 'Required'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.permissionItem}
          onPress={() => requestSpecificPermission('usageStats')}
        >
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>
              {getPermissionIcon(permissions.usageStats)} Usage Access
            </Text>
            <Text style={styles.permissionDescription}>
              Monitor app launches and block social media
            </Text>
          </View>
          <Text style={[styles.permissionStatus, { color: getPermissionColor(permissions.usageStats) }]}>
            {permissions.usageStats ? 'Granted' : 'Required'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.permissionItem}
          onPress={() => requestSpecificPermission('overlay')}
        >
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>
              {getPermissionIcon(permissions.overlay)} Display Over Other Apps
            </Text>
            <Text style={styles.permissionDescription}>
              Show blocking overlays when content is detected
            </Text>
          </View>
          <Text style={[styles.permissionStatus, { color: getPermissionColor(permissions.overlay) }]}>
            {permissions.overlay ? 'Granted' : 'Required'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Usage Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{usageStats.blockedAttempts}</Text>
            <Text style={styles.statLabel}>Blocked Attempts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{usageStats.flaggedContent}</Text>
            <Text style={styles.statLabel}>Flagged Content</Text>
          </View>
        </View>
        
        <Text style={styles.lastActivity}>
          Last Activity: {formatLastActivity(usageStats.lastActivity)}
        </Text>
      </View>

      {/* Social Media Blocking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Media Control</Text>
        <Text style={styles.sectionDescription}>
          Block social media apps completely while allowing browsers with monitoring
        </Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={blockSocialMedia}>
          <Text style={styles.actionButtonText}>🚫 Block Social Media Apps</Text>
        </TouchableOpacity>
        
        <Text style={styles.blockedAppsInfo}>
          Blocks: Instagram, TikTok, Facebook, Twitter, Snapchat, YouTube, Reddit, and more
        </Text>
      </View>

      {/* Custom Domain Blocking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Website Blocking</Text>
        <Text style={styles.sectionDescription}>
          Add specific websites to block in addition to the default list
        </Text>
        
        <View style={styles.addDomainContainer}>
          <TextInput
            style={styles.domainInput}
            placeholder="Enter domain (e.g., example.com)"
            value={newDomain}
            onChangeText={setNewDomain}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.addButton} onPress={addCustomDomain}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {customDomains.length > 0 && (
          <View style={styles.customDomainsList}>
            {customDomains.map((domain, index) => (
              <View key={index} style={styles.domainItem}>
                <Text style={styles.domainText}>{domain}</Text>
                <TouchableOpacity onPress={() => removeDomain(domain)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Setup Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setup Instructions</Text>
        <Text style={styles.instructions}>
          {ContentFilter.getSetupInstructions()}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRefreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  section: {
    backgroundColor: Colors.background.secondary,
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  toggleDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  lastActivity: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  blockedAppsInfo: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addDomainContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  domainInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.tertiary,
  },
  addButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  customDomainsList: {
    marginTop: 16,
  },
  domainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  domainText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  removeButton: {
    color: Colors.error.main,
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  notAvailable: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default AndroidContentFilterScreen;
