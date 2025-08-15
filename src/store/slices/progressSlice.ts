import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { progressService, Achievement, AnalyticsSummary, CalendarData } from '../../services/progressService';

interface ProgressState {
  achievements: Achievement[];
  analytics: AnalyticsSummary | null;
  calendar: CalendarData;
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  achievements: [],
  analytics: null,
  calendar: {},
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAchievements = createAsyncThunk<Achievement[], void, { rejectValue: string }>(
  'progress/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const achievements = await progressService.getAchievements();
      return achievements;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchAnalytics = createAsyncThunk<AnalyticsSummary, 'last_4_weeks' | 'all_time', { rejectValue: string }>(
  'progress/fetchAnalytics',
  async (period, { rejectWithValue }) => {
    try {
      const analytics = await progressService.getAnalytics(period);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchCalendar = createAsyncThunk<CalendarData, string, { rejectValue: string }>(
  'progress/fetchCalendar',
  async (month, { rejectWithValue }) => {
    try {
      const calendar = await progressService.getCalendar(month);
      return calendar;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch calendar');
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action: PayloadAction<Achievement[]>) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action: PayloadAction<AnalyticsSummary>) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      // Calendar
      .addCase(fetchCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action: PayloadAction<CalendarData>) => {
        state.loading = false;
        state.calendar = action.payload;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  },
});

export default progressSlice.reducer;
