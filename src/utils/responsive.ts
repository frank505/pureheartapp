/**
 * Responsive Design Utilities
 * 
 * Provides utilities for responsive font sizes and scaling based on screen dimensions.
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference: 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale size based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size responsively
 * Uses a combination of width scaling and font scaling for better text readability
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  
  // Ensure minimum readability and maximum font size limits
  const minSize = size * 0.8; // Never go below 80% of original
  const maxSize = size * 1.2; // Never go above 120% of original
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

/**
 * Get responsive font sizes for common text elements
 */
export const responsiveFontSizes = {
  // Headers
  headerTitle: scaleFontSize(24),
  headerSubtitle: scaleFontSize(18),
  
  // Main titles
  mainTitle: scaleFontSize(28),
  subtitle: scaleFontSize(16),
  
  // Body text
  body: scaleFontSize(16),
  bodySmall: scaleFontSize(14),
  caption: scaleFontSize(12),
  
  // Special elements
  statisticNumber: scaleFontSize(48),
  timeText: scaleFontSize(24),
  
  // Icons
  iconSmall: scaleFontSize(16),
  iconMedium: scaleFontSize(24),
  iconLarge: scaleFontSize(32),
};

/**
 * Get responsive spacing values
 */
export const responsiveSpacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(48),
};

/**
 * Check if screen is small (width < 350px)
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 350;
};

/**
 * Check if screen is large (width > 400px)
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH > 400;
};

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: isSmallScreen(),
    isLarge: isLargeScreen(),
  };
};
