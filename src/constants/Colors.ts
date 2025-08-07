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
    primary: '#121212',      // Main app background - matches --background-color
    secondary: '#1e1e1e',    // Cards, surfaces, containers - matches --surface-color
    tertiary: '#2c2c2c',     // Elevated surfaces, borders - matches --accent-color
    quaternary: '#4b5563',   // Subtle backgrounds, disabled states
  },

  // Text colors
  text: {
    primary: '#ffffff',      // Main text content - matches --text-primary
    secondary: '#a0a0a0',    // Secondary text, subtitles - matches --text-secondary
    tertiary: '#6b7280',     // Placeholder text, disabled text
    inverse: '#121212',      // Text on light backgrounds
  },

  // Primary brand colors (PureHeart orange/yellow theme)
  primary: {
    main: '#f5993d',         // Primary buttons, links, highlights - matches HTML design
    light: '#f7b668',        // Hover states, light variants
    dark: '#e8832a',         // Pressed states, dark variants
    container: '#4a2c14',    // Primary container backgrounds
  },

  // Secondary colors
  secondary: {
    main: '#2ecc71',         // Success, positive actions
    light: '#4ade80',        // Success hover states
    dark: '#16a34a',         // Success pressed states
    container: '#064e3b',    // Success container backgrounds
  },

  // Error/Warning colors
  error: {
    main: '#ef4444',         // Error text, destructive actions
    light: '#f87171',        // Error hover states
    dark: '#dc2626',         // Error pressed states
    container: '#7f1d1d',    // Error container backgrounds
  },

  warning: {
    main: '#f59e0b',         // Warning text, caution
    light: '#fbbf24',        // Warning hover states
    dark: '#d97706',         // Warning pressed states
    container: '#78350f',    // Warning container backgrounds
  },

  // Border and outline colors
  border: {
    primary: '#374151',      // Default borders
    secondary: '#4b5563',    // Subtle borders
    focus: '#3b82f6',        // Focus rings, active borders
    error: '#ef4444',        // Error borders
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

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',    // Modal overlays, backdrops
  transparent: 'transparent',        // Transparent backgrounds
  white: '#ffffff',                  // Pure white
  black: '#000000',                  // Pure black
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
  primary: Colors.primary.main,
  primaryContainer: Colors.background.secondary,
  onPrimary: Colors.white,
  onPrimaryContainer: Colors.text.primary,
  
  // Secondary colors
  secondary: Colors.secondary.main,
  secondaryContainer: Colors.secondary.container,
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
  inverseSurface: Colors.white,
  inverseOnSurface: Colors.text.inverse,
  
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
    background: Colors.background.secondary,
    border: Colors.border.primary,
    activeTint: Colors.primary.main,
    inactiveTint: Colors.text.secondary,
  },
  
  header: {
    background: Colors.background.secondary,
    text: Colors.text.primary,
    border: Colors.border.primary,
  },
  
  // Cards
  card: {
    background: Colors.background.secondary,
    border: Colors.border.primary,
    shadow: Colors.shadow.light,
  },
  
  // Input fields
  input: {
    background: Colors.background.secondary,
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
      background: Colors.background.tertiary,
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
    liked: Colors.background.quaternary,
    bookmarked: Colors.background.quaternary,
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