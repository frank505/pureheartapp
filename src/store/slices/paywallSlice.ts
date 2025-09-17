import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaywallState {
  visible: boolean;
  feature?: string;
  trialEndsAt?: string;
  trialEnded?: boolean;
  message?: string;
}

const initialState: PaywallState = {
  visible: false,
};

interface ShowPayload {
  feature: string;
  trialEndsAt?: string;
  trialEnded?: boolean;
  message?: string;
}

const slice = createSlice({
  name: 'paywall',
  initialState,
  reducers: {
    showPaywall: (state, action: PayloadAction<ShowPayload>) => {
      state.visible = true;
      state.feature = action.payload.feature;
      state.trialEndsAt = action.payload.trialEndsAt;
      state.trialEnded = action.payload.trialEnded;
      state.message = action.payload.message || 'Subscription required';
    },
    hidePaywall: (state) => {
      state.visible = false;
    },
  },
});

export const { showPaywall, hidePaywall } = slice.actions;
export default slice.reducer;