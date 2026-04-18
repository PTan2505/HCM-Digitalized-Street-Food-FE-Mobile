import type { RootState } from '@customer-app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

import type { Vendor } from '@features/home/types/vendor';

export interface VendorsState {
  vendors: Vendor[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  loadingMore: boolean;
  error: unknown;
}

const initialState: VendorsState = {
  vendors: [],
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  hasNext: false,
  status: 'idle',
  loadingMore: false,
  error: null,
};

export const fetchVendors = createAppAsyncThunk(
  'vendors/fetchAll',
  async (
    { page = 1, pageSize = 10 }: { page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.vendorApi.getVendors(page, pageSize);
      return { ...response, requestedPage: page };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 1;
        if (page === 1) {
          state.status = 'pending';
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        // Use the page we requested — not what the API echoes back in currentPage,
        // because some backends always return currentPage: 1.
        const requestedPage = action.meta.arg?.page ?? 1;
        const { items, totalPages, totalCount, hasNext } = action.payload;
        if (requestedPage === 1) {
          state.vendors = items;
        } else {
          // Deduplicate by vendorId so repeated fetches of the same page
          // (e.g. from the now-fixed loop) don't produce duplicate list keys.
          const existingIds = new Set(state.vendors.map((v) => v.vendorId));
          const newItems = items.filter((v) => !existingIds.has(v.vendorId));
          state.vendors = [...state.vendors, ...newItems];
        }
        state.currentPage = requestedPage;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.hasNext = hasNext;
        state.status = 'succeeded';
        state.loadingMore = false;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export default vendorsSlice.reducer;

// ── Selectors ──
export const selectVendors = (state: RootState): Vendor[] =>
  state.vendors.vendors;

export const selectVendorsStatus = (state: RootState): VendorsState['status'] =>
  state.vendors.status;

export const selectVendorsHasNext = (state: RootState): boolean =>
  state.vendors.hasNext;

export const selectVendorsLoadingMore = (state: RootState): boolean =>
  state.vendors.loadingMore;

export const selectVendorsCurrentPage = (state: RootState): number =>
  state.vendors.currentPage;
