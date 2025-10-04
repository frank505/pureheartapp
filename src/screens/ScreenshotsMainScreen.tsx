import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Surface } from 'react-native-paper';

// Components
import ScreenHeader from '../components/ScreenHeader';
import { Icon } from '../components';
import { Colors } from '../constants';

// Services
import screenshotApiService from '../services/screenshotApiService';

// Types
import { RootStackParamList } from '../navigation/types';

type ScreenshotsMainNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScreenshotsMain'>;

const { width } = Dimensions.get('window');

const ScreenshotsMainScreen: React.FC = () => {
  const navigation = useNavigation<ScreenshotsMainNavigationProp>();



  const handleViewSensitiveImages = () => {
    navigation.navigate('SensitiveImages', {});
  };

  const handleViewPartnerImages = () => {
    navigation.navigate('SensitiveImages', { userId: undefined }); // Will show partner selection
  };

  const quickActions = [
    {
      icon: 'images-outline',
      label: 'My Reports',
      description: 'View your flagged content history',
      onPress: handleViewSensitiveImages,
      color: Colors.warning.main,
      disabled: false
    },
    {
      icon: 'people-outline',
      label: 'Partner Reports',
      description: 'Review partner accountability reports',
      onPress: handleViewPartnerImages,
      color: Colors.secondary.main,
      disabled: false
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Screenshots & Reports" 
        navigation={navigation} 
        showBackButton={true}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <Surface style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Icon name="shield-checkmark-outline" color={Colors.primary.main} size="lg" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Accountability Monitoring</Text>
              <Text style={styles.infoDescription}>
                Review your accountability reports and see how AI-powered content moderation 
                helps you stay on track with your goals.
              </Text>
            </View>
          </View>
        </Surface>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionCard,
                  action.disabled && styles.actionCardDisabled
                ]}
                onPress={action.onPress}
                disabled={action.disabled}
                activeOpacity={0.7}
              >
                <Surface style={[styles.actionSurface, action.disabled && styles.actionSurfaceDisabled]}>
                  <View style={styles.actionIcon}>
                    <Icon 
                      name={action.icon} 
                      color={action.disabled ? Colors.text.tertiary : action.color} 
                      size="xl" 
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[
                      styles.actionTitle,
                      action.disabled && styles.actionTitleDisabled
                    ]}>
                      {action.label}
                    </Text>
                    <Text style={[
                      styles.actionDescription,
                      action.disabled && styles.actionDescriptionDisabled
                    ]}>
                      {action.description}
                    </Text>
                  </View>

                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Surface style={styles.infoDetailCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Monitoring</Text>
                <Text style={styles.stepDescription}>
                  Your browsing activity is automatically monitored for inappropriate content using AI analysis.
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Detection</Text>
                <Text style={styles.stepDescription}>
                  When sensitive content is detected, detailed reports are generated with analysis results.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Accountability</Text>
                <Text style={styles.stepDescription}>
                  Your accountability partners are notified and can provide support through comments and actions.
                </Text>
              </View>
            </View>
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    marginLeft: 4,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 12,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionSurface: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  actionSurfaceDisabled: {
    backgroundColor: Colors.background.tertiary,
  },
  actionIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionTitleDisabled: {
    color: Colors.text.tertiary,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionDescriptionDisabled: {
    color: Colors.text.tertiary,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoDetailCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default ScreenshotsMainScreen;
