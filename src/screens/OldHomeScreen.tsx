/**
 * AccountabilityScreen Component
 * 
 * This screen implements the accountability partner feature as shown in the design.
 * Features include:
 * - Partner profile display
 * - Daily check-in with mood slider
 * - Quick action buttons (Check-in, SOS, Prayer Request, Share Victory)
 * - Emergency contact access
 * 
 * The design focuses on spiritual accountability and support between partners.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Image,
  useWindowDimensions,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Surface, Button, ProgressBar, Portal, Modal, TextInput, RadioButton, Checkbox, Chip } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ProfileDropdown, ScreenHeader } from '../components';
import PartnerGroupSelector from '../components/PartnerGroupSelector';
import { Colors, Icons } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCheckIns,
  createCheckIn,
  resetCheckinStatus,
} from '../store/slices/checkinsSlice';
import { fetchPartners, generateInvitationHash, acceptByCode, sendInvitesByEmail } from '../store/slices/invitationSlice';
import { getStreaks } from '../store/slices/streaksSlice';

import ConfettiCannon from 'react-native-confetti-cannon';
import { generateDailyRecommendation } from '../services/recommendationService';

const { width: screenWidth } = Dimensions.get('window');
// import InvitationService from '../services/invitationService';

/**
 * HomeScreen Component
 * 
 * Main accountability partner screen with all features
 */
interface OldHomeScreenProps {
  navigation?: any;
  route?: any;
}

