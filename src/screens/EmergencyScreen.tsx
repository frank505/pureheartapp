/**
 * EmergencyScreen Component
 * 
 * Emergency Support Center with immediate help options.
 * Features crisis support, spiritual guidance, and emergency contacts.
 * Designed to provide immediate assistance during spiritual struggles.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import { Colors, Icons } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodaysRecommendation } from '../store/slices/recommendationsSlice';

interface EmergencyScreenProps {
  navigation?: any;
  route?: any;
}

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const [feelingText, setFeelingText] = useState('');
  const dispatch = useAppDispatch();
  const { today: todaysRecommendation } = useAppSelector((state) => state.recommendations);
 
  React.useEffect(() => {
    dispatch(fetchTodaysRecommendation());
  }, [dispatch]);

  // Handle main emergency button
  const handleEmergencyHelp = () => {
    Alert.alert(
      'I Need Help Now',
      'This will immediately contact your accountability partner and emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Get Help', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Help is on the way', 'Your accountability partner and emergency contacts have been notified.');
          }
        }
      ]
    );
  };

  // Handle immediate actions
  const handleBreatheWithJesus = () => {
    Alert.alert('Breathe with Jesus', 'Starting guided breathing and prayer session...');
  };

  const handleSpeakTruth = () => {
    Alert.alert('Speak Truth Now', 'Opening scripture verses for this moment...');
  };

  const handleCallBrother = () => {
    Alert.alert('Call My Brother', 'Calling your accountability partner...');
  };

  const handleWorshipRedirect = () => {
    Alert.alert('Worship & Redirect', 'Opening worship music and prayer resources...');
  };

  // Handle emergency contacts
  const handleCallMgBrother = () => {
    if (navigation) navigation.navigate('PartnersList');
  };

  const handleTextPartner = () => {
    if (navigation) navigation.navigate('PartnersList');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Emergency Support Center</Text>
        <ProfileDropdown navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Main Emergency Button */}
          <View style={styles.emergencyButtonContainer}>
            <TouchableOpacity 
              style={styles.mainEmergencyButton}
              onPress={handleEmergencyHelp}
            >
              <Text style={styles.emergencyButtonText}>I NEED HELP NOW</Text>
            </TouchableOpacity>
          </View>

          {/* Immediate Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Immediate Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleBreatheWithJesus}
              >
                <Text style={styles.actionButtonText}>Breathe with Jesus</Text>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleSpeakTruth}
              >
                <Text style={styles.actionButtonText}>Speak Truth Now</Text>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCallBrother}
              >
                <Text style={styles.actionButtonText}>Call My Brother</Text>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleWorshipRedirect}
              >
                <Text style={styles.actionButtonText}>Worship & Redirect</Text>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation?.navigate('AICompanion')}
              >
                <Text style={styles.actionButtonText}>AI Companion</Text>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scripture Power Verses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Power Verse for the day</Text>
            <ImageBackground
              source={{ 
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ87m37g4Nzqol-5HwrAqG5tuz0iLsPn6SlN35g7W0m2rmY8KkqJlTjnc1A7Q-zJbqa6R3MC9cS-3-_VoMJmZwvNw8-6voNswPtWixjoA1u4DTs_1QOXXUj0vKfxcSVm3QAuzhRSo_VkjTCc0qkgWXkQRnKhG1_7GxhxY3602QraOfB2RjNFdz7Id7Q1Y-BAMTF3Q9tjV_aNoAypAWaV2tuPszKiclQGk60gOhMsDuKJ9XcKnI4Ts41zKaYl5wVpxkw3GonWSgnp47' 
              }}
              style={styles.scriptureCard}
              imageStyle={styles.scriptureCardImage}
            >
              <View style={styles.scriptureOverlay}>
                <ScrollView 
                  style={styles.scriptureContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <Text style={styles.scriptureReference}>{todaysRecommendation?.scriptureReference || '1 Corinthians 10:13'}</Text>
                  <Text style={styles.scriptureText}>
                    {todaysRecommendation?.scriptureText || 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear...'}
                  </Text>
                </ScrollView>
              </View>
            </ImageBackground>
          </View>

          {/* Emergency Call & Text Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Call & Text</Text>
            <View style={styles.contactList}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleCallMgBrother}
              >
                <View style={styles.contactContent}>
                  <Icon 
                    name={Icons.communication.phone.name} 
                    color="#10b981" 
                    size="lg" 
                  />
                  <Text style={styles.contactText}>Call My Brother</Text>
                </View>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleTextPartner}
              >
                <View style={styles.contactContent}>
                  <Icon 
                    name={Icons.communication.message.name} 
                    color="#3b82f6" 
                    size="lg" 
                  />
                  <Text style={styles.contactText}>Text My Accountability Partner</Text>
                </View>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </TouchableOpacity>
            </View>
          </View>

         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // #111827 equivalent
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary, // accent-color equivalent
    backgroundColor: Colors.background.primary,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary, // #f9fafb equivalent
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96, // Account for bottom nav
  },
  content: {
    padding: 16,
    paddingTop: 32,
  },
  
  // Main Emergency Button
  emergencyButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  mainEmergencyButton: {
    backgroundColor: Colors.error.main, // #ef4444
    borderRadius: 50, // Full rounded
    paddingVertical: 20,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  // Action Grid
  actionGrid: {
    gap: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    backgroundColor: Colors.background.secondary, // #1f2937 surface-color
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.tertiary, // accent-color
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },

  // Scripture Card
  scriptureCard: {
    height: 224, // h-56 equivalent (14rem = 224px)
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  scriptureCardImage: {
    borderRadius: 16,
  },
  scriptureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay for text readability
    justifyContent: 'flex-end',
  },
  scriptureContent: {
    padding: 20,
  },
  scriptureReference: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  scriptureText: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 20,
    opacity: 0.9,
  },

  // Contact List
  contactList: {
    gap: 12,
    paddingHorizontal: 4,
  },
  contactButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Feeling Check-In
  checkInContainer: {
    paddingHorizontal: 16,
  },
  feelingInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default EmergencyScreen;