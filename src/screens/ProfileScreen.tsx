/**
 * ProfileScreen Component
 * 
 * Profile & Settings screen with premium upgrade options.
 * Features personal info management, account settings, and subscription plans.
 */

import React, { useState } from 'react';
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

interface ProfileScreenProps {
  navigation?: any;
  route?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [currentPlan] = useState('Basic Plan');
  
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

  const handleUpgradePlan = (planType: string) => {
    Alert.alert(
      `Upgrade to ${planType}`,
      `Start your premium journey with ${planType}`,
      [{ text: 'Cancel' }, { text: 'Continue', onPress: () => {} }]
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

        {/* Current Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <Surface style={styles.planCard} elevation={2}>
            <View style={styles.planInfo}>
              <View style={styles.planIcon}>
                <Icon 
                  name="shield-checkmark-outline" 
                  color={Colors.primary.main} 
                  size="lg" 
                />
              </View>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{currentPlan}</Text>
                <Text style={styles.planPrice}>Free</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Premium Plans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Plans</Text>
          
          {/* Premium Plan */}
          <Surface style={styles.premiumCard} elevation={2}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.premiumTitle}>Premium</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>$9.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => handleUpgradePlan('Premium')}
            >
              <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Unlimited access to all content</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Personalized learning paths</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Exclusive community features</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Ad-free experience</Text>
              </View>
            </View>
          </Surface>

          {/* Couples Plan */}
          <Surface style={styles.couplesPlan} elevation={2}>
            <View style={styles.planHeader}>
              <Text style={styles.couplesTitle}>Couples</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>$14.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.couplesButton}
              onPress={() => handleUpgradePlan('Couples')}
            >
              <Text style={styles.couplesButtonText}>Choose Plan</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>All Premium features</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Shared progress tracking</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Couples-specific content</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-outline" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Enhanced communication tools</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Settings Sections */}
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
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <Surface style={styles.settingsCard} elevation={2}>
            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Manage your notification preferences</Text>
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
                <Text style={styles.settingTitle}>Privacy</Text>
                <Text style={styles.settingDescription}>Manage your privacy settings</Text>
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

  // Plan Cards
  planCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 16,
    color: Colors.text.secondary,
  },

  // Premium Plans
  premiumCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  planHeader: {
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.text.primary,
    lineHeight: 48,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  upgradeButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  featuresList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },

  // Couples Plan
  couplesPlan: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 24,
  },
  couplesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  couplesButton: {
    backgroundColor: Colors.secondary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  couplesButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
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

export default ProfileScreen;