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
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import { Colors } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAchievements, fetchAnalytics, fetchCalendar } from '../store/slices/progressSlice';
import { getStreaks } from '../store/slices/streaksSlice';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

interface ProgressScreenProps {
  navigation?: any;
  route?: any;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { achievements, analytics, calendar, loading, error } = useAppSelector((state) => state.progress);
  const { streaks } = useAppSelector((state) => state.streaks);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    dispatch(fetchAchievements());
    dispatch(fetchAnalytics('last_4_weeks'));
    dispatch(fetchCalendar(currentMonth));
    dispatch(getStreaks());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getStreaks());
    }, [dispatch])
  );

  const screenWidth = Dimensions.get('window').width;

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
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Progress & Victory</Text>
        <ProfileDropdown navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Current Streak */}
        <View style={styles.heroSection}>
          <View style={styles.streakCircle}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>days</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Keep going, you're on a roll!</Text>
          <Text style={styles.heroSubtitle}>Next milestone in {daysToMilestone} days.</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statUnit}>days</Text>
          </Surface>
          
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statLabel}>Next Milestone</Text>
            <Text style={styles.statValue}>{nextMilestone}</Text>
            <Text style={styles.statUnit}>days</Text>
          </Surface>
        </View>

        {/* Daily Victories Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Victories</Text>
          <Surface style={styles.calendarCard} elevation={2}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDayPress}
              onMonthChange={handleMonthChange}
              markedDates={{
                ...calendar,
                [selectedDate]: {
                  ...calendar[selectedDate],
                  selected: true,
                  selectedColor: '#22c55e',
                  selectedTextColor: Colors.white,
                }
              }}
              theme={{
                backgroundColor: Colors.background.secondary,
                calendarBackground: Colors.background.secondary,
                textSectionTitleColor: Colors.text.secondary,
                selectedDayBackgroundColor: '#22c55e',
                selectedDayTextColor: Colors.white,
                todayTextColor: Colors.primary.main,
                dayTextColor: Colors.text.primary,
                textDisabledColor: Colors.text.secondary,
                dotColor: Colors.primary.main,
                selectedDotColor: Colors.white,
                arrowColor: Colors.text.primary,
                disabledArrowColor: Colors.text.secondary,
                monthTextColor: Colors.text.primary,
                textMonthFontWeight: '700',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                textDayHeaderFontWeight: '700',
              }}
              style={styles.calendar}
            />
          </Surface>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <Surface key={achievement.id} style={styles.achievementCard} elevation={2}>
                <Image 
                  source={{ uri: achievement.image }}
                  style={styles.achievementImage}
                  resizeMode="contain"
                />
              </Surface>
            ))}
            
            {/* Placeholder for next achievement */}
            <Surface style={styles.achievementPlaceholder} elevation={1}>
              <Icon 
                name="add-outline" 
                color={Colors.text.secondary} 
                size="lg" 
              />
            </Surface>
          </View>
        </View>

        {/* Growth Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Analytics</Text>
          <Surface style={styles.analyticsCard} elevation={2}>
            <View style={styles.analyticsHeader}>
              <View style={styles.analyticsProgress}>
                <Text style={styles.analyticsLabel}>Weekly Progress</Text>
                <Text style={styles.analyticsValue}>{analytics?.weeklyProgress?.data?.slice(-1)[0] ?? 0}%</Text>
              </View>
              <View style={styles.analyticsChange}>
                <Text style={styles.analyticsChangeValue}>
                  {(analytics?.weeklyChange?.value ?? 0) >= 0 ? '+' : ''}
                  {analytics?.weeklyChange?.value ?? 0}%
                </Text>
                <Text style={styles.analyticsChangeLabel}>{analytics?.weeklyChange?.label}</Text>
              </View>
            </View>
            
            {/* Real Growth Chart */}
            <View style={styles.chartContainer}>
              {(analytics?.weeklyProgress?.data?.length ?? 0) > 0 ? (
                <LineChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={160}
                  chartConfig={chartConfig}
                  bezier={(analytics?.weeklyProgress?.data?.length ?? 0) > 1}
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={true}
                  withScrollableDot={false}
                />
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Text style={styles.chartPlaceholderText}>
                    Not enough data to display chart.
                  </Text>
                </View>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
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
    width: 80,
    height: 80,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  achievementImage: {
    width: '100%',
    height: '100%',
  },
  achievementPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: `${Colors.background.tertiary}80`, // 50% opacity
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.text.secondary}80`, // 50% opacity
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