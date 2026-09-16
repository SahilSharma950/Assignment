import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: string;
  content: string;
  entityId?: string;
  entityModel?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/read-all');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.items.find((n) => n._id === id);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived } = notificationSlice.actions;
export default notificationSlice.reducer;
