# User Type Selection Implementation

## Overview
Added user type selection (Partner vs User) to the GetStartedScreen. The selected type is saved to AsyncStorage and can be used throughout the app to determine which UI elements to show or hide.

## Changes Made

### 1. **New Files Created**

#### `/src/constants/StorageKeys.ts`
- Centralized AsyncStorage key definitions
- Defines `USER_TYPE` key for storing user type preference
- Exports `UserType` type: `'partner' | 'user'`
- Includes all other storage keys used in the app

#### `/src/utils/userTypeUtils.ts`
- Utility functions for managing user type
- Functions:
  - `saveUserType(userType)` - Save user type to AsyncStorage
  - `getUserType()` - Retrieve user type from AsyncStorage
  - `isPartner()` - Check if user is a partner
  - `isRegularUser()` - Check if user is a regular user
  - `clearUserType()` - Clear user type from storage

#### `/src/hooks/useUserType.ts`
- Custom React hook for accessing user type in components
- Auto-loads user type on mount
- Returns:
  - `userType` - Current user type or null
  - `isPartner` - Boolean indicating if user is partner
  - `isUser` - Boolean indicating if user is regular user
  - `isLoading` - Loading state
  - `setUserType(type)` - Update user type
  - `clearType()` - Clear user type
  - `refreshUserType()` - Reload user type from storage

### 2. **Updated Files**

#### `/src/screens/onboarding/GetStartedScreen.tsx`
**Changes:**
- Added user type selection with three buttons:
  1. **"I'm a Partner"** - User goes through onboarding as a partner
  2. **"I'm a User"** - User goes through onboarding as a regular user
  3. **"I Already Have an Account"** - User skips onboarding and goes to sign in
- Added `handleUserTypeSelection` function that:
  - Saves selected user type to AsyncStorage
  - Marks first launch as completed
  - Navigates to onboarding flow
- Added visual improvements:
  - Selection header with title and subtitle
  - Divider between signup and signin options
  - Better spacing and styling

#### `/src/constants/index.ts`
- Added exports for `StorageKeys` and `UserType`

## Usage Examples

### Using the Hook in a Component
```tsx
import { useUserType } from '../hooks/useUserType';

const MyComponent = () => {
  const { userType, isPartner, isUser, isLoading } = useUserType();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isPartner) {
    return <PartnerSpecificUI />;
  }

  if (isUser) {
    return <RegularUserUI />;
  }

  return <DefaultUI />;
};
```

### Using Utility Functions
```tsx
import { getUserType, isPartner } from '../utils/userTypeUtils';

const checkUserType = async () => {
  const userType = await getUserType();
  console.log('User type:', userType);

  if (await isPartner()) {
    // Show partner features
  }
};
```

### Direct AsyncStorage Access
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../constants';

const userType = await AsyncStorage.getItem(StorageKeys.USER_TYPE);
// Returns: 'partner' | 'user' | null
```

## User Flow

### New User Flow
1. User opens app for first time
2. Sees GetStartedScreen with three options
3. Clicks either "I'm a Partner" or "I'm a User"
4. User type is saved to AsyncStorage
5. User proceeds through onboarding
6. Throughout the app, their user type determines which UI they see

### Existing User Flow
1. User opens app
2. Clicks "I Already Have an Account"
3. Skips onboarding and goes to sign in
4. Their user type may have been set previously or during account creation

## Data Persistence

The user type is stored in AsyncStorage with the key `'user_type'` and persists across:
- App restarts
- App updates
- Device reboots

It can only be cleared by:
- Calling `clearUserType()` utility function
- Logging out (if you add that logic)
- Manually clearing AsyncStorage
- Uninstalling the app

## Next Steps

To use the user type throughout your app:

1. **Import the hook in any component:**
   ```tsx
   import { useUserType } from '../hooks/useUserType';
   ```

2. **Conditionally render UI:**
   ```tsx
   const { isPartner, isUser } = useUserType();
   
   return (
     <>
       {isPartner && <PartnerFeatures />}
       {isUser && <UserFeatures />}
       <SharedFeatures />
     </>
   );
   ```

3. **Update navigation or routing:**
   ```tsx
   const { userType } = useUserType();
   
   if (userType === 'partner') {
     navigation.navigate('PartnerDashboard');
   } else {
     navigation.navigate('UserDashboard');
   }
   ```

## Testing

To test the implementation:

1. Run the app: `npx react-native run-ios`
2. Click "I'm a Partner" - should save 'partner' to AsyncStorage
3. Check console logs for confirmation
4. Restart app and check if user type persists
5. Try "I'm a User" and verify 'user' is saved
6. Use React Native Debugger to inspect AsyncStorage

## Storage Key Reference

All storage keys are now centralized in `/src/constants/StorageKeys.ts`:
- `USER_TOKEN` - Authentication token
- `FCM_TOKEN` - Firebase Cloud Messaging token
- `USER_TYPE` - User type selection (partner/user) ⭐ NEW
- `ACCOUNT_PARTNER_HASH` - Partner hash value
- `SUBSCRIPTION_ENTITLEMENT` - Subscription status
- `PERSIST_ROOT` - Redux persist root

## Notes

- User type is independent of authentication status
- User type is saved before entering the onboarding flow
- The hook automatically loads user type on mount for convenience
- All logging is prefixed with `[UserType]` for easy debugging
