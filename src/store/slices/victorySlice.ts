import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { victoryService, Victory, PaginatedVictories, CreateVictoryPayload, UpdateVictoryPayload } from '../../services/victoryService';
import { Comment, PaginatedComments, CreateCommentPayload } from '../../services/checkinService';

interface VictoryState {
  victories: PaginatedVictories;
  publicVictories: PaginatedVictories;
  sharedVictories: PaginatedVictories;
  selectedVictory: Victory | null;
  comments: PaginatedComments;
  loading: boolean;
  error: string | null;
}

const initialState: VictoryState = {
  victories: { items: [], page: 1, totalPages: 1 },
  publicVictories: { items: [], page: 1, totalPages: 1 },
  sharedVictories: { items: [], page: 1, totalPages: 1 },
  selectedVictory: null,
  comments: { items: [], page: 1, totalPages: 1 },
  loading: false,
  error: null,
};

export const createVictory = createAsyncThunk('victories/create', async (payload: CreateVictoryPayload) => {
  return await victoryService.createVictory(payload);
});

export const getVictories = createAsyncThunk('victories/getAll', async ({ page, limit }: { page?: number; limit?: number }) => {
  return await victoryService.getVictories(page, limit);
});

export const getPublicVictories = createAsyncThunk('victories/getPublic', async ({ page, limit }: { page?: number; limit?: number }) => {
  return await victoryService.getPublicVictories(page, limit);
});

export const getVictoriesByUserId = createAsyncThunk('victories/getByUserId', async ({ userId, page, limit, search }: { userId: number; page?: number; limit?: number; search?: string }) => {
  return await victoryService.getVictoriesByUserId(userId, page, limit, search);
});

export const getSharedVictories = createAsyncThunk('victories/getShared', async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
  return await victoryService.getSharedVictories(page, limit, search);
});

export const getVictoryById = createAsyncThunk('victories/getById', async (id: number) => {
  return await victoryService.getVictoryById(id);
});

export const updateVictory = createAsyncThunk('victories/update', async ({ id, payload }: { id: number; payload: UpdateVictoryPayload }) => {
  return await victoryService.updateVictory(id, payload);
});

export const deleteVictory = createAsyncThunk('victories/delete', async (id: number) => {
  await victoryService.deleteVictory(id);
  return id;
});

export const addCommentToVictory = createAsyncThunk('victories/addComment', async ({ id, comment }: { id: number; comment: CreateCommentPayload }) => {
  return await victoryService.addCommentToVictory(id, comment);
});

export const getVictoryComments = createAsyncThunk('victories/getComments', async ({ id, page, limit }: { id: number; page?: number; limit?: number }) => {
  return await victoryService.getVictoryComments(id, page, limit);
});

export const deleteVictoryComment = createAsyncThunk('victories/deleteComment', async ({ id, commentId }: { id: number; commentId: number }) => {
  await victoryService.deleteVictoryComment(id, commentId);
  return commentId;
});

const victorySlice = createSlice({
  name: 'victories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createVictory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVictory.fulfilled, (state, action) => {
        state.loading = false;
        state.victories.items.unshift(action.payload);
      })
      .addCase(createVictory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create victory';
      })
      .addCase(getVictories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVictories.fulfilled, (state, action) => {
        state.loading = false;
        state.victories = action.payload;
      })
      .addCase(getVictories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch victories';
      })
      .addCase(getVictoriesByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVictoriesByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.victories = action.payload;
      })
      .addCase(getVictoriesByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user victories';
      })
      .addCase(getSharedVictories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSharedVictories.fulfilled, (state, action) => {
        state.loading = false;
        state.sharedVictories = action.payload;
      })
      .addCase(getSharedVictories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shared victories';
      })
      .addCase(getPublicVictories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicVictories.fulfilled, (state, action) => {
        state.loading = false;
        state.publicVictories = action.payload;
      })
      .addCase(getPublicVictories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch public victories';
      })
      .addCase(getVictoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVictoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVictory = action.payload;
      })
      .addCase(getVictoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch victory';
      })
      .addCase(updateVictory.fulfilled, (state, action) => {
        const index = state.victories.items.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.victories.items[index] = action.payload;
        }
        if (state.selectedVictory && state.selectedVictory.id === action.payload.id) {
          state.selectedVictory = action.payload;
        }
      })
      .addCase(deleteVictory.fulfilled, (state, action) => {
        state.victories.items = state.victories.items.filter(v => v.id !== action.payload);
      })
      .addCase(addCommentToVictory.fulfilled, (state, action) => {
        state.comments.items.unshift(action.payload);
      })
      .addCase(getVictoryComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(deleteVictoryComment.fulfilled, (state, action) => {
        state.comments.items = state.comments.items.filter(c => c.id !== action.payload);
      });
  },
});

export default victorySlice.reducer;

