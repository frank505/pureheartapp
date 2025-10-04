# Action Commitments System - Quick Start Guide

## 🎉 What's Been Implemented

### ✅ Core Infrastructure (100% Complete)
1. **Type System** (`src/types/commitments.ts`)
   - 17 TypeScript interfaces covering the entire commitment lifecycle
   - Comprehensive types for API requests/responses
   - Full type safety across the feature

2. **API Service** (`src/services/commitmentService.ts`)
   - Complete service class with 20+ methods
   - Handles all backend communication
   - Multipart form-data support for media uploads
   - Ready to integrate with your backend

3. **Redux State Management** (`src/store/slices/commitmentsSlice.ts`)
   - Full Redux Toolkit slice with async thunks
   - Manages commitments, actions, proofs, stats, and redemption stories
   - Integrated into root store with persistence
   - Error handling and loading states

4. **UI Screens** (3 of 16 completed)
   - ✅ `ChooseCommitmentTypeScreen` - Select commitment type
   - ✅ `BrowseActionsScreen` - Browse available actions with filters
   - ✅ `ActionDetailsScreen` - View full action details

## 🚀 How to Use What's Built

### 1. Test the Screens

Add to your navigation stack (e.g., in `src/navigation/AppNavigator.tsx`):

```typescript
import {
  ChooseCommitmentTypeScreen,
  BrowseActionsScreen,
  ActionDetailsScreen,
} from '../screens/commitments';

// In your stack navigator:
<Stack.Screen 
  name="ChooseCommitmentType" 
  component={ChooseCommitmentTypeScreen} 
/>
<Stack.Screen 
  name="BrowseActions" 
  component={BrowseActionsScreen} 
/>
<Stack.Screen 
  name="ActionDetails" 
  component={ActionDetailsScreen} 
/>
```

Then navigate to the entry point:
```typescript
navigation.navigate('ChooseCommitmentType');
```

### 2. Use Redux Actions

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAvailableActions,
  createCommitment,
  reportRelapse,
  submitProof,
} from '../store/slices/commitmentsSlice';

// In your component:
const dispatch = useAppDispatch();
const { availableActions, loading, error } = useAppSelector(
  (state) => state.commitments
);

// Fetch actions
useEffect(() => {
  dispatch(fetchAvailableActions(undefined));
}, [dispatch]);

// Create a commitment
const handleCreateCommitment = async () => {
  try {
    await dispatch(createCommitment({
      commitmentType: 'ACTION',
      actionId: 'action_123',
      targetDate: '2025-12-31T00:00:00Z',
      partnerId: 456,
      requirePartnerVerification: true,
      allowPublicShare: false,
    })).unwrap();
    
    // Success!
  } catch (error) {
    // Handle error
  }
};
```

### 3. Call API Service Directly (Alternative to Redux)

```typescript
import commitmentService from '../services/commitmentService';

// Get available actions
const actions = await commitmentService.getAvailableActions({
  category: ['COMMUNITY_SERVICE'],
  difficulty: ['EASY', 'MEDIUM'],
});

// Create commitment
const response = await commitmentService.createCommitment({
  commitmentType: 'ACTION',
  actionId: 'action_123',
  targetDate: '2025-12-31T00:00:00Z',
  partnerId: 456,
  requirePartnerVerification: true,
  allowPublicShare: false,
});
```

## 📋 Next Steps

### Immediate Priority (Week 1)
1. **Complete Remaining Creation Flow Screens**:
   - `SetTargetDateScreen` - Choose date & partner
   - `ReviewCommitmentScreen` - Confirm before creation
   - `CommitmentSuccessScreen` - Celebration screen

2. **Backend API Setup**:
   - Implement the endpoints defined in `commitmentService.ts`
   - Set up database tables (see schemas in `COMMITMENT_SYSTEM_IMPLEMENTATION.md`)
   - Configure media upload storage (S3/CloudStorage)

### Second Priority (Week 2)
3. **Active Commitment Flow**:
   - `ActiveCommitmentDashboardScreen` - View active commitment
   - Relapse reporting flow
   - `ActionPendingScreen` - Show action to complete
   - `UploadProofScreen` - Camera integration

### Third Priority (Week 3)
4. **Verification & Stats**:
   - `PartnerVerificationScreen` - Partner approves/rejects proof
   - `ServiceStatsScreen` - User's impact statistics
   - `RedemptionWallScreen` - Community feed

### Final Polish (Week 4)
5. **Edge Cases & Components**:
   - `DeadlineMissedScreen` - Handle missed deadlines
   - Reusable components (CommitmentCard, ActionCard, etc.)
   - Notification system
   - Testing

## 🔍 Code Structure

```
src/
├── types/
│   └── commitments.ts              ✅ Complete type definitions
├── services/
│   └── commitmentService.ts        ✅ Complete API service
├── store/
│   ├── index.ts                    ✅ Updated with commitments slice
│   └── slices/
│       └── commitmentsSlice.ts     ✅ Complete Redux slice
└── screens/
    └── commitments/
        ├── index.ts                ✅ Export file
        ├── ChooseCommitmentTypeScreen.tsx    ✅ Complete
        ├── BrowseActionsScreen.tsx           ✅ Complete
        ├── ActionDetailsScreen.tsx           ✅ Complete
        ├── SetTargetDateScreen.tsx           ⏳ TODO
        ├── ReviewCommitmentScreen.tsx        ⏳ TODO
        ├── CommitmentSuccessScreen.tsx       ⏳ TODO
        ├── ActiveCommitmentDashboardScreen.tsx  ⏳ TODO
        ├── ActionPendingScreen.tsx           ⏳ TODO
        ├── UploadProofScreen.tsx             ⏳ TODO
        ├── ProofSubmittedScreen.tsx          ⏳ TODO
        ├── PartnerVerificationScreen.tsx     ⏳ TODO
        ├── ServiceStatsScreen.tsx            ⏳ TODO
        ├── RedemptionWallScreen.tsx          ⏳ TODO
        └── DeadlineMissedScreen.tsx          ⏳ TODO
