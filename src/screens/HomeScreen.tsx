/**
 * HomeScreen Component
 * 
 * "Freedom In Christ" main dashboard displaying spiritual journey.
 * Features streak tracking, daily identity, quick actions, and focus content.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import { Colors, Icons } from '../constants';

// Redux imports for debug
import { useAppDispatch } from '../store/hooks';
import { resetOnboarding } from '../store/slices/appSlice';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const currentStreak = 14;
  const userName = 'Ethan';

  // Debug function to reset onboarding
  const handleResetOnboarding = () => {
    dispatch(resetOnboarding());
  };

  // Quick Actions with proper icons
  const quickActions = [
    {
      title: 'Emergency Help',
      icon: 'medical-outline',
      onPress: () => console.log('Emergency Help pressed'),
    },
    {
      title: 'Daily Check-in',
      icon: 'calendar-outline',
      onPress: () => console.log('Daily Check-in pressed'),
    },
    {
      title: 'Read Scripture',
      icon: 'book-outline',
      onPress: () => console.log('Read Scripture pressed'),
    },
    {
      title: 'Pray Together',
      icon: 'people-outline',
      onPress: () => console.log('Pray Together pressed'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image 
            source={{ 
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRWc85ZTTIgMVwjHfCy9dooUKl5F1ZnVH2k-vW7LgzIDnW4fWQf0eV63vgkqilLw7ss1TvZgYxzVsER4Kn9R70AFKhBkYQDPIHjEkmLM_EQdqeHYSskiertWlBCUNIC-wHOrSH_DaJWdB7ag0lsvIfPs3t5rL233ytutv9Nz19l-hqc7tEl7IyQ0_eC0hWQYXeLqbOH2Eh2vDdVgIZP9_tmmH5fjWTvSWFCT44Sptr9yt79hI5uxm0DrUoRaJyAAN6_akrA5vLikF'
            }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.headerTitle}>FREEDOM IN CHRIST</Text>
        <ProfileDropdown navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Good morning, {userName}</Text>
        </View>

        {/* Streak Card */}
        <Surface style={styles.streakCard} elevation={3}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakUnit}>days</Text>
        </Surface>

        {/* Daily Identity */}
        <Surface style={styles.identityCard} elevation={3}>
          <View style={styles.identityContent}>
            <View style={styles.identityText}>
              <Text style={styles.identityLabel}>DAILY IDENTITY</Text>
              <Text style={styles.identityTitle}>I am a new creation in Christ</Text>
              <Text style={styles.identityVerse}>2 Corinthians 5:17</Text>
            </View>
            <View style={styles.identityImageContainer}>
              <Image 
                source={{ 
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRWc85ZTTIgMVwjHfCy9dooUKl5F1ZnVH2k-vW7LgzIDnW4fWQf0eV63vgkqilLw7ss1TvZgYxzVsER4Kn9R70AFKhBkYQDPIHjEkmLM_EQdqeHYSskiertWlBCUNIC-wHOrSH_DaJWdB7ag0lsvIfPs3t5rL233ytutv9Nz19l-hqc7tEl7IyQ0_eC0hWQYXeLqbOH2Eh2vDdVgIZP9_tmmH5fjWTvSWFCT44Sptr9yt79hI5uxm0DrUoRaJyAAN6_akrA5vLikF'
                }}
                style={styles.identityImage}
              />
            </View>
          </View>
        </Surface>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
              >
                <Surface style={styles.actionSurface} elevation={3}>
                  <Icon 
                    name={action.icon} 
                    size="xl" 
                    color={Colors.primary.main} 
                  />
                  <Text style={styles.actionText}>{action.title}</Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.focusSection}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <Surface style={styles.focusCard} elevation={3}>
            <ImageBackground
              source={{ 
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRWc85ZTTIgMVwjHfCy9dooUKl5F1ZnVH2k-vW7LgzIDnW4fWQf0eV63vgkqilLw7ss1TvZgYxzVsER4Kn9R70AFKhBkYQDPIHjEkmLM_EQdqeHYSskiertWlBCUNIC-wHOrSH_DaJWdB7ag0lsvIfPs3t5rL233ytutv9Nz19l-hqc7tEl7IyQ0_eC0hWQYXeLqbOH2Eh2vDdVgIZP9_tmmH5fjWTvSWFCT44Sptr9yt79hI5uxm0DrUoRaJyAAN6_akrA5vLikF'
              }}
              style={styles.focusImageBackground}
              imageStyle={styles.focusImageStyle}
            />
            <View style={styles.focusContent}>
              <Text style={styles.focusTitle}>Overcoming Temptation</Text>
              <Text style={styles.focusDescription}>
                Practical steps to resist and overcome temptation.
              </Text>
            </View>
          </Surface>
        </View>

        {/* Partner Update */}
        <View style={styles.partnerSection}>
          <Text style={styles.sectionTitle}>Partner Update</Text>
          <Surface style={styles.partnerCard} elevation={3}>
            <ImageBackground
              source={{ 
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRWc85ZTTIgMVwjHfCy9dooUKl5F1ZnVH2k-vW7LgzIDnW4fWQf0eV63vgkqilLw7ss1TvZgYxzVsER4Kn9R70AFKhBkYQDPIHjEkmLM_EQdqeHYSskiertWlBCUNIC-wHOrSH_DaJWdB7ag0lsvIfPs3t5rL233ytutv9Nz19l-hqc7tEl7IyQ0_eC0hWQYXeLqbOH2Eh2vDdVgIZP9_tmmH5fjWTvSWFCT44Sptr9yt79hI5uxm0DrUoRaJyAAN6_akrA5vLikF'
              }}
              style={styles.partnerImageBackground}
              imageStyle={styles.partnerImageStyle}
            />
            <View style={styles.partnerContent}>
              <Text style={styles.partnerTitle}>Partner Check-in</Text>
              <Text style={styles.partnerDescription}>
                Send a quick update to your accountability partner.
              </Text>
            </View>
          </Surface>
        </View>

        {/* Debug Section - Only show in development */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>🔧 Debug Tools</Text>
            <Button
              mode="outlined"
              onPress={handleResetOnboarding}
              style={styles.debugButton}
              textColor={Colors.primary.main}
            >
              Reset Onboarding Flow
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // #121212
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${Colors.background.primary}CC`, // 80% opacity
  },
  profileContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.background.secondary}80`, // Semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 96, // Account for tab bar
  },

  // Greeting
  greetingSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 36,
  },

  // Streak Card
  streakCard: {
    backgroundColor: Colors.background.secondary, // #1f2937
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.primary.main,
    lineHeight: 64,
  },
  streakUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },

  // Daily Identity
  identityCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  identityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  identityText: {
    flex: 1,
  },
  identityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  identityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 4,
  },
  identityVerse: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  identityImageContainer: {
    flexShrink: 0,
  },
  identityImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    lineHeight: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 16,
  },
  actionSurface: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    width: '100%',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },

  // Focus Section
  focusSection: {
    marginBottom: 24,
  },
  focusCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  focusImageBackground: {
    width: '100%',
    height: 128,
  },
  focusImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  focusContent: {
    padding: 16,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  focusDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  // Partner Section
  partnerSection: {
    marginBottom: 24,
  },
  partnerCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  partnerImageBackground: {
    width: '100%',
    height: 128,
  },
  partnerImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  partnerContent: {
    padding: 16,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  partnerDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(245, 153, 61, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 153, 61, 0.3)',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  debugButton: {
    borderColor: Colors.primary.main,
  },
});

export default HomeScreen;