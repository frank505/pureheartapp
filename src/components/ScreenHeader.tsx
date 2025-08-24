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
  iconName?: string;
  iconColor?: string;
  navigation?: any;
  showBackButton?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  iconName, 
  iconColor = Colors.primary.main,
  navigation,
  showBackButton = false
}) => {
  return (
    <View style={styles.headerContent}>
      <TouchableOpacity
        style={styles.headerIconContainer}
        onPress={() => {
          if (showBackButton) {
            navigation?.goBack();
          } else if (navigation?.toggleDrawer) {
            navigation.toggleDrawer();
          } else if (navigation?.openDrawer) {
            navigation.openDrawer();
          }
        }}
      >
        <Icon 
          name={showBackButton ? "arrow-back" : iconName || ""} 
          color={iconColor} 
          size="sm" 
        />
      </TouchableOpacity>
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
