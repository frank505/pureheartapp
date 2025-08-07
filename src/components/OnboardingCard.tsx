/**
 * OnboardingCard Component
 * 
 * A reusable card component for onboarding screens that provides
 * consistent styling and layout for content sections.
 * 
 * Features:
 * - Consistent card styling with blur effects
 * - Optional borders and shadows
 * - Flexible content layout
 * - Accessibility support
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants';

interface OnboardingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withBorder?: boolean;
  withShadow?: boolean;
  transparent?: boolean;
}

/**
 * OnboardingCard Component
 * 
 * Renders a styled card container for onboarding content.
 */
const OnboardingCard: React.FC<OnboardingCardProps> = ({
  children,
  style,
  withBorder = false,
  withShadow = false,
  transparent = false,
}) => {
  const cardStyle = [
    styles.card,
    transparent ? styles.transparentCard : styles.solidCard,
    withBorder && styles.cardWithBorder,
    withShadow && styles.cardWithShadow,
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  solidCard: {
    backgroundColor: Colors.background.secondary,
  },
  transparentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)', // Note: This may not work on all React Native platforms
  },
  cardWithBorder: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  cardWithShadow: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
});

export default OnboardingCard;
