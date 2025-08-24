/**
 * GrowthTrackerScreen Component
 * 
 * A dedicated screen to display the user's spiritual growth progress,
 * visualized as a growing plant with the number of days of their journey.
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentStreak } from '../store/slices/streaksSlice';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import FractalTree from '../components/FractalTree';
import { useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const GrowthTrackerScreen: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  // Get user data and streaks from Redux store
  const user = useAppSelector((state) => state.user.currentUser);
  const { streaks } = useAppSelector((state) => state.streaks);
  const currentStreak = streaks?.currentStreak ?? 0;
  
  // Hide default navigation header to avoid double headers
  useLayoutEffect(() => {
    // @ts-ignore - navigation type may not include setOptions in this context
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  
  useEffect(() => {
    // Animate the plant growth whenever streak changes
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [currentStreak]);
  
  // Calculate plant growth stage based on streak
  const getPlantStage = () => {
    if (currentStreak < 7) return 'seed';
    if (currentStreak < 30) return 'sprout';
    if (currentStreak < 90) return 'plant';
    return 'tree';
  };
  
  const plantStage = getPlantStage();
  
  // Calculate animation values
  const scaleValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  
  const opacityValue = animatedValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0.7, 1],
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size="md" color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growth Tracker</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Animated.View 
            style={[
              styles.titleContent,
              {
                opacity: animatedValue,
                transform: [{
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={[styles.title, { fontSize: 34, color: Colors.secondary.main, textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, letterSpacing: 1.2 }]}>🌱 Your Growth Journey 🌱</Text>
            <Text style={[styles.subtitle, { fontSize: 22, fontWeight: '700', color: Colors.primary.main, marginBottom: 10 }]}> 
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} of Growth
            </Text>
            {/* Scripture for each day */}
            <Text style={{ fontSize: 16, color: Colors.text.secondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 20 }}>
              {(() => {
                // Example scripture mapping, can be expanded
                const scriptures = [
                  'Philippians 4:13 - I can do all things through Christ who strengthens me.',
                  'Joshua 1:9 - Be strong and courageous. Do not be afraid; do not be discouraged.',
                  'Psalm 1:3 - He is like a tree planted by streams of water, which yields its fruit in season.',
                  'Isaiah 40:31 - Those who hope in the Lord will renew their strength.',
                  'Proverbs 3:5 - Trust in the Lord with all your heart and lean not on your own understanding.',
                  'Matthew 19:26 - With God all things are possible.',
                  'Romans 12:2 - Be transformed by the renewing of your mind.',
                  'Galatians 6:9 - Let us not become weary in doing good.',
                  'Psalm 23:1 - The Lord is my shepherd; I shall not want.',
                  'Jeremiah 29:11 - For I know the plans I have for you, declares the Lord.'
                ];
                // Pick scripture based on currentStreak, cycle if more than available
                return scriptures[(currentStreak - 1) % scriptures.length];
              })()}
            </Text>
          </Animated.View>
          <View style={styles.decorativeLine} />
        </View>
        
        <View style={styles.plantContainer}>
          <View style={styles.soil} />
          <Animated.View 
            style={[
              styles.plantImageContainer,
              {
                transform: [{ scale: scaleValue }],
                opacity: opacityValue
              }
            ]}
          >
            <FractalTree 
              level={Math.min(currentStreak, 90) / 10} 
              maxLevel={9} 
            />
          </Animated.View>
          <View style={styles.controlsContainer}>
           
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="calendar-outline" size="md" color={Colors.primary.main} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="leaf-outline" size="md" color={Colors.primary.main} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{plantStage}</Text>
              <Text style={styles.statLabel}>Stage</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="trending-up-outline" size="md" color={Colors.primary.main} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{Math.min(100, Math.round(currentStreak / 90 * 100))}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Growth Milestones</Text>
          <View style={styles.milestoneProgress}>
            <View style={styles.progressLine}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (currentStreak / 90) * 100)}%` }]} />
            </View>
          </View>
          
          <View style={styles.milestonesContainer}>

              <View style={[styles.milestone, currentStreak >= 7 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 7 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="radio-button-on-outline" size="xs" color={currentStreak >= 7 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 7 && styles.achievedMilestoneName]}>First Sprout</Text>
                <Text style={styles.milestoneDesc}>7 days - Beginning of your journey</Text>
                {currentStreak >= 7 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
            </View>

            <View style={[styles.milestone, currentStreak >= 21 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 21 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="leaf" size="sm" color={currentStreak >= 21 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 21 && styles.achievedMilestoneName]}>Growing Leaves</Text>
                <Text style={styles.milestoneDesc}>21 days - Developing healthy habits</Text>
                {currentStreak >= 21 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
            </View>

                      

            <View style={[styles.milestone, currentStreak >= 21 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 21 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="leaf-outline" size="xs" color={currentStreak >= 21 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 21 && styles.achievedMilestoneName]}>Growing Leaves</Text>
                <Text style={styles.milestoneDesc}>21 days - Developing healthy habits</Text>
                {currentStreak >= 21 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
            </View>

            <View style={[styles.milestone, currentStreak >= 30 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 30 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="git-branch-outline" size="xs" color={currentStreak >= 30 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 30 && styles.achievedMilestoneName]}>Deep Roots</Text>
                <Text style={styles.milestoneDesc}>30 days - Strong foundation formed</Text>
                {currentStreak >= 30 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
            </View>

            <View style={[styles.milestone, currentStreak >= 60 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 60 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="resize-outline" size="xs" color={currentStreak >= 60 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 60 && styles.achievedMilestoneName]}>Branching Out</Text>
                <Text style={styles.milestoneDesc}>60 days - Expanding your growth</Text>
                {currentStreak >= 60 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
            </View>

            <View style={[styles.milestone, currentStreak >= 90 && styles.achievedMilestone]}>
              <View style={styles.milestoneIconContainer}>
                <View style={[styles.milestoneIcon, { backgroundColor: currentStreak >= 90 ? Colors.secondary.main : Colors.background.secondary }]} />
                <Icon name="flower-outline" size="xs" color={currentStreak >= 90 ? Colors.white : Colors.text.secondary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, currentStreak >= 90 && styles.achievedMilestoneName]}>Flourishing Tree</Text>
                <Text style={styles.milestoneDesc}>90 days - Full spiritual maturity</Text>
                {currentStreak >= 90 && <Text style={styles.achievementDate}>Achieved!</Text>}
              </View>
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
    backgroundColor: Colors.background.primary,
  },
  milestoneProgress: {
    height: 4,
    backgroundColor: Colors.background.secondary,
    borderRadius: 2,
    marginBottom: 25,
    overflow: 'hidden',
  },
  progressLine: {
    height: '100%',
    backgroundColor: Colors.background.secondary,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.main,
    borderRadius: 2,
  },
  milestonesContainer: {
    gap: 20,
  },
  achievedMilestone: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 15,
  },
  milestoneIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  achievedMilestoneName: {
    color: Colors.secondary.main,
  },
  achievementDate: {
    fontSize: 12,
    color: Colors.secondary.main,
    marginTop: 4,
    fontWeight: '500',
  },
  statCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  titleContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: Colors.secondary.main,
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To center the title accounting for the back button
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  plantContainer: {
    width: width * 0.9,
    height: width * 0.9,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 40,
    position: 'relative',
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  soil: {
    width: width * 0.5,
    height: 20,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    position: 'absolute',
    bottom: 0,
    zIndex: 2, // Ensure soil appears above tree base
  },
  plantImageContainer: {
    width: width * 0.7, // Increased width to match container
    height: width * 0.75, // Increased height for better proportions
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 10, // Adjusted to connect with soil
  },
  seedContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seed: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#704214',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  seedInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B4513',
  },
  soilMound: {
    width: 50,
    height: 15,
    backgroundColor: '#5D4037',
    borderRadius: 10,
    position: 'absolute',
    bottom: -5,
    zIndex: 1,
  },
  sproutContainer: {
    width: 60,
    height: 90,
    alignItems: 'center',
    position: 'relative',
  },
  stem: {
    width: 6,
    height: 50,
    backgroundColor: '#66BB6A',
    zIndex: 1,
  },
  leaf: {
    width: 25,
    height: 15,
    backgroundColor: '#81C784',
    borderRadius: 10,
    position: 'absolute',
    zIndex: 2,
  },
  leafLeft: {
    left: 0,
    transform: [{ rotate: '-30deg' }],
  },
  leafRight: {
    right: 0,
    transform: [{ rotate: '30deg' }],
  },
  leafBottom: {
    bottom: 40,
  },
  leafMiddle: {
    bottom: 60,
  },
  leafTop: {
    width: 30,
    height: 18,
    backgroundColor: '#66BB6A',
    borderRadius: 10,
    position: 'absolute',
    top: 5,
    left: 15,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  plantFullContainer: {
    width: 100,
    height: 120,
    alignItems: 'center',
    position: 'relative',
  },
  tallStem: {
    width: 8,
    height: 100,
    backgroundColor: '#388E3C',
    zIndex: 1,
  },
  flower: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD54F',
    position: 'absolute',
    top: 0,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  treeContainer: {
    width: 150,
    height: 180,
    alignItems: 'center',
    position: 'relative',
  },
  trunk: {
    width: 16,
    height: 120,
    backgroundColor: '#795548',
    zIndex: 1,
    borderRadius: 2,
  },
  treeBranch1: {
    width: 40,
    height: 6,
    backgroundColor: '#795548',
    position: 'absolute',
    top: 40,
    right: 45,
    transform: [{ rotate: '20deg' }],
    zIndex: 1,
  },
  treeBranch2: {
    width: 45,
    height: 6,
    backgroundColor: '#795548',
    position: 'absolute',
    top: 60,
    left: 43,
    transform: [{ rotate: '-25deg' }],
    zIndex: 1,
  },
  treeBranch3: {
    width: 35,
    height: 5,
    backgroundColor: '#795548',
    position: 'absolute',
    top: 85,
    right: 48,
    transform: [{ rotate: '15deg' }],
    zIndex: 1,
  },
  treeCrown1: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2E7D32',
    position: 'absolute',
    top: 0,
    left: 40,
    zIndex: 2,
  },
  treeCrown2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#388E3C',
    position: 'absolute',
    top: -10,
    right: 35,
    zIndex: 2,
  },
  treeCrown3: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#43A047',
    position: 'absolute',
    top: -25,
    left: 35,
    zIndex: 3,
  },
  treeCrown4: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    top: -30,
    right: 45,
    zIndex: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  milestoneIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  milestoneDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    gap: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  }
});

export default GrowthTrackerScreen;
