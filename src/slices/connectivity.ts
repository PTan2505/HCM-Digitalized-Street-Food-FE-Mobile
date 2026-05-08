import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@customer-app/store';

interface ConnectivityState {
  notificationSocketConnected: boolean;
}

const initialState: ConnectivityState = {
  notificationSocketConnected: false,
};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    setNotificationSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.notificationSocketConnected = action.payload;
    },
  },
});

export const { setNotificationSocketConnected } = connectivitySlice.actions;
export const selectNotificationSocketConnected = (state: RootState): boolean =>
  state.connectivity.notificationSocketConnected;

export default connectivitySlice.reducer;
