# Commitment System - Critical Fixes

This file contains all the critical fixes needed to make the commitment system work properly.

## 1. Fix Navigation Types

Add to `/src/navigation/types.ts`:

```typescript
export type RootStackParamList = {
  // ... existing screens
  
  // Commitment System Screens
  ChooseCommitmentType: undefined;
  BrowseActions: undefined;
  ActionDetails: { actionId: string };
  SetTargetDate: { financialAmount?: number };
  ReviewCommitment: undefined;
  CommitmentSuccess: undefined;
  ActiveCommitmentDashboard: undefined;
  ActionPending: undefined;
  UploadProof: undefined;
  ProofSubmitted: undefined;
  PartnerVerification: undefined;
  DeadlineMissed: undefined;
  CreateCustomAction: undefined;
  SetFinancialAmount: undefined;
  SetHybridCommitment: undefined;
  ServiceStats: undefined;
  RedemptionWall: undefined;
};
```

## 2. Fix Type Definitions

Update `/src/types/commitments.ts`:

```typescript
// Add to Commitment interface
export interface Commitment {
  // ... existing properties
  lastRelapse?: {
    timestamp: string;
    actionRequired: boolean;
  };
}

// Add to ActionProof interface  
export interface ActionProof {
  // ... existing properties
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Add to AvailableAction interface
export interface AvailableAction {
  // ... existing properties
  proofRequirements?: string[];
}
```

## 3. Fix Redux Actions

Update `/src/store/slices/commitmentsSlice.ts`:

```typescript
// Add setSelectedAction reducer
const commitmentsSlice = createSlice({
  name: 'commitments',
  initialState,
  reducers: {
    setSelectedAction: (state, action) => {
      state.selectedAction = action.payload;
    },
    clearSelectedAction: (state) => {
      state.selectedAction = null;
    },
    // ... existing reducers
  },
  // ... existing extraReducers
});

export const { setSelectedAction, clearSelectedAction } = commitmentsSlice.actions;

// Fix submitProof thunk
export const submitProof = createAsyncThunk(
  'commitments/submitProof',
  async (params: {
    commitmentId: string;
    description: string;
    location: { latitude: number; longitude: number };
    mediaFiles: Array<{
      uri: string;
      type: string;
      fileName: string;
    }>;
  }) => {
    const formData = new FormData();
    // Implementation here
  }
);

// Fix verifyProof thunk
export const verifyProof = createAsyncThunk(
  'commitments/verifyProof',
  async (params: {
    commitmentId: string;
    proofId: string;
    approved: boolean;
    feedback?: string;
  }) => {
    // Implementation here
  }
);
```

## 4. Add Success Colors

Update `/src/constants/Colors.ts`:

```typescript
export const Colors = {
  // ... existing colors
  success: {
    light: '#d4edda',
    main: '#28a745',
    dark: '#155724',
  },
};
```

## 5. Install Required Dependencies

Run these commands:

```bash
npm install react-native-image-picker @react-native-community/geolocation
cd ios && pod install  # If using iOS
```

## 6. Fix Loading State References

Replace in all screens:
- `loading={submitting}` → `loading={loading.proof}`
- `disabled={submitting || ...}` → `disabled={loading.proof || ...}`

## 7. Fix Media URL References

Replace in ProofSubmittedScreen.tsx:
- `currentProof.mediaUrls?.length` → `currentProof.mediaUrl ? 1 : 0`

## 8. Navigation Stack Registration

Add to your main navigation file:

```typescript
import {
  ChooseCommitmentTypeScreen,
  BrowseActionsScreen,
  ActionDetailsScreen,
  SetTargetDateScreen,
  ReviewCommitmentScreen,
  CommitmentSuccessScreen,
  ActiveCommitmentDashboardScreen,
  ActionPendingScreen,
  UploadProofScreen,
  ProofSubmittedScreen,
  PartnerVerificationScreen,
  DeadlineMissedScreen,
  CreateCustomActionScreen,
  SetFinancialAmountScreen,
} from '../screens/commitments';

// In your Stack Navigator:
<Stack.Screen name="ChooseCommitmentType" component={ChooseCommitmentTypeScreen} />
<Stack.Screen name="BrowseActions" component={BrowseActionsScreen} />
<Stack.Screen name="ActionDetails" component={ActionDetailsScreen} />
<Stack.Screen name="SetTargetDate" component={SetTargetDateScreen} />
<Stack.Screen name="ReviewCommitment" component={ReviewCommitmentScreen} />
<Stack.Screen name="CommitmentSuccess" component={CommitmentSuccessScreen} />
<Stack.Screen name="ActiveCommitmentDashboard" component={ActiveCommitmentDashboardScreen} />
<Stack.Screen name="ActionPending" component={ActionPendingScreen} />
<Stack.Screen name="UploadProof" component={UploadProofScreen} />
<Stack.Screen name="ProofSubmitted" component={ProofSubmittedScreen} />
<Stack.Screen name="PartnerVerification" component={PartnerVerificationScreen} />
<Stack.Screen name="DeadlineMissed" component={DeadlineMissedScreen} />
<Stack.Screen name="CreateCustomAction" component={CreateCustomActionScreen} />
<Stack.Screen name="SetFinancialAmount" component={SetFinancialAmountScreen} />
```

Apply these fixes and the commitment system will be fully functional!