```

## 📖 Documentation Files

- **`COMMITMENT_SYSTEM_IMPLEMENTATION.md`** - Complete implementation guide
  - All remaining screens detailed
  - Database schemas
  - API endpoint specifications
  - Testing checklist
  - Deployment guide

- **Original Spec** - Your comprehensive flow map (provided in the prompt)

## 🛠️ Development Tips

### Testing Locally Without Backend
Use mock data in Redux slice:
```typescript
// In commitmentsSlice.ts, temporarily add:
const mockActions: AvailableAction[] = [
  {
    id: '1',
    title: 'Serve at soup kitchen',
    description: 'Help serve meals to those in need',
    category: 'COMMUNITY_SERVICE',
    difficulty: 'MEDIUM',
    estimatedHours: 3,
    proofInstructions: 'Take photo of yourself serving food',
    requiresLocation: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock data...
];

// Use in fulfilled case:
.addCase(fetchAvailableActions.fulfilled, (state, action) => {
  state.loading.actions = false;
  state.availableActions = mockActions; // Use mock data
});
```

### Debugging Redux State
```typescript
// In any component:
const state = useAppSelector((state) => state.commitments);
console.log('Commitments State:', state);
```

### API URL Configuration
Update your API base URL in `src/config/api.ts` to point to your backend.

## ⚠️ Important Notes

1. **Media Uploads**: The `submitProof` method uses `FormData` for multipart uploads. Ensure your backend accepts `multipart/form-data`.

2. **Authentication**: All API calls automatically include auth tokens (handled by axios interceptor in `src/services/api.ts`).

3. **Error Handling**: Service methods throw errors. Always wrap in try-catch or use `.unwrap()` with Redux thunks.

4. **Date Formats**: All dates use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`).

5. **File Types**: Images should be JPEG/PNG, videos should be MP4 (max 30 seconds).

## 🎯 Quick Win: Add to Home Screen

In your `HomeScreen.tsx` or `HubScreen.tsx`:

```typescript
import { useNavigation } from '@react-navigation/native';

// Add this card/button:
<TouchableOpacity 
  onPress={() => navigation.navigate('ChooseCommitmentType')}
  style={styles.commitmentCard}
>
  <Icon name="shield-checkmark" size={32} color={Colors.primary.main} />
  <Text style={styles.commitmentTitle}>Create Commitment</Text>
  <Text style={styles.commitmentSubtitle}>
    Turn relapses into positive impact
  </Text>
</TouchableOpacity>
```

## 🆘 Need Help?

Refer to:
1. **`COMMITMENT_SYSTEM_IMPLEMENTATION.md`** - Detailed implementation guide
2. **Type definitions** - See `src/types/commitments.ts` for all data structures
3. **Existing screens** - Reference the 3 completed screens as examples

## 🚢 Ready to Ship?

Before deploying:
- [ ] All screens completed
- [ ] Backend APIs live
- [ ] Database migrations run
- [ ] Media storage configured
- [ ] Push notifications set up
- [ ] Tested end-to-end flows
- [ ] Cron jobs for deadlines running

---

**The foundation is solid. Build on it!** 🚀
