import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { prayerRequestService, PrayerRequest, PaginatedPrayerRequests, CreatePrayerRequestPayload, UpdatePrayerRequestPayload } from '../../services/prayerRequestService';
import { Comment, PaginatedComments, CreateCommentPayload } from '../../services/checkinService';

interface PrayerRequestState {
  prayerRequests: PaginatedPrayerRequests;
  publicPrayerRequests: PaginatedPrayerRequests;
  sharedPrayerRequests: PaginatedPrayerRequests;
  selectedPrayerRequest: PrayerRequest | null;
  comments: PaginatedComments;
  loading: boolean;
  error: string | null;
}

const initialState: PrayerRequestState = {
  prayerRequests: { items: [], page: 1, totalPages: 1 },
  publicPrayerRequests: { items: [], page: 1, totalPages: 1 },
  sharedPrayerRequests: { items: [], page: 1, totalPages: 1 },
  selectedPrayerRequest: null,
  comments: { items: [], page: 1, totalPages: 1 },
  loading: false,
  error: null,
};

export const createPrayerRequest = createAsyncThunk('prayerRequests/create', async (payload: CreatePrayerRequestPayload) => {
  return await prayerRequestService.createPrayerRequest(payload);
});

export const getPrayerRequests = createAsyncThunk('prayerRequests/getAll', async ({ page, limit }: { page?: number; limit?: number }) => {
  return await prayerRequestService.getPrayerRequests(page, limit);
});

export const getPublicPrayerRequests = createAsyncThunk('prayerRequests/getPublic', async ({ page, limit }: { page?: number; limit?: number }) => {
  return await prayerRequestService.getPublicPrayerRequests(page, limit);
});

export const getSharedPrayerRequests = createAsyncThunk('prayerRequests/getShared', async ({ page, limit }: { page?: number; limit?: number }) => {
  return await prayerRequestService.getSharedPrayerRequests(page, limit);
});

export const getPrayerRequestsByUserId = createAsyncThunk('prayerRequests/getByUserId', async ({ userId, page, limit }: { userId: number; page?: number; limit?: number }) => {
  return await prayerRequestService.getPrayerRequestsByUserId(userId, page, limit);
});



export const getPrayerRequestById = createAsyncThunk('prayerRequests/getById', async (id: number) => {
  return await prayerRequestService.getPrayerRequestById(id);
});

export const updatePrayerRequest = createAsyncThunk('prayerRequests/update', async ({ id, payload }: { id: number; payload: UpdatePrayerRequestPayload }) => {
  return await prayerRequestService.updatePrayerRequest(id, payload);
});

export const deletePrayerRequest = createAsyncThunk('prayerRequests/delete', async (id: number) => {
  await prayerRequestService.deletePrayerRequest(id);
  return id;
});

export const addComment = createAsyncThunk('prayerRequests/addComment', async ({ id, comment }: { id: number; comment: CreateCommentPayload }) => {
  return await prayerRequestService.addCommentToPrayerRequest(id, comment);
});

export const getComments = createAsyncThunk('prayerRequests/getComments', async ({ id, page, limit }: { id: number; page?: number; limit?: number }) => {
  return await prayerRequestService.getPrayerRequestComments(id, page, limit);
});

export const deleteComment = createAsyncThunk('prayerRequests/deleteComment', async ({ id, commentId }: { id: number; commentId: number }) => {
  await prayerRequestService.deletePrayerRequestComment(id, commentId);
  return commentId;
});

const prayerRequestSlice = createSlice({
  name: 'prayerRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPrayerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrayerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.prayerRequests.items.unshift(action.payload);
      })
      .addCase(createPrayerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create prayer request';
      })
      .addCase(getPrayerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrayerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.prayerRequests = action.payload;
      })
      .addCase(getPrayerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prayer requests';
      })
      .addCase(getPublicPrayerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicPrayerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.publicPrayerRequests = action.payload;
      })
      .addCase(getPublicPrayerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch public prayer requests';
      })
      .addCase(getSharedPrayerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSharedPrayerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sharedPrayerRequests = action.payload;
      })
      .addCase(getSharedPrayerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shared prayer requests';
      })
      .addCase(getPrayerRequestsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrayerRequestsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.prayerRequests = action.payload;
      })
      .addCase(getPrayerRequestsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user prayer requests';
      })
      .addCase(getPrayerRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrayerRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPrayerRequest = action.payload;
      })
      .addCase(getPrayerRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prayer request';
      })
      .addCase(updatePrayerRequest.fulfilled, (state, action) => {
        const index = state.prayerRequests.items.findIndex(pr => pr.id === action.payload.id);
        if (index !== -1) {
          state.prayerRequests.items[index] = action.payload;
        }
        if (state.selectedPrayerRequest && state.selectedPrayerRequest.id === action.payload.id) {
          state.selectedPrayerRequest = action.payload;
        }
      })
      .addCase(deletePrayerRequest.fulfilled, (state, action) => {
        state.prayerRequests.items = state.prayerRequests.items.filter(pr => pr.id !== action.payload);
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.items.unshift(action.payload);
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments.items = state.comments.items.filter(c => c.id !== action.payload);
      });
  },
});

export default prayerRequestSlice.reducer;

