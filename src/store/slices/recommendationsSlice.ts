
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTodaysRecommendation, getRecommendationsHistory } from '../../services/recommendationService';

export interface Recommendation {
  id: string;
  localDate: string;
  bibleVersion?: string;
  scriptureReference?: string;
  scriptureText?: string;
  prayerFocus?: string;
  scripturesToPrayWith?: Array<{ reference: string; text?: string; version?: string; reason?: string }>
  youtube?: {
    url?: string;
    videoId?: string;
    title?: string;
    channelId?: string;
    channelTitle?: string;
  };
  queryContext?: Record<string, any>;
}

export interface PaginatedRecommendations {
  items: Recommendation[];
  page: number;
  totalPages: number;
}

interface RecommendationsState {
  today: Recommendation | null;
  history: Recommendation[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
  };
}

const initialState: RecommendationsState = {
  today: null,
  history: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
  },
};

export const fetchTodaysRecommendation = createAsyncThunk(
  'recommendations/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTodaysRecommendation();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchRecommendationsHistory = createAsyncThunk(
  'recommendations/fetchHistory',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await getRecommendationsHistory(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaysRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.today = action.payload;
      })
      .addCase(fetchTodaysRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'An unknown error occurred';
      })
      .addCase(fetchRecommendationsHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendationsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchRecommendationsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'An unknown error occurred';
      });
  },
});

export default recommendationsSlice.reducer;
