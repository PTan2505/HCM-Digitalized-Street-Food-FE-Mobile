import type { RootState } from '@customer-app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
  map: Record<string, number>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: SettingsState = {
  map: {},
  status: 'idle',
};

export const fetchSettings = createAppAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const items = await axiosApi.settingsApi.getSettings();
      const map: Record<string, number> = {};
      for (const item of items) {
        const parsed = parseFloat(item.value);
        if (!isNaN(parsed)) map[item.name] = parsed;
      }
      return map;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.map = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

const getSetting = (state: RootState, key: string, fallback: number): number =>
  state.settings.map[key] ?? fallback;

export const selectOrderXP = (state: RootState): number =>
  getSetting(state, 'orderXP', 50);

export const selectFeedbackXP = (state: RootState): number =>
  getSetting(state, 'feedbackXP', 20);

export const selectGhostPinXP = (state: RootState): number =>
  getSetting(state, 'ghostpinXP', 100);

export default settingsSlice.reducer;
