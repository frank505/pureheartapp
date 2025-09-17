/**
 * ProgressIndicator Component
 * 
 * A reusable progress indicator component for onboarding screens.
 * Shows the current step in a multi-step process with dots or bars.
 * 
 * Features:
 * - Dot and bar variants
 * - Configurable number of steps
 * - Active/inactive states
 * - Smooth animations
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';
import { responsiveFontSizes, responsiveSpacing } from '../utils/responsive';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'dots' | 'bars';
  showStepText?: boolean; // if true, shows "Step X of Y"; we'll default to false in usage per new requirement
  style?: ViewStyle;
}

/**
 * ProgressIndicator Component
 * 
 * Renders a progress indicator with dots or bars showing current progress.
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  variant = 'dots',
  showStepText = true,
  style,
}) => {
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderBars = () => {
    return (
      <View style={styles.barsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              index < currentStep ? styles.activeBar : styles.inactiveBar,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showStepText && (
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      )}
      <View style={styles.indicatorContainer}>
        {variant === 'dots' ? renderDots() : renderBars()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing.md,
  },
  stepText: {
    fontSize: responsiveFontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Dots variant
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#f5993d',
  },
  inactiveDot: {
    backgroundColor: '#4a4a4a',
  },
  // Bars variant
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    maxWidth: 300,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: '#f5993d',
  },
  inactiveBar: {
    backgroundColor: '#4a4a4a',
  },
});

export default ProgressIndicator;