const OldHomeScreen: React.FC<OldHomeScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  const cardAnimations = useRef({
    streak: new Animated.Value(0),
    checkin: new Animated.Value(0),
  }).current;
  
  // State for daily check-in mood slider
  const [moodValue, setMoodValue] = useState(0.75); // 75% = "doing well"
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [visibilityOption, setVisibilityOption] = useState<'private' | 'allPartners' | 'selectPartners' | 'group'>('private');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const dispatch = useAppDispatch();
  const { items: checkins, isLoading, isCreating } = useAppSelector((s) => s.checkins);
  const { connectedPartners, groups } = useAppSelector((s) => s.invitation);
  const { streaks } = useAppSelector((s) => s.streaks);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const invitationLoading = useAppSelector((s) => s.invitation.loading);

  const partnerChoices = (connectedPartners || []).map((p) => ({
    id: p.partner?.id ?? p.id,
    name: p.partner ? `${p.partner.firstName} ${p.partner.lastName}` : 'Partner',
  }));

  // Safely determine if there's a check-in for today (avoid toISOString on invalid dates)
  const today = new Date();
  const isValidDate = (d: Date) => !isNaN(d.getTime());
  const isSameUTCDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
  const hasCheckedInToday = checkins.some((c) => {
    if (!c?.createdAt) return false;
    const d = new Date(c.createdAt);
    if (!isValidDate(d)) return false;
    return isSameUTCDay(d, today);
  });

  /**
   * Handle relapse
   */
  const handleRelapsed = () => {
    Alert.alert(
      'Record a Relapse',
      'This will reset your streak count to 0. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, I Relapsed',
          onPress: async () => {
            try {
              // Create a check-in with status "relapse"
              await dispatch(createCheckIn({
                mood: 0.25, // Default to a low mood for relapse
                note: 'I struggled today and relapsed.',
                visibility: 'private',
                status: 'relapse'
              })).unwrap();

              // Clear celebrated milestones so future milestones in a new streak can celebrate again
              try {
                await AsyncStorage.removeItem('ph_milestones_celebrated');
              } catch {}
               
              Alert.alert('Streak Reset', 'Your relapse has been recorded and your streak has been reset to 0. Remember, tomorrow is a new day to start fresh!');
              // Refresh streaks data and check-ins
              dispatch(getStreaks());
              dispatch(fetchCheckIns({ page: 1, limit: 50 }));
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to record relapse');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  /**
   * Calculate days to next milestone
   */
  const calculateNextMilestone = (currentDays: number) => {
    const milestones = [7, 14, 30, 60, 90, 180, 270, 365];
    
    // Find the next milestone
    for (const milestone of milestones) {
      if (currentDays < milestone) {
        return {
          current: currentDays,
          next: milestone,
          daysToGo: milestone - currentDays
        };
      }
    }
    
    // If passed all milestones, use yearly milestones (365 days)
    const yearsMilestone = Math.ceil(currentDays / 365) * 365;
    
    return {
      current: currentDays,
      next: yearsMilestone,
      daysToGo: yearsMilestone - currentDays
    };
  };

  /**
   * Handle daily check-in submission
   */
  const handleDailyCheckin = () => {
    // This function is no longer used directly by buttons
    // We're now handling check-in and view check-ins separately
    if (!hasCheckedInToday) {
      setCheckinVisible(true);
      setShowConfetti(true);
    } else if (navigation) {
      navigation.navigate('CheckInHistory');
    }
  };

 

  /**
   * Handle prayer request
   */
  const handlePrayerRequest = () => {
    navigation?.navigate('PrayerRequests');
  };

  /**
   * Handle share victory
   */
  const handleShareVictory = () => {
    navigation?.navigate('CreateVictory');
  };

  /**
   * Handle invite partner
   */
  const [inviteVisible, setInviteVisible] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [customCode, setCustomCode] = useState('');
  // We no longer display generated invite; we store any generated code into the custom code field

  const [acceptVisible, setAcceptVisible] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [accepting, setAccepting] = useState(false);

  const handleInvitePartner = () => {
    setInviteVisible(true);
  };

  const handleEmailInputSubmit = () => {
    const newEmails = currentEmail.split(',')
      .map(email => email.trim())
      .filter(Boolean);

    if (newEmails.length === 0) return;

    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    newEmails.forEach(email => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (validEmails.length > 0) {
      setEmails(prevEmails => [...prevEmails, ...validEmails]);
    }

    if (invalidEmails.length > 0) {
      Alert.alert('Invalid or Duplicate Email', `The following emails could not be added: ${invalidEmails.join(', ')}`);
    }

    setCurrentEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleGenerateInvite = () => {
    const newHash = generateInvitationHash();
    setCustomCode(newHash);
  };

  const handleEmailSend = async () => {
    if (emails.length === 0) {
      Alert.alert('No emails', 'Add at least one email to send invitations.');
      return;
    }
    try {
      const payload = { emails, hash: customCode?.trim() || undefined } as any;
      await dispatch(sendInvitesByEmail(payload)).unwrap();
      Alert.alert('Invitations sent', 'Your invitations have been sent successfully.');
    } catch (e: any) {
      Alert.alert('Send failed', e?.message || 'Failed to send invitations.');
    }
  };

  const handleAcceptPartner = async () => {
    const code = partnerCode.trim();
    if (!code) return;
    try {
      setAccepting(true);
      await dispatch(acceptByCode(code)).unwrap();
      setAcceptVisible(false);
      setPartnerCode('');
      await dispatch(fetchPartners());
      Alert.alert('Connected', 'You are now connected as accountability partners.');
    } catch (e: any) {
      Alert.alert('Join failed', e?.message || 'Invalid or expired code');
    } finally {
      setAccepting(false);
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



  useEffect(() => {
    // Load check-ins to compute today's status and partners for selection
    dispatch(fetchCheckIns({ page: 1, limit: 50 }));
    dispatch(fetchPartners());
    dispatch(getStreaks());
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Streak pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(streakPulse, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(streakPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered card animations
    Object.values(cardAnimations).forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    });
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(resetCheckinStatus());
      dispatch(fetchCheckIns({ page: 1, limit: 50 }));
      dispatch(fetchPartners());
      dispatch(getStreaks());
    }, [dispatch]) // Removed loadGroups from dependencies to prevent infinite loop
  );

  // Show confetti once when a new milestone is reached (persisted via AsyncStorage)
  useEffect(() => {
    const run = async () => {
      const currentStreak = streaks?.currentStreak ?? 0;
      if (currentStreak <= 0) return;

      // Define milestone logic: base milestones + yearly multiples beyond 365
      const baseMilestones = [7, 14, 30, 60, 90, 180, 270, 365];
      let reached: number | null = null;

      if (baseMilestones.includes(currentStreak)) {
        reached = currentStreak;
      } else if (currentStreak > 365 && currentStreak % 365 === 0) {
        reached = currentStreak; // e.g., 730, 1095, ...
      }

      if (!reached) return;

      try {
        const key = 'ph_milestones_celebrated';
        const raw = await AsyncStorage.getItem(key);
        const celebrated: number[] = raw ? JSON.parse(raw) : [];

        if (!celebrated.includes(reached)) {
          // Trigger confetti and persist this milestone as celebrated
          setShowConfetti(true);
          const updated = [...celebrated, reached];
          await AsyncStorage.setItem(key, JSON.stringify(updated));
        }
      } catch {
        // Fail silently; milestone confetti is a non-critical enhancement
      }
    };

    run();
    // Only when streak count changes
  }, [streaks?.currentStreak]);

  const submitCheckIn = async () => {
    try {
      const payload: any = {
        mood: Math.max(0, Math.min(1, moodValue)),
        note: note?.trim() || undefined,
        status: 'victory', // Explicitly set status to victory for normal check-ins
        isAutomatic: false, // Explicitly set to false for manual check-ins
      };
      
      if (visibilityOption === 'private') {
        payload.visibility = 'private';
      } else if (visibilityOption === 'group') {
        payload.visibility = 'group';
        payload.groupIds = selectedGroupIds;
        
        // Validate group selection
        if (!selectedGroupIds || selectedGroupIds.length === 0) {
          Alert.alert('Group Required', 'Please select at least one group to share with.');
          return;
        }
      } else {
        // Handle partner visibility options
        payload.visibility = 'partner';
        
        if (visibilityOption === 'allPartners') {
          payload.partnerIds = partnerChoices.map((p) => p.id);
          
          // Validate that user has partners
          if (!partnerChoices || partnerChoices.length === 0) {
            Alert.alert('No Partners', 'You don\'t have any connected partners yet. Please invite partners first or choose private visibility.');
            return;
          }
        } else if (visibilityOption === 'selectPartners') {
          payload.partnerIds = selectedPartnerIds;
          
          // Validate partner selection
          if (!selectedPartnerIds || selectedPartnerIds.length === 0) {
            Alert.alert('Partner Required', 'Please select at least one partner to share with.');
            return;
          }
        }
      }
      
      await dispatch(createCheckIn(payload)).unwrap();
      setCheckinVisible(false);
      setNote('');
      setSelectedPartnerIds([]);
      setSelectedGroupIds([]);
      setVisibilityOption('private');
      await dispatch(fetchCheckIns({ page: 1, limit: 50 }));
      Alert.alert('Victory Recorded!', 'Your daily victory has been saved. Keep going strong! 💪');
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.message || 'Unable to create check-in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScreenHeader title="Home" navigation={navigation} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            autoStart={true}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        )}
        
        {/* Enhanced Streak Card */}
        <Animated.View
          style={[
            {
              opacity: cardAnimations.streak,
              transform: [
                {
                  translateY: cardAnimations.streak.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                { scale: streakPulse },
              ],
            },
          ]}
        >
          <Surface style={styles.streakCard} elevation={3}>
            <View style={styles.streakIconContainer}>
              <Icon name="flame" color={Colors.primary.main} size="xl" />
            </View>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakNumber}>{streaks?.currentStreak ?? 0}</Text>
            <Text style={styles.streakUnit}>days strong</Text>
            
            {/* Display current progress towards milestone */}
            {(() => {
              const currentStreak = streaks?.currentStreak ?? 0;
              const { next } = calculateNextMilestone(currentStreak);
              
              let scripture = '';
              if (currentStreak === 0) {
                scripture = '"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out." - 1 Corinthians 10:13';
              } else if (currentStreak <= 7) {
                scripture = '"Submit yourselves, then, to God. Resist the devil, and he will flee from you." - James 4:7';
              } else if (currentStreak <= 30) {
                scripture = '"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery." - Galatians 5:1';
              } else if (currentStreak <= 90) {
                scripture = '"I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God." - Galatians 2:20';
              } else if (currentStreak <= 180) {
                scripture = '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" - 2 Corinthians 5:17';
              } else if (currentStreak <= 365) {
                scripture = '"You, dear children, are from God and have overcome them, because the one who is in you is greater than the one who is in the world." - 1 John 4:4';
              } else {
                scripture = '"Then you will know the truth, and the truth will set you free... So if the Son sets you free, you will be free indeed." - John 8:32,36';
              }
              
              return (
                <>
                  <View style={styles.streakMilestoneContainer}>
                    <Text style={styles.streakMilestoneProgress}>
                      <Text style={styles.streakMilestoneHighlight}>{currentStreak}</Text> of <Text style={styles.streakMilestoneHighlight}>{next}</Text> days
                    </Text>
                  </View>
                  <View style={styles.scriptureContainer}>
                    <Text style={styles.scriptureText}>{scripture}</Text>
                  </View>
                </>
              );
            })()}
            
            <View style={styles.streakProgressContainer}>
              <View style={styles.streakProgress}>
                {/* Calculate progress percentage based on the next milestone */}
                {(() => {
                  const currentStreak = streaks?.currentStreak ?? 0;
                  const { next, daysToGo } = calculateNextMilestone(currentStreak);
                  // Calculate progress percentage based on the next milestone
                  const progressPercentage = Math.min((currentStreak / next) * 100, 100);
                  
                  // Check if current streak is exactly on a milestone
                  const milestones = [7, 14, 30, 60, 90, 180, 270, 365];
                  const isExactMilestone = milestones.includes(currentStreak);
                  
                  // Check if we've reached a year or more
                  const years = Math.floor(currentStreak / 365);
                  const remainingDays = currentStreak % 365;
                  
                  // Customize message based on progress
                  let milestoneMessage = '';
                  
                  if (years >= 1) {
                    if (remainingDays === 0) {
                      // Exactly X years
                      const yearText = years === 1 ? "year" : "years";
                      milestoneMessage = `🏆 Amazing! ${years} ${yearText} of victory! Keep going strong!`;
                    } else {
                      // X years and Y days
                      const yearText = years === 1 ? "year" : "years";
                      milestoneMessage = `${daysToGo} days to next milestone`;
                    }
                  } else if (isExactMilestone) {
                    milestoneMessage = `🎉 Congratulations on reaching your milestone!`;
                  } else if (daysToGo === 1) {
                    milestoneMessage = `Just 1 more day to go!`;
                  } else if (daysToGo <= 3) {
                    milestoneMessage = `Almost there! ${daysToGo} days to go`;
                  } else {
                    milestoneMessage = `${daysToGo} days to next milestone`;
                  }
                  
                  return (
                    <>
                      <View 
                        style={[
                          styles.streakProgressFill, 
                          { width: `${progressPercentage}%` }
                        ]} 
                      />
                      <Text 
                        style={[
                          styles.streakMilestoneText, 
                          { marginTop: 4 },
                          (isExactMilestone || (years >= 1 && remainingDays === 0)) && styles.streakMilestoneCelebration
                        ]}
                      >
                        {milestoneMessage}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
          </Surface>
        </Animated.View>


        {/* Enhanced Daily Check-In Section */}
        <Animated.View
          style={[
            {
              opacity: cardAnimations.checkin,
              transform: [
                {
                  translateY: cardAnimations.checkin.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Surface style={styles.checkInCard} elevation={2}>
            <View style={styles.checkInHeader}>
              <Icon name="heart" color={Colors.primary.main} size="lg" style={styles.checkInIcon} />
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Daily Check-In</Text>
              </View>
              {hasCheckedInToday && (
                <View style={styles.checkInStatusBadge}>
                  <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                </View>
              )}
            </View>
            
            <Text style={styles.checkInQuestion}>How's your heart today?</Text>
            
            {/* Enhanced Mood Slider */}
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

          {hasCheckedInToday && (
            <View style={styles.checkedInStatusContainer}>
              <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
              <Text style={styles.checkedInStatusText}>You have checked in today! (revelations 12:11 NIV) 🎉</Text>
            </View>
          )}

          <View style={styles.checkInButtonsContainer}>
            <Button
              mode="contained"
              onPress={() => {
                setCheckinVisible(true);
                setShowConfetti(true);
              }}
              style={styles.checkInButton}
              contentStyle={styles.shareScriptureContent}
              labelStyle={styles.shareScriptureLabel}
              buttonColor={Colors.primary.main}
              loading={isCreating}
              disabled={isCreating || hasCheckedInToday}
            >
              I Overcame Today! 😊
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CheckInHistory')}
              style={styles.viewCheckinButton}
              contentStyle={styles.shareScriptureContent}
              labelStyle={styles.shareScriptureLabel}
              buttonColor={Colors.white}
            >
              View Check-ins
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleRelapsed}
              style={styles.relapsedButton}
              contentStyle={styles.shareScriptureContent}
              labelStyle={[styles.shareScriptureLabel, {color: Colors.error.main}]}
              buttonColor={Colors.white}
              textColor={Colors.error.main}
              disabled={hasCheckedInToday}
            >
              I Relapsed Today 😔
            </Button>
          </View>
        </Surface>
        </Animated.View>

        {/* Enhanced Quick Actions Section */}




        <Portal>
          {/* Modal: Daily Check-in */}
          <Modal visible={checkinVisible} onDismiss={() => setCheckinVisible(false)} contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}>
            <Text style={styles.sectionTitle}>I Overcame Today! 😊</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>Record your victory and choose who to share it with.</Text>

            {/* Mood input slider 0..1 */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: Colors.text.secondary, marginBottom: 8 }}>Mood: {Math.round(moodValue * 100)}%</Text>
              <Slider
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={moodValue}
                onValueChange={setMoodValue}
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.background.tertiary}
                thumbTintColor={Colors.primary.main}
              />
            </View>

            {/* Visibility options */}
            <View style={styles.visibilityContainer}>
              <Chip
                selected={visibilityOption === 'private'}
                onPress={() => setVisibilityOption('private')}
                style={styles.chip}
              >
                Private
              </Chip>
              <Chip
                selected={visibilityOption === 'allPartners'}
                onPress={() => setVisibilityOption('allPartners')}
                style={styles.chip}
              >
                All Partners
              </Chip>
              <Chip
                selected={visibilityOption === 'selectPartners'}
                onPress={() => setVisibilityOption('selectPartners')}
                style={styles.chip}
              >
                Select Partners
              </Chip>
              <Chip
                selected={visibilityOption === 'group'}
                onPress={() => setVisibilityOption('group')}
                style={styles.chip}
              >
                Group
              </Chip>
            </View>

            {visibilityOption === 'selectPartners' && (
              <>
                <PartnerGroupSelector
                  partners={connectedPartners}
                  groups={[]}
                  selectedPartners={selectedPartnerIds}
                  selectedGroups={[]}
                  onPartnerSelectionChange={setSelectedPartnerIds}
                  onGroupSelectionChange={() => {}}
                />
                {(!selectedPartnerIds || selectedPartnerIds.length === 0) && (
                  <Text style={{ color: Colors.error.main, fontSize: 12, marginTop: 4 }}>
                    Please select at least one partner to share with
                  </Text>
                )}
              </>
            )}
            {visibilityOption === 'group' && (
              <>
                <PartnerGroupSelector
                  partners={[]}
                  groups={groups}
                  selectedPartners={[]}
                  selectedGroups={selectedGroupIds}
                  onPartnerSelectionChange={() => {}}
                  onGroupSelectionChange={setSelectedGroupIds}
                />
                {(!selectedGroupIds || selectedGroupIds.length === 0) && (
                  <Text style={{ color: Colors.error.main, fontSize: 12, marginTop: 4 }}>
                    Please select at least one group to share with
                  </Text>
                )}
              </>
            )}
            {visibilityOption === 'allPartners' && (!partnerChoices || partnerChoices.length === 0) && (
              <Text style={{ color: Colors.error.main, fontSize: 12, marginTop: 4 }}>
                You don't have any connected partners yet. Please invite partners first or choose private visibility.
              </Text>
            )}

            {/* Note input */}
            <TextInput
              mode="outlined"
              value={note}
              onChangeText={setNote}
              placeholder="Add an optional note"
              multiline
              style={{ marginBottom: 12 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button mode="text" onPress={() => setCheckinVisible(false)}>Cancel</Button>
              <Button 
                mode="contained" 
                onPress={submitCheckIn} 
                disabled={
                  isCreating || 
                  (visibilityOption === 'selectPartners' && (!selectedPartnerIds || selectedPartnerIds.length === 0)) ||
                  (visibilityOption === 'allPartners' && (!partnerChoices || partnerChoices.length === 0)) ||
                  (visibilityOption === 'group' && (!selectedGroupIds || selectedGroupIds.length === 0))
                } 
                loading={isCreating}
              >
                Save Check-in
              </Button>
            </View>
          </Modal>
          {/* Modal: Invite Partner */}
          <Modal
            visible={inviteVisible}
            onDismiss={() => {
              setInviteVisible(false);
              setCurrentEmail('');
              setEmails([]);
              setCustomCode('');
            }}
            contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}
          >
            <Text style={styles.sectionTitle}>Invite Accountability Partner</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>
              Add email addresses. A code will be generated and sent unless you specify a custom code below.
            </Text>

            {/* Chips */}
            {emails.length > 0 && (
              <View style={styles.chipContainer}>
                {emails.map((email, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    onClose={() => removeEmail(email)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {email}
                  </Chip>
                ))}
        </View>
        )}

            <TextInput
              mode="outlined"
              label="Add email(s)"
              placeholder="friend@example.com, partner@work.com"
              value={currentEmail}
              onChangeText={setCurrentEmail}
              onSubmitEditing={handleEmailInputSubmit}
              onBlur={handleEmailInputSubmit}
              style={styles.emailInput}
              autoCapitalize="none"
              keyboardType="email-address"
              right={
                currentEmail.trim() ? (
                  <TextInput.Icon
                    icon="plus"
                    onPress={handleEmailInputSubmit}
                  />
                ) : null
              }
            />

            <TextInput
              mode="outlined"
              value={customCode}
              onChangeText={setCustomCode}
              placeholder="Optional custom code (starts with ph_)"
              style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button
                mode="outlined"
                onPress={handleGenerateInvite}
                loading={invitationLoading}
                disabled={invitationLoading}
              >
                Generate Code
              </Button>
              <Button
                mode="contained"
                onPress={handleEmailSend}
                disabled={invitationLoading || emails.length === 0}
              >
                Invite Partners
              </Button>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button mode="text" onPress={() => { setInviteVisible(false); }}>Close</Button>
        </View>
          </Modal>

          {/* Modal: Accept Partner by Code */}
          {/* Keep accept-by-code modal accessible via a clear button elsewhere */}
          <Modal
            visible={acceptVisible}
            onDismiss={() => { setAcceptVisible(false); setPartnerCode(''); }}
            contentContainerStyle={{ backgroundColor: Colors.background.secondary, margin: 16, padding: 16, borderRadius: 12 }}
          >
            <Text style={styles.sectionTitle}>Join as Partner by Code</Text>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>Enter the code you received to become partners.</Text>
            <TextInput
              mode="outlined"
              value={partnerCode}
              onChangeText={setPartnerCode}
              placeholder="Enter invite code (e.g., ph_...)"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button mode="text" onPress={() => { setAcceptVisible(false); setPartnerCode(''); }}>Cancel</Button>
              <Button mode="contained" onPress={handleAcceptPartner} loading={accepting} disabled={accepting || !partnerCode.trim()}>
                Accept
              </Button>
            </View>
          </Modal>

        </Portal>

        {/* Victory Stories Section */}


        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  // Enhanced Header
  header: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Streak Card
  streakCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
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
  streakMilestoneProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error.main,
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'center',
  },
  streakMilestoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: Colors.error.light + '15',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  streakMilestoneHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.error.main,
  },

  // Daily Check-in Section
  checkInCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
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
  checkInButtonsContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
  checkedInStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary.main}10`,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkedInStatusText: {
    marginLeft: 8,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  checkInButton: {
    borderRadius: 8,
  },
  viewCheckinButton: {
    borderRadius: 8,
    borderColor: Colors.primary.main,
  },
  relapsedButton: {
    borderRadius: 8,
    borderColor: Colors.error.main,
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
  sectionHeaderSmall: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
    marginLeft: 12,
  },
  headerActionsRowSmall: {
    flexWrap: 'wrap',
    rowGap: 8,
    maxWidth: '60%',
    marginTop: 8,
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
  createButtonTextSmall: {
    fontSize: 11,
   },
  sectionTitleSmall: {
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: `${Colors.primary.main}10`,
    borderColor: Colors.primary.main,
  },
  chipText: {
    color: Colors.text.primary,
  },
  emailInput: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
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
  seeAllButton: {
    marginTop: 16,
    marginHorizontal: 8,
  },
  radioOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visibilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  
  // Enhanced Streak Card Styles
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.error.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  streakProgress: {
    height: 10, // Increased height for better visibility
    backgroundColor: '#e5e7eb', // Light gray background
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#22c55e', // Green color to indicate positive progress
    borderRadius: 5,
    // Add animation effect
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  streakMilestone: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.error.light + '20',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error.main,
  },
  streakMilestoneText: {
    fontSize: 12,
    color: Colors.error.main,
    fontWeight: '600',
  },
  streakMilestoneCelebration: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error.main,
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: Colors.error.light + '20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  streakProgressContainer: {
    width: '100%',
    marginBottom: 4,
  },
  
  // Enhanced Check-in Styles
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInIcon: {
    marginRight: 8,
  },
  checkInStatusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary.light + '30',
  },
  checkInStatusText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scriptureContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary.light + '15',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  scriptureText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default OldHomeScreen;