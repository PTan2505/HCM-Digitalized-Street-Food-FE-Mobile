import type { RootState } from '@customer-app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

import type { ActiveBranch } from '@features/customer/home/types/branch';

export interface BranchesState {
  branches: ActiveBranch[];
  /** vendorIds that have more than 1 branch — used for display name formatting */
  multiBranchVendorIds: number[];
  /** branchId → image URLs (1 item on home load, all items after RestaurantSwipe opens) */
  branchImageMap: Record<number, string[]>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  loadingMore: boolean;
  error: unknown;
}

const initialState: BranchesState = {
  branches: [],
  multiBranchVendorIds: [],
  branchImageMap: {},
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  hasNext: false,
  status: 'idle',
  loadingMore: false,
  error: null,
};

export const fetchActiveBranches = createAppAsyncThunk(
  'branches/fetchActive',
  async (
    {
      page = 1,
      pageSize = 10,
      lat,
      lng,
      distance,
      dietaryIds,
      tasteIds,
      minPrice,
      maxPrice,
      CategoryIds,
    }: {
      page?: number;
      pageSize?: number;
      lat?: number;
      lng?: number;
      distance?: number;
      dietaryIds?: number[];
      tasteIds?: number[];
      minPrice?: number;
      maxPrice?: number;
      CategoryIds?: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      const paginatedBranches = await axiosApi.branchApi.getActiveBranches(
        page,
        pageSize,
        {
          Lat: lat,
          Long: lng,
          Distance: distance,
          DietaryIds: dietaryIds?.length ? dietaryIds : undefined,
          TasteIds: tasteIds?.length ? tasteIds : undefined,
          MinPrice: minPrice,
          MaxPrice: maxPrice,
          CategoryIds: CategoryIds,
        }
      );

      // For each unique vendorId in this page, check if the vendor has > 1 branch.
      // Simultaneously fetch the first image for every branch in the page.
      const uniqueVendorIds = [
        ...new Set(paginatedBranches.items.map((b) => b.vendorId)),
      ];

      const [vendorChecks, imageResults] = await Promise.all([
        Promise.all(
          uniqueVendorIds.map((vendorId) =>
            axiosApi.branchApi
              .getBranchesByVendor(vendorId, 1, 2)
              .then((res) => ({ vendorId, totalCount: res.totalCount }))
              .catch(() => ({ vendorId, totalCount: 1 }))
          )
        ),
        Promise.all(
          paginatedBranches.items.map((branch) =>
            axiosApi.branchApi
              .getBranchImages(branch.branchId, 1, 1)
              .then((res) => ({
                branchId: branch.branchId,
                imageUrl: res.items[0]?.imageUrl ?? null,
              }))
              .catch(() => ({ branchId: branch.branchId, imageUrl: null }))
          )
        ),
      ]);

      const multiBranchVendorIds = vendorChecks
        .filter((v) => v.totalCount > 1)
        .map((v) => v.vendorId);

      const branchImageMap: Record<number, string[]> = Object.fromEntries(
        imageResults
          .filter(
            (r): r is { branchId: number; imageUrl: string } =>
              r.imageUrl !== null
          )
          .map((r) => [r.branchId, [r.imageUrl]])
      );

      return {
        ...paginatedBranches,
        requestedPage: page,
        multiBranchVendorIds,
        branchImageMap,
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchBranchAllImages = createAppAsyncThunk(
  'branches/fetchBranchAllImages',
  async (branchId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.branchApi.getBranchImages(branchId, 1, 100);
      const urls = res.items?.map((img) => img.imageUrl) ?? [];
      return { branchId, urls };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const branchesSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    updateBranchRating: (
      state,
      action: {
        payload: {
          branchId: number;
          avgRating: number;
          totalReviewCount: number;
        };
      }
    ) => {
      const { branchId, avgRating, totalReviewCount } = action.payload;
      const branch = state.branches.find((b) => b.branchId === branchId);
      if (branch) {
        branch.avgRating = avgRating;
        branch.totalReviewCount = totalReviewCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBranches.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 1;
        if (page === 1) {
          state.status = 'pending';
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchActiveBranches.fulfilled, (state, action) => {
        const requestedPage = action.meta.arg?.page ?? 1;
        const {
          items,
          totalPages,
          totalCount,
          hasNext,
          multiBranchVendorIds,
          branchImageMap,
        } = action.payload;

        if (requestedPage === 1) {
          state.branches = items;
          state.multiBranchVendorIds = multiBranchVendorIds;
          state.branchImageMap = branchImageMap;
        } else {
          // Deduplicate by branchId
          const existingIds = new Set(state.branches.map((b) => b.branchId));
          const newItems = items.filter((b) => !existingIds.has(b.branchId));
          state.branches = [...state.branches, ...newItems];
          // Merge new multi-branch vendorIds
          const existingMulti = new Set(state.multiBranchVendorIds);
          multiBranchVendorIds.forEach((id) => existingMulti.add(id));
          state.multiBranchVendorIds = [...existingMulti];
          // Merge new image URLs
          Object.assign(state.branchImageMap, branchImageMap);
        }

        state.currentPage = requestedPage;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.hasNext = hasNext;
        state.status = 'succeeded';
        state.loadingMore = false;
      })
      .addCase(fetchActiveBranches.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMore = false;
        state.error = action.payload;
      })
      .addCase(fetchBranchAllImages.fulfilled, (state, action) => {
        const { branchId, urls } = action.payload;
        state.branchImageMap[branchId] = urls;
      });
  },
});

export const { updateBranchRating } = branchesSlice.actions;

export default branchesSlice.reducer;

// ── Selectors ──
export const selectBranches = (state: RootState): ActiveBranch[] =>
  state.branches.branches;

export const selectMultiBranchVendorIds = (state: RootState): number[] =>
  state.branches.multiBranchVendorIds;

export const selectBranchesStatus = (
  state: RootState
): BranchesState['status'] => state.branches.status;

export const selectBranchesHasNext = (state: RootState): boolean =>
  state.branches.hasNext;

export const selectBranchesLoadingMore = (state: RootState): boolean =>
  state.branches.loadingMore;

export const selectBranchesCurrentPage = (state: RootState): number =>
  state.branches.currentPage;

export const selectBranchImageMap = (
  state: RootState
): Record<number, string[]> => state.branches.branchImageMap;

/**
 * Utility function to compute display name for a branch.
 * @param branch - The branch data
 * @param isMultiBranch - Whether the vendor has multiple branches
 * @param branchLabel - Translated "branch" label (e.g., t('branch'))
 */
export const computeDisplayName = (
  branch: ActiveBranch,
  isMultiBranch: boolean,
  branchLabel: string
): string => {
  if (isMultiBranch) {
    return `${branch.vendorName ?? branch.name} - ${branchLabel} ${branch.name}`;
  }
  return branch.vendorName ?? branch.name;
};

/**
 * Selector to get a branch by ID.
 */
export const selectBranchById = (
  state: RootState,
  branchId: number
): ActiveBranch | undefined =>
  state.branches.branches.find((b) => b.branchId === branchId);

/**
 * Selector to check if a vendor has multiple branches.
 */
export const selectIsMultiBranchVendor = (
  state: RootState,
  vendorId: number
): boolean => state.branches.multiBranchVendorIds.includes(vendorId);
