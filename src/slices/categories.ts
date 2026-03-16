import type { RootState } from '@app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

import type { Category } from '@features/home/types/category';

export interface CategoriesState {
  categories: Category[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: CategoriesState = {
  categories: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAppAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.categoryApi.getCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;

// ── Selectors ──
export const selectCategories = (state: RootState): Category[] =>
  state.categories.categories;

export const selectCategoriesStatus = (
  state: RootState
): CategoriesState['status'] => state.categories.status;
