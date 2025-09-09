/**
 * ScreenHeader Component
 * 
 * A reusable header component for all screens.
 * Features an icon on the left, title in the center, and profile dropdown on the right.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, ColorUtils } from '../constants';
import Icon from './Icon';
import ProfileDropdown from './ProfileDropdown';

interface ScreenHeaderProps {
  title: string;
  navigation?: any;
  showBackButton?: boolean;
  showGrowthTracker?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  navigation,
  showBackButton = false,
  showGrowthTracker = true
}) => {
  const handleGrowthTracker = () => {
    navigation?.navigate('GrowthTracker');
  };

  const handleProgress = () => {
    navigation?.navigate('Progress');
  };

  const handleDailyDose = () => {
    navigation?.navigate('DailyDose');
  };

  // Hide growth tracker icon if title is longer than 11 characters
  const shouldShowGrowthTracker = showGrowthTracker && title.length <= 11;

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#334155"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <View style={styles.headerContent}>
        <View style={styles.leftHeaderContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() => navigation?.goBack()}
            > 
              <Icon 
                name="arrow-back" 
                color={Colors.white}
                size="sm" 
              />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <View style={styles.rightIconsContainer}>
          {/* Bible/Daily Dose icon - first */}
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={handleDailyDose}
          > 
            <Icon 
              name="book-outline" 
              color={Colors.white}
              size="sm" 
            />
          </TouchableOpacity>
          
          {/* Plant/Growth Tracker icon - second */}
          {shouldShowGrowthTracker && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={handleGrowthTracker}
            > 
              <Icon 
                name="leaf-outline" 
                color={Colors.white}
                size="sm" 
              />
            </TouchableOpacity>
          )}
          
          {/* Progress icon - third */}
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={handleProgress}
          > 
            <Icon 
              name="analytics-outline" 
              color={Colors.white}
              size="sm" 
            />
          </TouchableOpacity>
          
          {/* Profile dropdown/Settings - fourth */}
          <ProfileDropdown navigation={navigation} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.25),
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ColorUtils.withOpacity(Colors.white, 0.08),
    borderWidth: 1,
    borderColor: ColorUtils.withOpacity(Colors.white, 0.18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
  flex: 1,
  flexShrink: 1,
  // Allow text to wrap within the available space so it never overlaps icons
  flexWrap: 'wrap',
  // In React Native, setting minWidth: 0 lets flex children shrink properly
  minWidth: 0,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  // Keep icons from shrinking; text will wrap instead
  flexShrink: 0,
    gap: 8,
  },
});

export default ScreenHeader;
