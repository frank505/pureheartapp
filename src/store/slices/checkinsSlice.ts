import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import checkinService, { CheckInDTO } from '../../services/checkinService';

export interface CheckInsState {
  items: CheckInDTO[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: CheckInsState = {
  items: [],
  page: 1,
  totalPages: 1,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchCheckIns = createAsyncThunk(
  'checkins/fetch',
  async (params: { from?: string; to?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const data = await checkinService.list(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? err?.message ?? 'Failed to load check-ins');
    }
  }
);

export const createCheckIn = createAsyncThunk(
  'checkins/create',
  async (
    input: { 
      mood: number; 
      note?: string; 
      visibility?: 'private' | 'partner' | 'group'; 
      partnerIds?: Array<number | string>; 
      groupIds?: string[];
      status?: 'victory' | 'relapse';
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await checkinService.create(input);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? err?.message ?? 'Failed to create check-in');
    }
  }
);

const checkinsSlice = createSlice({
  name: 'checkins',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetCheckinStatus(state) {
      state.isLoading = false;
      state.isCreating = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckIns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCheckIns.fulfilled, (state, action: PayloadAction<{ items: CheckInDTO[]; page: number; totalPages: number }>) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCheckIns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to load check-ins';
      })
      .addCase(createCheckIn.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCheckIn.fulfilled, (state, action: PayloadAction<CheckInDTO>) => {
        state.isCreating = false;
        // Prepend new check-in
        state.items = [action.payload, ...state.items];
      })
      .addCase(createCheckIn.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as string) || 'Failed to create check-in';
      });
  },
});

export const { clearError, resetCheckinStatus } = checkinsSlice.actions;
export default checkinsSlice.reducer;


