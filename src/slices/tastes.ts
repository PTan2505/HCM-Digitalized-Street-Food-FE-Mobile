import type { RootState } from '@customer-app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

import type { Taste } from '@features/home/types/taste';

export interface TastesState {
  tastes: Taste[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: TastesState = {
  tastes: [],
  status: 'idle',
  error: null,
};

export const fetchTastes = createAppAsyncThunk(
  'tastes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.tasteApi.getTastes();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const tastesSlice = createSlice({
  name: 'tastes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTastes.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchTastes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tastes = action.payload;
      })
      .addCase(fetchTastes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default tastesSlice.reducer;

// ── Selectors ──
export const selectTastes = (state: RootState): Taste[] => state.tastes.tastes;

export const selectTastesStatus = (state: RootState): TastesState['status'] =>
  state.tastes.status;
