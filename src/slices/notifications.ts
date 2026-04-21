import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import type { NotificationDto } from '@features/customer/notifications/types/notification';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@customer-app/store';

interface NotificationsState {
  items: NotificationDto[];
  unreadCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  loadingMore: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  page: 1,
  pageSize: 20,
  hasMore: true,
  status: 'idle',
  loadingMore: false,
};

export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetchNotifications',
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const result = await axiosApi.notificationApi.getNotifications(
        page,
        pageSize
      );
      return { ...result.data, page };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUnreadCount = createAppAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const result = await axiosApi.notificationApi.getUnreadCount();
      return result.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const markNotificationRead = createAppAsyncThunk(
  'notifications/markRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await axiosApi.notificationApi.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const markAllNotificationsRead = createAppAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.notificationApi.markAllAsRead();
      return undefined;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    receiveNotification(state, action: { payload: NotificationDto }) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.status = 'pending';
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { items, totalCount, page } = action.payload;
        if (page === 1) {
          state.items = items;
        } else {
          state.items = [...state.items, ...items];
        }
        state.page = page;
        state.hasMore = state.items.length < totalCount;
        state.status = 'succeeded';
        state.loadingMore = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.status = 'failed';
        }
        state.loadingMore = false;
      })
      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount;
      })
      // markRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find((n) => n.notificationId === id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // markAllRead
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { receiveNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (state: RootState): NotificationDto[] =>
  state.notifications.items;
export const selectUnreadCount = (state: RootState): number =>
  state.notifications.unreadCount;
export const selectNotificationsStatus = (
  state: RootState
): NotificationsState['status'] => state.notifications.status;
export const selectNotificationsHasMore = (state: RootState): boolean =>
  state.notifications.hasMore;
export const selectNotificationsPage = (state: RootState): number =>
  state.notifications.page;
export const selectNotificationsLoadingMore = (state: RootState): boolean =>
  state.notifications.loadingMore;
