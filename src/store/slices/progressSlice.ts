import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { progressService, Achievement, AnalyticsSummary, CalendarData, FeaturesAndBadgesData, Feature, Badge } from '../../services/progressService';

interface ProgressState {
  achievements: Achievement[];
  analytics: AnalyticsSummary | null;
  calendar: CalendarData;
  features: Feature[];
  badges: Badge[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  achievements: [],
  analytics: null,
  calendar: {},
  features: [],
  badges: [],
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

export const fetchFeaturesAndBadges = createAsyncThunk<FeaturesAndBadgesData, void, { rejectValue: string }>(
  'progress/fetchFeaturesAndBadges',
  async (_, { rejectWithValue }) => {
    try {
      const data = await progressService.getFeaturesAndBadges();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch features and badges');
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
      })
      // Features and Badges
      .addCase(fetchFeaturesAndBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturesAndBadges.fulfilled, (state, action: PayloadAction<FeaturesAndBadgesData>) => {
        state.loading = false;
        state.features = action.payload.features;
        state.badges = action.payload.badges;
      })
      .addCase(fetchFeaturesAndBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  },
});

export default progressSlice.reducer;
