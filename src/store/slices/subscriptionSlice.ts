import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import purchasesService from '../../services/purchasesService';
import Purchases from 'react-native-purchases';

interface EntitlementState {
  isActive: boolean;
  expiresDate?: string | null;
  willRenew?: boolean;
  productIdentifier?: string;
  latestPurchaseDate?: string;
  loading: boolean;
  error?: string | null;
}

const initialState: EntitlementState = {
  isActive: false,
  loading: false,
  error: null,
};

export const initSubscription = createAsyncThunk('subscription/init', async (userId: string) => {
  await purchasesService.configure(userId);
  const cached = await purchasesService.getCachedEntitlement();
  return cached;
});

export const refreshSubscription = createAsyncThunk('subscription/refresh', async () => {
  try {
    await Purchases.getCustomerInfo(); // trigger listener update
  } catch {}
  const cached = await purchasesService.getCachedEntitlement();
  return cached;
});

const slice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(initSubscription.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(initSubscription.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(initSubscription.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Failed to init subscription';
      })
      .addCase(refreshSubscription.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  }
});

export const { clearSubscriptionError } = slice.actions;
export default slice.reducer;
