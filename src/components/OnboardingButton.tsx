/**
 * OnboardingButton Component
 * 
 * A reusable button component for onboarding screens that matches the HTML design.
 * Supports primary and secondary variants with consistent styling.
 * 
 * Features:
 * - Primary and secondary button variants
 * - Loading state support
 * - Consistent styling with design system
 * - Proper accessibility support
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  // Optional right icon to display after the text
  rightIconName?: string;
  rightIconLibrary?: 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons' | 'Feather' | 'FontAwesome' | 'AntDesign';
  rightIconColor?: string;
  rightIconSize?: number;
}

/**
 * OnboardingButton Component
 * 
 * Renders a styled button based on the onboarding design system.
 */
const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
  rightIconName,
  rightIconLibrary = 'Ionicons',
  rightIconColor,
  rightIconSize,
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  const textColor = variant === 'primary' 
    ? (disabled ? Colors.text.tertiary : Colors.black)
    : (disabled ? Colors.text.tertiary : Colors.text.primary);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <>
          <Text
            style={[
              styles.buttonText,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIconName ? (
            // Use centralized Icon component for consistency
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('../components/Icon') &&
            // Dynamic import pattern for type safety without circular import issues
            (() => {
              const Icon = require('../components/Icon').default as any;
              return (
                <Icon
                  name={rightIconName}
                  library={rightIconLibrary}
                  size={typeof rightIconSize === 'number' ? rightIconSize : 20}
                  color={rightIconColor || textColor}
                  style={{ marginLeft: 8 }}
                />
              );
            })()
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#f5993d', // Using the exact color from HTML design
  },
  secondaryButton: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default OnboardingButton;
