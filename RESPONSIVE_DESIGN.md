# Responsive Design Implementation

## Overview

This document outlines the responsive design implementation for making header texts and icons scale appropriately across different screen sizes in the PureHeart app.

## Key Features

### 1. Responsive Utilities (`src/utils/responsive.ts`)

- **Font Scaling**: Responsive font sizes based on screen width with min/max limits
- **Spacing**: Consistent spacing that scales with screen size
- **Screen Detection**: Helper functions to detect small/large screens
- **Base Reference**: Uses iPhone 11 Pro dimensions (375x812) as reference

### 2. Pre-defined Font Sizes

```typescript
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
```

### 3. Responsive Spacing

```typescript
export const responsiveSpacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(48),
};
```

## Updated Components

### 1. ProfileDropdown Component
- **Bible Icon**: Added next to profile icon, navigates to DailyDoseScreen
- **Responsive Icons**: All icons now use responsive sizing
- **Responsive Text**: Dropdown menu text scales with screen size
- **Responsive Spacing**: Padding and margins scale appropriately

### 2. BreatheScreen
- **Header Icons**: Back button icon scales responsively
- **Text Elements**: Time label, time text, instruction text all scale
- **Spacing**: All padding and margins use responsive values

### 3. Onboarding Screens (Onboarding1Screen, Onboarding2Screen)
- **Main Titles**: Scale from 28px base size
- **Subtitles**: Scale from 16px base size
- **Body Text**: Scale from 14-16px base sizes
- **Icons**: Use responsive icon sizes
- **Spacing**: All spacing uses responsive values

### 4. ProgressIndicator Component
- **Step Text**: Uses responsive font sizing
- **Spacing**: Gaps and padding scale with screen size

## Implementation Guidelines

### For New Components:

1. **Import Responsive Utils**:
```typescript
import { responsiveFontSizes, responsiveSpacing } from '../utils/responsive';
```

2. **Use Pre-defined Sizes**:
```typescript
// Instead of fontSize: 16
fontSize: responsiveFontSizes.body

// Instead of padding: 24
padding: responsiveSpacing.lg
```

3. **For Icons**:
```typescript
// Instead of size="md" or size={24}
size={responsiveFontSizes.iconMedium}
```

### For Existing Components:

1. Add responsive import
2. Replace hardcoded font sizes with responsive equivalents
3. Replace hardcoded spacing with responsive spacing
4. Update icon sizes to use responsive values

## Screen Size Handling

- **Small Screens** (< 350px): Font sizes scale down but never below 80% of original
- **Large Screens** (> 400px): Font sizes scale up but never above 120% of original
- **Standard Screens** (350-400px): Scale proportionally based on width ratio

## Benefits

1. **Consistent UX**: Text and icons remain readable across all device sizes
2. **Better Accessibility**: Maintains minimum readable sizes
3. **Professional Appearance**: Prevents text/icons from appearing too large on big screens
4. **Easy Maintenance**: Centralized responsive logic
5. **Performance**: Calculations done once during component initialization

## Future Enhancements

1. **Dynamic Font Scaling**: Could add support for user font preference settings
2. **Orientation Support**: Could add landscape-specific adjustments
3. **Platform Differences**: Could add iOS/Android specific scaling factors
4. **Accessibility Integration**: Could integrate with system accessibility settings
