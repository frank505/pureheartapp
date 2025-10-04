/**
 * Centralized Color Constants
 * 
 * This file contains all color definitions used throughout the app.
 * All components should import colors from here instead of using hardcoded values.
 * This ensures consistency and makes theme changes easy to implement.
 * 
 * Usage:
 * import { Colors } from '../constants/Colors';
 * backgroundColor: Colors.background.primary
 */

/**
 * Color Palette
 * 
 * Defines the core color palette for the PureHeart app.
 * Based on the dark theme design from the HTML mockup.
 */
export const Colors = {
  // Background colors
  background: {
  primary: '#ffffff',      // Pure white primary background
  secondary: '#f8f9fa',    // Light gray secondary background
  tertiary: '#f1f3f4',     // Slightly darker gray tertiary background
  quaternary: '#e9ecef',   // Medium gray quaternary background
  },

  // Text colors
  text: {
    primary: '#212529',      // Dark gray for main text content
    secondary: '#6c757d',    // Medium gray for secondary text, subtitles
    tertiary: '#adb5bd',     // Light gray for placeholder text, disabled text
    inverse: '#ffffff',      // White text on dark backgrounds
  },

  // Primary brand colors (PureHeart orange/yellow theme)
  primary: {
  main: '#f5993d',         // Keep orange as secondary accent (legacy)
  light: '#f7b668',
  dark: '#e8832a',
  container: '#4a2c14',
  },

  // Secondary colors
  secondary: {
    main: '#28a745',         // Success, positive actions (green)
    light: '#d4edda',        // Success hover states (light green)
    dark: '#155724',         // Success pressed states (dark green)
    container: '#d4edda',    // Success container backgrounds (light green)
  },

  // Error/Warning colors
  error: {
    main: '#dc3545',         // Error text, destructive actions
    light: '#f8d7da',        // Error hover states (light red)
    dark: '#721c24',         // Error pressed states (dark red)
    container: '#f8d7da',    // Error container backgrounds (light red)
  },

  warning: {
    main: '#ffc107',         // Warning text, caution
    light: '#fff3cd',        // Warning hover states (light yellow)
    dark: '#856404',         // Warning pressed states (dark yellow)
    container: '#fff3cd',    // Warning container backgrounds (light yellow)
  },

  // Border and outline colors
  border: {
    primary: '#dee2e6',      // Light gray default borders
    secondary: '#e9ecef',    // Very light gray subtle borders
    focus: '#3b82f6',        // Blue focus rings, active borders
    error: '#dc3545',        // Red error borders
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',    // Light shadows
    medium: 'rgba(0, 0, 0, 0.2)',   // Medium shadows
    heavy: 'rgba(0, 0, 0, 0.3)',    // Heavy shadows
    primary: 'rgba(59, 130, 246, 0.2)', // Primary colored shadows
  },

  // Social media colors
  social: {
    google: '#4285f4',       // Google brand color
    apple: '#000000',        // Apple brand color
    facebook: '#1877f2',     // Facebook brand color
    twitter: '#1da1f2',      // Twitter brand color
  },

  // Success colors (for commitments system)
  success: {
    main: '#28a745',         // Success actions, completed states
    light: '#d4edda',        // Success backgrounds, light states  
    dark: '#155724',         // Success text, dark states
    container: '#d4edda',    // Success container backgrounds
  },

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',    // Modal overlays, backdrops
  transparent: 'transparent',        // Transparent backgrounds
  white: '#ffffff',                  // Pure white
  black: '#000000',                  // Pure black
  inactiveTab: '#6c757d',           // Medium gray inactive tab color
} as const;

/**
 * Theme Configuration
 * 
 * Organized theme object that maps semantic names to colors.
 * This makes it easier to understand the purpose of each color.
 */
export const Theme = {
  // Screen backgrounds
  screen: Colors.background.primary,
  
  // Surface colors (cards, containers)
  surface: Colors.background.secondary,
  surfaceVariant: Colors.background.tertiary,
  
  // Text colors
  onBackground: Colors.text.primary,
  onSurface: Colors.text.primary,
  onSurfaceVariant: Colors.text.secondary,
  
  // Primary colors
  primary: Colors.secondary.main,                // Green accent for primary
  primaryContainer: Colors.secondary.container,
  onPrimary: Colors.white,
  onPrimaryContainer: Colors.text.primary,
  
  // Secondary colors
  secondary: Colors.primary.main,                // Orange moved to secondary accent role
  secondaryContainer: Colors.primary.container,
  onSecondary: Colors.white,
  onSecondaryContainer: Colors.text.primary,
  
  // Error colors
  error: Colors.error.main,
  errorContainer: Colors.error.container,
  onError: Colors.white,
  onErrorContainer: Colors.text.primary,
  
  // Outline colors
  outline: Colors.border.primary,
  outlineVariant: Colors.border.secondary,
  
  // Surface tint
  surfaceTint: Colors.primary.main,
  
  // Inverse colors
  inverseSurface: Colors.text.primary,
  inverseOnSurface: Colors.white,
  
  // Scrim
  scrim: Colors.black,
} as const;

/**
 * Component-specific color mappings
 * 
 * Pre-defined color combinations for common UI patterns.
 */
export const ComponentColors = {
  // Navigation
  tabBar: {
  background: Colors.background.primary,
  border: Colors.border.primary,
  activeTint: Colors.secondary.main, // green accent
  inactiveTint: Colors.text.secondary,
  },
  
  header: {
  background: Colors.background.primary,
  text: Colors.text.primary,
  border: Colors.border.primary,
  },
  
  // Cards
  card: {
    background: Colors.background.primary,
    border: Colors.border.primary,
    shadow: Colors.shadow.light,
  },
  
  // Input fields
  input: {
    background: Colors.background.primary,
    border: Colors.border.primary,
    borderFocus: Colors.border.focus,
    borderError: Colors.border.error,
    text: Colors.text.primary,
    placeholder: Colors.text.tertiary,
  },
  
  // Buttons
  button: {
    primary: {
      background: Colors.primary.main,
      text: Colors.white,
      border: Colors.primary.main,
    },
    secondary: {
      background: Colors.background.secondary,
      text: Colors.text.primary,
      border: Colors.border.primary,
    },
    danger: {
      background: Colors.error.main,
      text: Colors.white,
      border: Colors.error.main,
    },
  },
  
  // Status indicators
  status: {
    liked: Colors.error.main,
    bookmarked: Colors.primary.main,
    online: Colors.secondary.main,
    offline: Colors.text.tertiary,
  },
} as const;

/**
 * Utility functions for color manipulation
 */
export const ColorUtils = {
  /**
   * Create rgba color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    // Simple implementation - in a real app you might want a more robust color parser
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
} as const;

/**
 * Type definitions for TypeScript
 */
export type ColorKeys = keyof typeof Colors;
export type ThemeKeys = keyof typeof Theme;
export type ComponentColorKeys = keyof typeof ComponentColors;