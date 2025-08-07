/**
 * Reusable Icon Component
 * 
 * A centralized icon component that uses react-native-vector-icons
 * with consistent styling and theming support.
 * 
 * Features:
 * - Support for multiple icon libraries
 * - Consistent sizing and theming
 * - TypeScript support with autocomplete
 * - Easy to use with semantic icon names
 * - Customizable colors and sizes
 */

import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

// Import centralized constants
import { IconLibrary, IconSizes, DefaultIconProps } from '../constants';
import { Colors } from '../constants';

/**
 * Icon Component Props
 */
interface IconProps {
  /** Icon name from the specified library */
  name: string;
  /** Icon library to use */
  library?: IconLibrary;
  /** Icon size (can use predefined sizes or custom number) */
  size?: keyof typeof IconSizes | number;
  /** Icon color */
  color?: string;
  /** Additional styles */
  style?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Icon Library Components Map
 * 
 * Maps library names to their respective icon components.
 */
const IconComponents = {
  Ionicons: IonIcon,
  MaterialIcons: MaterialIcon,
  MaterialCommunityIcons: MaterialCommunityIcon,
  Feather: FeatherIcon,
  FontAwesome: FontAwesomeIcon,
  AntDesign: AntDesignIcon,
} as const;

/**
 * Icon Component
 * 
 * Renders vector icons with consistent theming and sizing.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Icon name="home-outline" />
 * 
 * // With custom size and color
 * <Icon name="heart" size="lg" color={Colors.primary.main} />
 * 
 * // With different icon library
 * <Icon name="favorite" library="MaterialIcons" />
 * 
 * // With custom size (number)
 * <Icon name="settings" size={32} color={Colors.text.secondary} />
 * ```
 */
const Icon: React.FC<IconProps> = ({
  name,
  library = 'Ionicons',
  size = 'md',
  color = Colors.text.primary,
  style,
  testID,
}) => {
  // Get the icon component for the specified library
  const IconComponent = IconComponents[library];

  // Determine the icon size
  const iconSize = typeof size === 'number' ? size : IconSizes[size];

  // If the icon component doesn't exist, return null
  if (!IconComponent) {
    console.warn(`Icon library "${library}" is not supported`);
    return null;
  }

  return (
    <IconComponent
      name={name}
      size={iconSize}
      color={color}
      style={[styles.icon, style]}
      testID={testID}
    />
  );
};

/**
 * Predefined Icon Components
 * 
 * Common icon configurations for frequent use cases.
 */
export const TabIcon: React.FC<{ name: string; focused: boolean; color?: string }> = ({ 
  name, 
  focused, 
  color = Colors.text.primary 
}) => (
  <Icon
    name={name}
    size={focused ? 'lg' : 'md'}
    color={color}
    style={{ opacity: focused ? 1 : 0.7 }}
  />
);

export const ActionIcon: React.FC<{ name: string; onPress?: () => void; color?: string }> = ({ 
  name, 
  color = Colors.text.primary 
}) => (
  <Icon
    name={name}
    size="md"
    color={color}
  />
);

export const SocialIcon: React.FC<{ name: string; size?: keyof typeof IconSizes }> = ({ 
  name, 
  size = 'lg' 
}) => (
  <Icon
    name={name}
    size={size}
    color={Colors.text.primary}
  />
);

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default Icon;