# PureHeart Onboarding Flow

This directory contains the complete onboarding flow for the PureHeart app, converted from the provided HTML designs into React Native components.

## Overview

The onboarding flow consists of 8 screens that guide users through their initial setup and introduction to the app:

1. **Onboarding1Screen** - Welcome & Introduction
2. **Onboarding2Screen** - Struggle Recognition 
3. **Onboarding3Screen** - Vision of Freedom
4. **Onboarding4Screen** - Personal Information Collection
5. **Onboarding5Screen** - Assessment Questions
6. **Onboarding6Screen** - Faith Background & Customization
7. **Onboarding7Screen** - Accountability & Support Setup
8. **Onboarding8Screen** - Welcome & Completion

## Features

### Design Fidelity
- **Faithful Recreation**: Each screen closely matches the original HTML designs
- **Consistent Styling**: Uses the exact color scheme (#f5993d primary, #121212 background)
- **Preserved Typography**: Maintains font weights, sizes, and hierarchies
- **Image Assets**: Uses the same background images and icons from the HTML

### Navigation Flow
- **Progressive Steps**: Guided flow with clear progression indicators
- **Parameter Passing**: User data flows between screens seamlessly
- **Back Navigation**: Proper back button handling where appropriate
- **Completion Handling**: Automatic navigation to auth flow upon completion

### User Experience
- **Progress Indicators**: Visual progress bars and step counters
- **Form Validation**: Input validation with error handling
- **Accessibility**: Proper accessibility labels and navigation
- **Responsive Design**: Adapts to different screen sizes

### State Management
- **Redux Integration**: Onboarding completion tracked in app state
- **Data Persistence**: User inputs preserved between screens
- **Flow Control**: Smart navigation based on completion status

## Screen Details

### Onboarding1Screen - Welcome
- Hero background with app branding
- Inspirational messaging about freedom journey
- Bible verse (John 8:36)
- User testimonial with star rating
- Two action buttons: "Begin Journey" and "Already Have Account"

### Onboarding2Screen - Struggle Recognition
- Acknowledges user's struggle with compassion
- Statistics about Christian men facing similar challenges
- Bible verse for comfort (Psalm 34:18)
- Confidentiality assurance
- Progress indicator (Step 1 of 7)

### Onboarding3Screen - Vision of Freedom
- Paints picture of life free from struggle
- Benefits visualization with icons
- Bible verse encouragement (2 Corinthians 5:17)
- Commitment question
- Progress indicator (Step 2 of 7)

### Onboarding4Screen - Personal Information
- Form for basic user details (name, email, age, life season)
- Password creation with strength indicator
- Social login option (Google)
- Privacy policy agreement
- Progress indicator (Step 3 of 7)

### Onboarding5Screen - Assessment Questions
- Pre-filled assessment questions in card format
- Personalized journey understanding
- Bible verse for encouragement (Psalm 147:3)
- Back navigation support
- Progress indicator (Step 4 of 7)

### Onboarding6Screen - Faith Background
- Faith-focused customization form
- Church involvement and prayer frequency
- Christian influences and Bible translation preferences
- Spiritual struggle identification
- Progress indicator (Step 5 of 7)

### Onboarding7Screen - Accountability Setup
- Accountability partner matching options
- Support group joining
- Invitation system for trusted contacts
- Solo option with emergency support
- Safety and privacy promises

### Onboarding8Screen - Completion
- Personalized welcome message
- Custom plan summary
- First action items
- Biblical promise (Philippians 4:13)
- Entry into main app

## Technical Implementation

### Components Used
- **OnboardingButton**: Consistent button styling with primary/secondary variants
- **ProgressIndicator**: Step progress with dots or bars
- **OnboardingCard**: Reusable card container with glass morphism effects
- **React Native Paper**: Form inputs and UI elements
- **Linear Gradient**: Background overlays and visual effects

### Navigation Structure
```
OnboardingNavigator (Stack)
├── Onboarding1Screen
├── Onboarding2Screen  
├── Onboarding3Screen
├── Onboarding4Screen
├── Onboarding5Screen (receives userData)
├── Onboarding6Screen (receives userData + assessmentData)
├── Onboarding7Screen (receives userData + assessmentData + faithData)
└── Onboarding8Screen (receives all data)
```

### State Flow
1. User completes GetStartedScreen → `completeFirstLaunch()`
2. App shows OnboardingNavigator
3. User progresses through onboarding screens
4. Final screen calls `completeOnboarding()`
5. App automatically navigates to AuthScreen

### Data Collection
- **Personal Info**: Name, email, age range, life season, password
- **Assessment Data**: Struggle duration, triggers, frequency, fears, vulnerabilities, motivations
- **Faith Data**: Relationship with Jesus, church involvement, prayer frequency, influences, Bible translation, spiritual struggles

## Usage

The onboarding flow is automatically integrated into the app's navigation system:

```typescript
// App automatically shows onboarding when:
// - isFirstLaunch = false
// - onboardingCompleted = false

// To manually trigger onboarding (for testing):
dispatch(resetAppState()); // Reset to show onboarding again
```

## Assets

All background images are referenced via URLs from the original HTML design:
- Hero backgrounds for visual impact
- Partner/group preview images
- Church imagery for faith-focused screens

## Future Enhancements

- [ ] Add animations between screens
- [ ] Implement actual partner matching logic
- [ ] Add support group functionality
- [ ] Integrate with authentication system
- [ ] Add analytics tracking for onboarding completion rates
- [ ] Implement A/B testing for different onboarding flows

## Testing

To test the onboarding flow:

1. Reset app state: Clear app data or call `dispatch(resetAppState())`
2. Launch app - GetStartedScreen should appear
3. Tap "Get Started" - Onboarding1Screen appears
4. Progress through all 8 screens
5. Complete final screen - Should navigate to AuthScreen

## Support

For questions about the onboarding implementation, refer to:
- Individual screen components for specific functionality
- OnboardingNavigator for navigation logic
- App.tsx for integration with main app flow
- Redux store (appSlice.ts) for state management
