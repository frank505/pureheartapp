/**
 * Slice for managing recovery journey data during onboarding.
 *
 * This slice handles the state for the user's recovery-related
 * information, including their goals, motivations, and previous
 * experiences with seeking help.
 *
 * Features:
 * - Persists recovery journey data to AsyncStorage.
 * - Allows for saving and clearing data.
 * - Integrates with the onboarding flow.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RecoveryJourneyData {
  recoveryGoal: string;
  recoveryMotivation: string;
  hasSoughtHelpBefore: string;
  previousHelpDescription: string;
  completedAt?: string;
}

interface RecoveryJourneyState {
  recoveryJourneyData: RecoveryJourneyData | null;
}

const initialState: RecoveryJourneyState = {
  recoveryJourneyData: null,
};

const recoveryJourneySlice = createSlice({
  name: 'recoveryJourney',
  initialState,
  reducers: {
    saveRecoveryJourneyData(state, action: PayloadAction<RecoveryJourneyData>) {
      state.recoveryJourneyData = action.payload;
    },
    clearRecoveryJourneyData(state) {
      state.recoveryJourneyData = null;
    },
  },
});

export const { saveRecoveryJourneyData, clearRecoveryJourneyData } = recoveryJourneySlice.actions;
export default recoveryJourneySlice.reducer;

