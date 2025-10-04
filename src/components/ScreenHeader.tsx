/**
 * ScreenHeader Component
 * 
 * A reusable header component for all screens.
 * Features an icon on the left, title in the center, and profile dropdown on the right.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, ColorUtils } from '../constants';
import Icon from './Icon';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getUserType, saveUserType } from '../utils/userTypeUtils';
import { saveUserType as saveUserTypeToRedux } from '../store/slices/onboardingSlice';
import type { UserType } from '../constants';
import { useFocusEffect } from '@react-navigation/native';
// Profile dropdown removed from header per design update

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

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const onboardingUserType = useAppSelector((s) => s.onboarding.userType);
  const [asyncStorageUserType, setAsyncStorageUserType] = useState<'partner' | 'user' | null>(null);
  const [isTogglingUI, setIsTogglingUI] = useState(false);

  // Load user type from AsyncStorage on mount and when it changes
  const loadUserTypeFromStorage = async () => {
    try {
      const userType = await getUserType();
      console.log('[ScreenHeader] Loaded user type from AsyncStorage:', userType);
      setAsyncStorageUserType(userType);
    } catch (error) {
      console.error('[ScreenHeader] Error loading user type:', error);
    }
  };

  useEffect(() => {
    loadUserTypeFromStorage();
  }, []);

  // Also reload when screen comes into focus to catch changes from other screens
  useFocusEffect(
    React.useCallback(() => {
      loadUserTypeFromStorage();
    }, [])
  );

  // Determine if user is a partner/accountability buddy
  // Priority: 1) AsyncStorage (most reliable), 2) currentUser.userType, 3) onboarding store
  const isPartner = asyncStorageUserType === 'partner' || 
                    (!asyncStorageUserType && currentUser?.userType === 'partner') ||
                    (!asyncStorageUserType && !currentUser?.userType && onboardingUserType === 'partner');

  const handleGrowthTracker = () => {
    navigation?.navigate('GrowthTracker');
  };

  const handleProgress = () => {
    navigation?.navigate('Progress');
  };

  const handleDailyDose = () => {
    navigation?.navigate('DailyDose');
  };

  const handleToggleUI = async () => {
    try {
      setIsTogglingUI(true);
      const newUserType: UserType = isPartner ? 'user' : 'partner';
      const uiMode = isPartner ? 'Normal User' : 'Partner';
      
      Alert.alert(
        'Switch UI Mode',
        `Switch to ${uiMode} UI? This will change the available features.`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setIsTogglingUI(false)
          },
          {
            text: 'Switch',
            onPress: async () => {
              try {
                console.log('[ScreenHeader] Switching UI to:', newUserType);
                
                // Save to AsyncStorage first (primary source of truth)
                await saveUserType(newUserType);
                console.log('[ScreenHeader] Saved to AsyncStorage');
                
                // Save to Redux
                dispatch(saveUserTypeToRedux(newUserType));
                console.log('[ScreenHeader] Saved to Redux');
                
                // Force reload from AsyncStorage to ensure state is in sync
                await loadUserTypeFromStorage();
                console.log('[ScreenHeader] Reloaded from AsyncStorage');
                
                // Force navigation to reset and remount all screens
                // This ensures TabNavigator and all screens re-read the user type
                if (navigation) {
                  // Navigate to a dummy route and back to force remount
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' as any }],
                  });
                }
                
                Alert.alert(
                  'UI Switched',
                  `You're now viewing the ${uiMode} interface. Reloading...`
                );
              } catch (error) {
                console.error('[ScreenHeader] Error during switch:', error);
                Alert.alert('Error', 'Failed to switch UI mode. Please try again.');
              } finally {
                setIsTogglingUI(false);
              }
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('[ScreenHeader] Error in handleToggleUI:', error);
      Alert.alert('Error', 'Failed to switch UI mode. Please try again.');
      setIsTogglingUI(false);
    }
  };

  // Hide growth tracker icon if title is longer than 11 characters OR if user is a partner
  const shouldShowGrowthTracker = showGrowthTracker && title.length <= 11 && !isPartner;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.leftHeaderContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() => navigation?.goBack()}
            > 
              <Icon 
                name="arrow-back" 
                color={Colors.text.primary}
                size="sm" 
              />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

  <View style={styles.rightIconsContainer}>
          {/* UI Toggle icon - first - Shows current mode */}
          <TouchableOpacity
            style={[
              styles.headerIconContainer,
              { backgroundColor: isPartner ? Colors.primary.main : Colors.secondary.main }
            ]}
            onPress={handleToggleUI}
            disabled={isTogglingUI}
          > 
            <Icon 
              name={isPartner ? "person-outline" : "people-outline"}
              color={Colors.white}
              size="sm" 
            />
          </TouchableOpacity>

          {/* Bible/Daily Dose icon - second */}
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={handleDailyDose}
          > 
            <Icon 
              name="book-outline" 
              color={Colors.text.primary}
              size="sm" 
            />
          </TouchableOpacity>
          
          {/* Plant/Growth Tracker icon - third */}
          {shouldShowGrowthTracker && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={handleGrowthTracker}
            > 
              <Icon 
                name="leaf-outline" 
                color={Colors.text.primary}
                size="sm" 
              />
            </TouchableOpacity>
          )}
          
          {/* Progress icon - fourth - Hidden for partners */}
          {!isPartner && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={handleProgress}
            > 
              <Icon 
                name="analytics-outline" 
                color={Colors.text.primary}
                size="sm" 
              />
            </TouchableOpacity>
          )}

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
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
    color: Colors.text.primary,
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
