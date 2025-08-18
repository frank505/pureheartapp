/**
 * GrowthTrackerScreen Component
 * 
 * A dedicated screen to display the user's spiritual growth progress,
 * visualized as a growing plant with the number of days of their journey.
 */
import React, { useState, useEffect, useRef } from 'react';
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
import { useAppSelector } from '../store/hooks';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import { useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const GrowthTrackerScreen: React.FC = () => {
  // Mock data for demonstration - in a real app, this would come from user's data
  const [daysActive, setDaysActive] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  
  // Get user data from Redux store
  const user = useAppSelector((state) => state.user.currentUser);
  
  useEffect(() => {
    // Calculate days active since join date
    if (user?.joinDate) {
      const joinDate = new Date(user.joinDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysActive(diffDays);
    } else if (user?.stats?.daysActive) {
      // If we have stats already calculated
      setDaysActive(user.stats.daysActive);
    } else {
      // Fallback for demo purposes
      setDaysActive(30);
    }
    
    // Animate the plant growth
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [user]);
  
  // Calculate plant growth stage (simplified for demo)
  const getPlantStage = () => {
    if (daysActive < 7) return 'seed';
    if (daysActive < 30) return 'sprout';
    if (daysActive < 90) return 'plant';
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
        <Text style={styles.title}>Your Growth Journey</Text>
        <Text style={styles.subtitle}>
          {daysActive} {daysActive === 1 ? 'Day' : 'Days'} of Growth
        </Text>
        
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
            {plantStage === 'seed' && (
              <View style={styles.seedContainer}>
                <View style={styles.seed}>
                  <View style={styles.seedInner} />
                </View>
                <View style={styles.soilMound} />
              </View>
            )}
            
            {plantStage === 'sprout' && (
              <View style={styles.sproutContainer}>
                <View style={styles.stem} />
                <View style={[styles.leaf, styles.leafLeft]} />
                <View style={[styles.leaf, styles.leafRight]} />
                <View style={styles.soilMound} />
              </View>
            )}
            
            {plantStage === 'plant' && (
              <View style={styles.plantFullContainer}>
                <View style={styles.tallStem} />
                <View style={[styles.leaf, styles.leafLeft, styles.leafBottom]} />
                <View style={[styles.leaf, styles.leafRight, styles.leafBottom]} />
                <View style={[styles.leaf, styles.leafLeft, styles.leafMiddle]} />
                <View style={[styles.leaf, styles.leafRight, styles.leafMiddle]} />
                <View style={[styles.leaf, styles.leafTop]} />
                <View style={styles.flower} />
                <View style={styles.soilMound} />
              </View>
            )}
            
            {plantStage === 'tree' && (
              <View style={styles.treeContainer}>
                <View style={styles.trunk} />
                <View style={styles.treeBranch1} />
                <View style={styles.treeBranch2} />
                <View style={styles.treeBranch3} />
                <View style={styles.treeCrown1} />
                <View style={styles.treeCrown2} />
                <View style={styles.treeCrown3} />
                <View style={styles.treeCrown4} />
                <View style={styles.soilMound} />
              </View>
            )}
          </Animated.View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{daysActive}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plantStage}</Text>
            <Text style={styles.statLabel}>Growth Stage</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.min(100, Math.round(daysActive / 90 * 100))}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Growth Milestones</Text>
          <View style={styles.milestone}>
            <View style={[styles.milestoneIcon, { backgroundColor: daysActive >= 7 ? Colors.secondary.main : Colors.background.secondary }]} />
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneName}>Sprouting</Text>
              <Text style={styles.milestoneDesc}>7 days of consistent growth</Text>
            </View>
          </View>
          <View style={styles.milestone}>
            <View style={[styles.milestoneIcon, { backgroundColor: daysActive >= 30 ? Colors.secondary.main : Colors.background.secondary }]} />
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneName}>Taking Root</Text>
              <Text style={styles.milestoneDesc}>30 days of consistent growth</Text>
            </View>
          </View>
          <View style={styles.milestone}>
            <View style={[styles.milestoneIcon, { backgroundColor: daysActive >= 90 ? Colors.secondary.main : Colors.background.secondary }]} />
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneName}>Flourishing</Text>
              <Text style={styles.milestoneDesc}>90 days of consistent growth</Text>
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
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  soil: {
    width: width * 0.5,
    height: 20,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    position: 'absolute',
    bottom: 0,
  },
  plantImageContainer: {
    width: width * 0.4,
    height: width * 0.4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 15,
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
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
    width: 20,
    height: 20,
    borderRadius: 10,
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
});

export default GrowthTrackerScreen;
