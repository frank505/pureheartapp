/**
 * ProgressScreen Component
 * 
 * Progress & Victory Dashboard with comprehensive tracking.
 * Features streak counters, achievements, calendar view, and growth analytics.
 * Designed to celebrate spiritual victories and track consistent growth.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { Icon, ProfileDropdown, ScreenHeader } from '../components';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors, ColorUtils } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAchievements, fetchAnalytics, fetchCalendar, fetchFeaturesAndBadges } from '../store/slices/progressSlice';
import { getStreaks } from '../store/slices/streaksSlice';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';

interface ProgressScreenProps {
  navigation?: any;
  route?: any;
}

// Component to handle image loading with fallback
const ImageWithFallback: React.FC<{
  uri: string;
  style: any;
  fallbackIcon?: string;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
}> = ({ uri, style, fallbackIcon = '🏆', resizeMode = 'contain' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Text style={[style, { textAlign: 'center', fontSize: 28 }]}>{fallbackIcon}</Text>;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        console.warn(`Failed to load image: ${uri}`);
        setHasError(true);
      }}
    />
  );
};

// Component to handle SVG loading with fallback
const SvgWithFallback: React.FC<{
  uri: string;
  width: number;
  height: number;
  fallbackIcon?: string;
}> = ({ uri, width, height, fallbackIcon = '🏆' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Text style={{ fontSize: 28, textAlign: 'center' }}>{fallbackIcon}</Text>;
  }

  return (
    <SvgUri
      uri={uri}
      width={width}
      height={height}
      onError={() => {
        console.warn(`Failed to load SVG: ${uri}`);
        setHasError(true);
      }}
    />
  );
};

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { achievements, analytics, calendar, features, badges, loading, error } = useAppSelector((state) => state.progress);
  const { streaks } = useAppSelector((state) => state.streaks);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  


 
  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    dispatch(fetchAchievements());
    dispatch(fetchAnalytics('last_4_weeks'));
    dispatch(fetchCalendar(currentMonth));
    dispatch(fetchFeaturesAndBadges());
    dispatch(getStreaks());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getStreaks());
    }, [dispatch])
  );

  const screenWidth = Dimensions.get('window').width;

  // Deterministic color palette for cards (bright vs faded per unlocked state)
  const PALETTE = [
    Colors.primary.main,
    Colors.secondary.main,
    Colors.warning.main,
    Colors.error.main,
    Colors.social.facebook,
    Colors.social.twitter,
    Colors.primary.light,
  ];

  const hashStringToIndex = (str: string, modulo: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % modulo;
  };

  const getCardColors = (seed: string, unlocked: boolean) => {
    const base = PALETTE[hashStringToIndex(seed, PALETTE.length)];
    return {
      backgroundColor: ColorUtils.withOpacity(base, unlocked ? 0.28 : 0.12),
      borderColor: ColorUtils.withOpacity(base, unlocked ? 0.9 : 0.4),
    } as const;
  };

  // Gradient helper to keep colors valid and consistent
  const getGradientColors = (seed: string, unlocked: boolean) => {
    const base = PALETTE[hashStringToIndex(seed, PALETTE.length)];
    return unlocked
      ? [ColorUtils.withOpacity(base, 0.9), ColorUtils.withOpacity(base, 0.6), ColorUtils.withOpacity(base, 0)]
      : [ColorUtils.withOpacity(base, 0.4), ColorUtils.withOpacity(base, 0.12), ColorUtils.withOpacity(base, 0)];
  };

  const chartData = {
    labels: analytics?.weeklyProgress?.labels || [],
    datasets: [
      {
        data: analytics?.weeklyProgress?.data || [],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.background.secondary,
    backgroundGradientFrom: Colors.background.secondary,
    backgroundGradientTo: Colors.background.secondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary.main,
    },
    fillShadowGradient: Colors.primary.main,
    fillShadowGradientOpacity: 0.3,
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    console.log('Selected day:', day.dateString);
  };

  const handleMonthChange = (month: any) => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;
    dispatch(fetchCalendar(monthString));
  };

  if (loading && !analytics) {
    return (
      <SafeAreaView style={[styles.container]}>
        <View style={{ padding: 16 }}>
          <SkeletonPlaceholder
            backgroundColor={Colors.background.secondary}
            highlightColor={Colors.background.tertiary}
          >
            <View>
              {/* Header title skeleton */}
              <View style={{ width: '60%', height: 24, borderRadius: 6, marginBottom: 20 }} />

              {/* Features grid skeleton (2x2) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={{ width: '47%', aspectRatio: 1, borderRadius: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, borderRadius: 12 }} />
                  </View>
                ))}
              </View>

              {/* Badges grid skeleton (2x2) */}
              <View style={{ width: '50%', height: 20, borderRadius: 6, marginTop: 8, marginBottom: 20 }} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={`b-${i}`} style={{ width: '47%', aspectRatio: 1, borderRadius: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, borderRadius: 12 }} />
                  </View>
                ))}
              </View>
            </View>
          </SkeletonPlaceholder>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load progress data.</Text>
      </SafeAreaView>
    );
  }

  const currentStreak = streaks?.currentStreak ?? 0;
  const nextMilestone = analytics?.nextMilestone ?? 0;
  const daysToMilestone = Math.max(0, nextMilestone - currentStreak);

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <ScreenHeader 
          title="Quest Map" 
          navigation={navigation} 
          showBackButton={true}
          showGrowthTracker={false}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        

       

        {/* Journey Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Journey Milestones</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => {
              const dynamic = getCardColors(feature.key, feature.unlocked);
              return (
              <Surface key={feature.key} style={[styles.featureCard, feature.unlocked && styles.featureUnlocked, dynamic]} elevation={2}>
                <LinearGradient
                  colors={getGradientColors(feature.key, feature.unlocked)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBackground}
                />
                <View style={styles.featureContent}>
                  <View style={styles.featureIconContainer}>
                    <Icon 
                      name={feature.unlocked ? "checkmark-circle" : "lock-closed"} 
                      color={feature.unlocked ? "#22c55e" : Colors.text.secondary} 
                      size="xl" 
                    />
                  </View>
                  <Text style={styles.featureTitle}>
                    {feature.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <View style={styles.featureProgress}>
                    <Text style={styles.featureProgressText}>
                      {feature.unlocked 
                        ? "✅ Unlocked!" 
                        : `${feature.remainingDays} days left`
                      }
                    </Text>
                    <Text style={styles.featureThreshold}>
                      {feature.thresholdDays} day streak
                    </Text>
                  </View>
                  {feature.unlocked && (
                    <View style={styles.unlockedFeatureBadge}>
                      <Text style={styles.unlockedFeatureText}>Active</Text>
                    </View>
                  )}
                </View>
              </Surface>
            );})}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Badges Collection</Text>
          <View style={styles.achievementsGrid}>
            {badges.map((badge) => {
              try {
                const dynamic = getCardColors(`${badge.id}-${badge.code || badge.title}`, badge.unlocked);
                return (
                <Surface key={badge.id} style={[styles.achievementCard, badge.unlocked && styles.badgeUnlocked, dynamic]} elevation={2}>
                  <LinearGradient
                    colors={getGradientColors(`${badge.id}-${badge.code || badge.title}`, badge.unlocked)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBackground}
                  />
                  <View style={styles.badgeContent}>
                    {/https?:\/\//.test(badge.icon) ? (
                      <Pressable onPress={() => Linking.openURL(badge.icon)} accessibilityRole="link" accessibilityLabel={`Open ${badge.title} link`}>
                        {/\.svg(\?|$)/.test(badge.icon) ? (
                          <SvgWithFallback 
                            uri={badge.icon} 
                            width={56} 
                            height={56}
                            fallbackIcon="🏆"
                          />
                        ) : (
                          <ImageWithFallback 
                            uri={badge.icon} 
                            style={styles.badgeImage} 
                            resizeMode="contain"
                            fallbackIcon="🏆"
                          />
                        )}
                      </Pressable>
                    ) : (
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    )}
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                    {badge.unlocked ? (
                      <View style={styles.unlockedBadge}>
                        <Text style={styles.unlockedText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Icon name="lock-closed" color={Colors.text.secondary} size="sm" />
                      </View>
                    )}
                  </View>
                </Surface>
                );
              } catch (error) {
                console.warn(`Error rendering badge ${badge.id}:`, error);
                // Return a fallback badge component
                return (
                  <Surface key={badge.id} style={[styles.achievementCard, styles.fallbackCard]} elevation={2}>
                    <View style={styles.badgeContent}>
                      <Text style={styles.badgeIcon}>🏆</Text>
                      <Text style={styles.badgeTitle}>{badge.title || 'Badge'}</Text>
                      <Text style={styles.badgeDescription}>Unable to load badge</Text>
                      <View style={styles.lockedBadge}>
                        <Icon name="alert-circle" color={Colors.text.secondary} size="sm" />
                      </View>
                    </View>
                  </Surface>
                );
              }
            })}
            
          </View>
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // #111827
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error.main,
    fontSize: 16,
  },
  header: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96, // Account for bottom nav
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  streakCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#1e40af', // accent-color
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#22c55e', // success-color
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary, // card-bg
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
    color: Colors.text.secondary,
  },

  // Sections
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'left',
  },

  // Calendar
  calendarCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 8,
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementCard: {
    width: '47%',  // slightly less than 50% to account for gap
    aspectRatio: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  achievementImage: {
    width: '100%',
    height: '100%',
  },
  

  // Features
  featuresContainer: {
    gap: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',  // slightly less than 50% to account for gap
    aspectRatio: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  featureContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  featureUnlocked: {
    borderColor: '#22c55e',
    backgroundColor: `${Colors.background.secondary}`,
    borderWidth: 2,
  },
  featureIconContainer: {
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  featureProgress: {
    alignItems: 'center',
    gap: 4,
  },
  featureProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  featureThreshold: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  unlockedFeatureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unlockedFeatureText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },

  // Badges
  badgeUnlocked: {
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  fallbackCard: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.error.main,
    borderWidth: 1,
  },
  badgeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 12,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  badgeImage: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  badgeDescription: {
    fontSize: 9,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 12,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#22c55e',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unlockedText: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.white,
  },

  // Analytics
  analyticsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 24,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  analyticsProgress: {
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  analyticsChange: {
    alignItems: 'flex-end',
  },
  analyticsChangeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#22c55e', // success-color
    marginBottom: 2,
  },
  analyticsChangeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  chartPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  chartPlaceholderText: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default ProgressScreen;