import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import checkinService, { CheckInStreak } from '../../services/checkinService';

interface StreaksState {
  streaks: CheckInStreak | null;
  loading: boolean;
  error: string | null;
}

const initialState: StreaksState = {
  streaks: null,
  loading: false,
  error: null,
};

export const getStreaks = createAsyncThunk('streaks/get', async () => {
  return await checkinService.getStreaks();
});

const streaksSlice = createSlice({
  name: 'streaks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStreaks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStreaks.fulfilled, (state, action) => {
        state.loading = false;
        state.streaks = action.payload;
      })
      .addCase(getStreaks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch streaks';
      });
  },
});

export default streaksSlice.reducer;

