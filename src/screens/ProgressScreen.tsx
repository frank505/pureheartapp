/**
 * ProgressScreen Component
 * 
 * Progress & Victory Dashboard with comprehensive tracking.
 * Features streak counters, achievements, calendar view, and growth analytics.
 * Designed to celebrate spiritual victories and track consistent growth.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
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
import { Colors, Icons } from '../constants';

interface ProgressScreenProps {
  navigation?: any;
  route?: any;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('2024-05-10');
  
  // Current streak data
  const currentStreak = 10;
  const nextMilestone = 14;
  const daysToMilestone = nextMilestone - currentStreak;

  // Get screen dimensions for chart
  const screenWidth = Dimensions.get('window').width;

  // Victory days for calendar marking
  const victoryDays = {
    '2024-05-05': { selected: false, marked: true, dotColor: Colors.primary.main },
    '2024-05-06': { selected: false, marked: true, dotColor: Colors.primary.main },
    '2024-05-07': { selected: false, marked: true, dotColor: Colors.primary.main },
    '2024-05-08': { selected: false, marked: true, dotColor: Colors.primary.main },
    '2024-05-09': { selected: false, marked: true, dotColor: Colors.primary.main },
    '2024-05-10': { 
      selected: true, 
      marked: true, 
      selectedColor: '#22c55e',
      selectedTextColor: Colors.white 
    },
  };

  // Chart data for weekly progress
  const chartData = {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        data: [45, 60, 68, 75],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Primary blue
        strokeWidth: 3,
      },
    ],
  };

  // Chart configuration
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

  // Achievement badges
  const achievements = [
    {
      id: 1,
      name: '7-Day Streak Badge',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGjKfvLSzk33qq6scH38wgWeidZ9Ho0g4A6mCNhG5B1pt-FYi9MMfXj6FWOd1PjfJ4RzXbX8SwzndPpFhZQDfh5mDU_tJhD7GI4LXf_GwhAjkzzKiE6CYSB6rnW7849JKQ9Fy2p0Sd6P1coZYrFIAepvvGq5Gto6Kbpma_62RcEyVzozSuHBGnPszR7GBxh77zec9ar5lgGAtg0LvCPxt7WZLVKK75xmWwcmdl_lXssYhAoPscZYrPD8yJIw0GZxxesompu6-GNudZ',
      unlocked: true,
    },
    {
      id: 2,
      name: 'First Victory Badge',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrClQdnwC-onQjPnar1O6b2ZonZ5JjQP9RaypKpg44wrlSJvC_NFTPtRJfx0xvohnL1anzk6si-GjWIv26O1bjPxIrffmn87m_d802xXjLyTk7luU1Irp7-kO5h48PwguNagAC7sqT_cwfllRUZAGiwQ2qXmYcFrdhw3bwAkNyLIhKDDqcjmYnSrxhMY-9SfxzVwoFeqHc8MnzzUglu8DzNoQLenSzvn5eFFW0DofA69PswSoeDG9EoNFjFlNsoPbMIt4T9kGKTf8h',
      unlocked: true,
    },
    {
      id: 3,
      name: 'Prayer Warrior Badge',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2jSnT6Qn3nfo-35YXAZRnycP1owhxL5Qml3fBTdtKWKikTnE-oC-mCQWfL3alg_8I-nIbEMom1r1ZOV8gccNEe2G2ijzsE7ejxDo5B2Y8ZktpYKT4ig_lNFrwWsWWiqyJ_TDzaSMRTUJBB74IPpEJSmYKKitoUITnt7ShlUm5NPaWeNSaGb5Bdp3tdOXW3_bnbbExaSjRRQdLUNPT8lEpD4Thza74V9o3OEQ1jgr2g9x48dB8R0gsbJedqLI2iG2sx8xYOeR5H-m_',
      unlocked: true,
    },
  ];

  // Handle calendar day selection
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    // Here you could add logic to mark/unmark victory days
    console.log('Selected day:', day.dateString);
  };

  // Handle month change
  const handleMonthChange = (month: any) => {
    console.log('Month changed to:', month);
  };

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
              markedDates={victoryDays}
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
              <View>
                <Text style={styles.analyticsLabel}>Weekly Progress</Text>
                <Text style={styles.analyticsValue}>75%</Text>
              </View>
              <View style={styles.analyticsChange}>
                <Text style={styles.analyticsChangeValue}>+10%</Text>
                <Text style={styles.analyticsChangeLabel}>vs Last 4 Weeks</Text>
              </View>
            </View>
            
            {/* Real Growth Chart */}
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 64} // Account for padding
                height={160}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={true}
                withScrollableDot={false}
              />
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
});

export default ProgressScreen;