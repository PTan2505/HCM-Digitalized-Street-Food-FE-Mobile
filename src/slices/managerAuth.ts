import type { ManagerBranch } from '@manager/branch/branch.types';
import { axiosApi } from '@lib/api/apiInstance';
import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export interface ManagerAuthState {
  branch: ManagerBranch | null;
  branchId: number | null;
  managerId: number | null;
  isLoading: boolean;
  error: unknown;
}

const initialState: ManagerAuthState = {
  branch: null,
  branchId: null,
  managerId: null,
  isLoading: false,
  error: null,
};

export const fetchManagerBranch = createAsyncThunk(
  'managerAuth/fetchBranch',
  async (_, { rejectWithValue }) => {
    try {
      return await axiosApi.managerBranchApi.getManagerMyBranch();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const managerAuthSlice = createSlice({
  name: 'managerAuth',
  initialState,
  reducers: {
    clearManagerBranch(state) {
      state.branch = null;
      state.branchId = null;
      state.managerId = null;
      state.error = null;
    },
    setManagerBranch(state, action: PayloadAction<ManagerBranch>) {
      state.branch = action.payload;
      state.branchId = action.payload.branchId;
      state.managerId = action.payload.managerId;
    },
    setActiveBranchId(state, action: PayloadAction<number>) {
      state.branchId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchManagerBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branch = action.payload;
        state.branchId = action.payload.branchId;
        state.managerId = action.payload.managerId;
      })
      .addCase(fetchManagerBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error;
      });
  },
});

export const { clearManagerBranch, setManagerBranch, setActiveBranchId } =
  managerAuthSlice.actions;

export const selectManagerBranch = (state: {
  managerAuth: ManagerAuthState;
}): ManagerBranch | null => state.managerAuth.branch;

export const selectManagerBranchId = (state: {
  managerAuth: ManagerAuthState;
}): number | null => state.managerAuth.branchId;

export const selectManagerVendorId = (state: {
  managerAuth: ManagerAuthState;
}): number | null => state.managerAuth.branch?.vendorId ?? null;

export const selectManagerIsLoading = (state: {
  managerAuth: ManagerAuthState;
}): boolean => state.managerAuth.isLoading;

export default managerAuthSlice.reducer;
