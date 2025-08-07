/**
 * AccountabilityScreen Component
 * 
 * This screen implements the accountability partner feature as shown in the design.
 * Features include:
 * - Partner profile display
 * - Daily check-in with mood slider
 * - Quick action buttons (Check-in, SOS, Prayer Request, Share Victory)
 * - Recent updates feed
 * - Emergency contact access
 * 
 * The design focuses on spiritual accountability and support between partners.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import { Colors, Icons } from '../constants';

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
  // State for daily check-in mood slider
  const [moodValue, setMoodValue] = useState(0.75); // 75% = "doing well"

  /**
   * Handle daily check-in submission
   */
  const handleDailyCheckin = () => {
    Alert.alert(
      'Daily Check-In',
      'Your daily check-in has been shared with your accountability partner.',
      [{ text: 'OK' }]
    );
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
    Alert.alert(
      'Prayer Request',
      'Share a prayer request with your accountability partner.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle share victory
   */
  const handleShareVictory = () => {
    Alert.alert(
      'Share Victory',
      'Celebrate a victory with your accountability partner!',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle invite partner
   */
  const handleInvitePartner = () => {
    if (navigation) {
      navigation.navigate('InviteFriend');
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
        {/* Partner Profile Section */}
        <View style={styles.partnerSection}>
          <View style={styles.partnerInfo}>
            <View style={styles.avatarContainer}>
              <ImageBackground
                source={{ 
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVkaqcwqNDHY1F4g6jjkeGF0cJ4fGQ5RFAry5WI8BRhOJ42aLSeNGm_L3AT8K-p7yJKk416PJSJ9zthbc0dufXmMyC5IUy8LVVQuxWMY2DucxLG_1N4kBXsnMdPptIbiahVUkDVEobcsT_5pDroVfLhybMzbJ2SrRJRS7IdazSSDyij0ynWVUEJdxTKZEhUIxpC3KHpzbmZEbsttZ4cDMBw2hfBx_Gl2HQ8NAkumwl6Fpi_pSXLXiTVAe7DSaaihZBD3AnwEB_jfNw' 
                }}
                style={styles.avatar}
                imageStyle={styles.avatarImage}
              />
            </View>
            <View style={styles.partnerDetails}>
              <Text style={styles.partnerName}>Ethan</Text>
              <Text style={styles.partnerConnection}>Connected for 3 months</Text>
            </View>
          </View>
        </View>

        {/* Daily Check-In Section */}
        <Surface style={styles.checkInCard} elevation={2}>
          <Text style={styles.sectionTitle}>Daily Check-In</Text>
          <Text style={styles.checkInQuestion}>How's your heart today?</Text>
          
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
            onPress={handleShareScripture}
            style={styles.shareScriptureButton}
            contentStyle={styles.shareScriptureContent}
            labelStyle={styles.shareScriptureLabel}
            buttonColor={Colors.primary.main}
          >
            Share Scripture
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

            {/* Prayer Request */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handlePrayerRequest}
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

            {/* Invite Partner */}
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.inviteButton]}
              onPress={handleInvitePartner}
            >
              <Icon 
                name="person-add-outline" 
                color={Colors.white} 
                size="lg" 
              />
              <Text style={[styles.quickActionLabel, styles.inviteLabel]}>Invite Partner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Updates Section */}
        <View style={styles.recentUpdatesSection}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          
          {/* Update Item 1 */}
          <Surface style={styles.updateCard} elevation={1}>
            <View style={styles.updateContent}>
              <View style={styles.updateIcon}>
                <Icon 
                  name={Icons.actions.like.name} 
                  color={Colors.primary.main} 
                  size="lg" 
                />
              </View>
              <View style={styles.updateDetails}>
                <Text style={styles.updateTitle}>Daily Check-In</Text>
                <Text style={styles.updateDescription}>Ethan completed his daily check-in</Text>
              </View>
            </View>
            <Text style={styles.updateTime}>Today</Text>
          </Surface>

          {/* Update Item 2 */}
          <Surface style={styles.updateCard} elevation={1}>
            <View style={styles.updateContent}>
              <View style={styles.updateIcon}>
                <Icon 
                  name={Icons.tabs.truth.name} 
                  color={Colors.primary.main} 
                  size="lg" 
                />
              </View>
              <View style={styles.updateDetails}>
                <Text style={styles.updateTitle}>Scripture</Text>
                <Text style={styles.updateDescription}>Ethan shared a scripture</Text>
              </View>
            </View>
            <Text style={styles.updateTime}>Yesterday</Text>
          </Surface>
        </View>

        {/* Community Groups Section */}
        <View style={styles.communitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Groups</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation?.navigate('NewGroup')}
            >
              <Icon name="add-outline" color={Colors.white} size="sm" />
              <Text style={styles.createButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation?.navigate('GroupChat', { groupName: 'Men\'s Accountability' })}
          >
            <Surface style={styles.groupCard} elevation={1}>
              <View style={styles.groupInfo}>
                <View style={styles.groupAvatarContainer}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB8yP7kR_YFpE-D9f_J9R8bWJ1hY-7gJ6J7L3WzKqX5G6cZ-F-V9hX9gC8rJ0L3gS4hN_I9a-PqS9jKzH-eX1lD2oO4gYtH5iB6sX-Z_kM8n7oJ1c-E7sP-dF-YwQ9gA-L8mR-XgC0' }} 
                    style={styles.groupAvatar}
                  />
                  <View style={styles.onlineIndicator} />
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>Men's Accountability</Text>
                  <Text style={styles.groupMessage}>John: Let's keep pushing forward!</Text>
                </View>
                <Text style={styles.groupTime}>2:15 PM</Text>
              </View>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('GroupChat', { groupName: 'Prayer Warriors' })}
          >
            <Surface style={styles.groupCard} elevation={1}>
              <View style={styles.groupInfo}>
                <View style={styles.groupAvatarContainer}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3G4Q1X8F5e8Z6J3s9L8d7F5g4H3R2k1p0J2o9W1c8B7d6A5f4G3h2E1b9G8v7F6d5C4B3A2z1Y0X9wS-T8u7i6h5g4F3D2s1Rq0p-O-N-M-L-K-J-I-H-G-F-E-D-C-B-A' }} 
                    style={styles.groupAvatar}
                  />
                  <View style={styles.onlineIndicator} />
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>Prayer Warriors</Text>
                  <Text style={styles.groupMessage}>Emily: Lifting you up in prayer.</Text>
                </View>
                <Text style={styles.groupTime}>Yesterday</Text>
              </View>
            </Surface>
          </TouchableOpacity>
        </View>

        {/* Victory Stories Section */}
        <View style={styles.victorySection}>
          <Text style={styles.sectionTitle}>Victory Stories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
          >
            <View style={styles.storyCard}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWIHSbnErNOKBWaemHGeo8k1OWa-kE5Bs3MuYb1lL2iCFM4Tnnmlp82U1p_muRRhXg2RcvUXBPshCL7fwJSF-O0pSK1QRc5x-4c3G0iTKZ_uw9eRLrPl9Aj8yJ4K9Sf-tVEvLg8CZlClGPvncA8E55gAUOsZI8EseZsjxGU5YGSoWBXSknWJj27a8PjVcV7P5xC9o6gkRmc6hOYTnZcIe12Wa42NzLvO2qAUdiD64Z_F-TLrOHKTdVdiWvLQh7nYEwolIZY1KEby2R' }}
                style={styles.storyImage}
              />
              <Text style={styles.storyText}>Overcame 100 days of temptation</Text>
            </View>

            <View style={styles.storyCard}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8w6D2QHJ_ABurtFZWPQlYKnXwrOot2YxnFMns8BIGdNk9WOC_tT93ib9H_b-W8waGRrkBbRO7bMeK_T9zt5yq6WK9zEk2Ibw4tQNTX_7F6YpRyFYmjTgp4utT5hcSbe7yHCjccZPDuoYB0BWdIklh2BDtuY3NLOM7OkF2Tfaf60Eu2VgrOpaqIYJFupnD9FYDBmcwBubqsQp-JQpaSnpbP7ehD_fJC8TCaZUr4QaeW8chntuAB7yfmqArIXh5rg7X7woJdQv2uGjy' }}
                style={styles.storyImage}
              />
              <Text style={styles.storyText}>Found strength in faith</Text>
            </View>

            <View style={styles.storyCard}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQC7wt9p4fZtJDrnyfceojU_U5EOqy9hu4RxTRfDfjJaxizfSuhKEWV2N_1AQcIfCQ_BcfdTJzelOveWUWKHrwzz-CqXRucHNjwY-nyuKwVPwJKsXe59W_9CmMC49gYb2JG8ih4unRQsJ7fP6D00kQLmd--b6hfnJqvcYT6BUdn0gmbXGPlu6HUyAFSXuUfH7-DW03z46HMYU2ojdbCgRBa2RXGldl5bkoXjNI-a110ItuWEUVBO8Rzlb95hZ-nsXD-tKP6vZnHhUy' }}
                style={styles.storyImage}
              />
              <Text style={styles.storyText}>Victory over addiction</Text>
            </View>
          </ScrollView>
        </View>

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
  
  // Partner Section
  partnerSection: {
    marginBottom: 24,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
  },
  avatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    borderRadius: 48,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  partnerConnection: {
    fontSize: 16,
    color: Colors.text.secondary,
  },

  // Daily Check-in Section
  checkInCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
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

  // Recent Updates Section
  recentUpdatesSection: {
    marginBottom: 24,
  },
  updateCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  updateIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateDetails: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  updateDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  updateTime: {
    fontSize: 14,
    color: Colors.text.secondary,
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

  // Victory Stories Section
  victorySection: {
    marginBottom: 24,
  },
  storiesContainer: {
    paddingRight: 16,
    gap: 16,
  },
  storyCard: {
    width: 160,
    flexShrink: 0,
  },
  storyImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  storyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 18,
  },
});

export default AccountabilityScreen;