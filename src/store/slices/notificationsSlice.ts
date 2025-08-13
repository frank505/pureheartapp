import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import notificationsService from '../../services/notificationsService';

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
};

export interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
}

const initialItems: NotificationItem[] = [];

const initialState: NotificationsState = {
  items: initialItems,
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const data = await notificationsService.list(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load notifications');
    }
  }
);

export const markReadAsync = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationsService.markRead(id);
      return { id };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to mark notification as read');
    }
  }
);

export const markAllReadAsync = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to mark all as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { items, page, totalPages } = action.payload as any;
        const mapped: NotificationItem[] = items.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          createdAt: n.createdAt,
          read: Boolean(n.readAt),
        }));
        state.items = mapped;
        state.unreadCount = mapped.filter((n) => !n.read).length;
        state.page = page;
        state.totalPages = totalPages;
        state.isLoading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(markReadAsync.fulfilled, (state, action) => {
        const { id } = action.payload as { id: string };
        const idx = state.items.findIndex((n) => n.id === id);
        if (idx !== -1 && !state.items[idx].read) {
          state.items[idx].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllReadAsync.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      });
  },
});

export const { setNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;


