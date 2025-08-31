/**
 * ScreenHeader Component
 * 
 * A reusable header component for all screens.
 * Features an icon on the left, title in the center, and profile dropdown on the right.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';
import Icon from './Icon';
import ProfileDropdown from './ProfileDropdown';

interface ScreenHeaderProps {
  title: string;
  navigation?: any;
  showBackButton?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  navigation,
  showBackButton = false
}) => {
  const handleProfileSettings = () => {
    navigation?.navigate('ProfileSettings');
  };

  return (
    <View style={styles.headerContent}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={() => navigation?.goBack()}
        > 
          <Icon 
            name="arrow-back" 
            color={Colors.primary.main} 
            size="sm" 
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={handleProfileSettings}
        > 
          <Icon 
            name="settings-outline" 
            color={Colors.text.primary} 
            size="sm" 
          />
        </TouchableOpacity>
      )}
     
      <Text style={styles.headerTitle}>{title}</Text>
      <ProfileDropdown navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default ScreenHeader;
