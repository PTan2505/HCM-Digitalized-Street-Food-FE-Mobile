import type { RootState } from '@app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

// ---------------------------------------------------------------------------
// Voucher — mirrors UserVoucherResponseDto from the backend
// ---------------------------------------------------------------------------
export interface Voucher {
  userVoucherId: number;
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  description: string | null;
  voucherType: string;
  discountValue: number;
  minAmountRequired: number | null;
  maxDiscountValue: number | null;
  startDate: string | null;
  endDate: string | null;
  expiredDate: string | null;
  isActive: boolean;
  campaignId: number | null;
  quantity: number;
  isAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Quest progress type (not generated — local to the mobile client)
// ---------------------------------------------------------------------------
export interface QuestProgress {
  campaignId: string;
  questDescription: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
}

// ---------------------------------------------------------------------------
// State — client-only data (vouchers & quests).
// Server-fetched campaign lists are handled by React Query hooks.
// ---------------------------------------------------------------------------
export interface CampaignsState {
  vouchers: Voucher[];
  quests: QuestProgress[];
  vouchersLoading: boolean;
  vouchersError: string | null;
}

const initialState: CampaignsState = {
  vouchers: [],
  quests: [],
  vouchersLoading: false,
  vouchersError: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getExpiresAt = (v: Voucher): Date =>
  new Date(v.expiredDate ?? v.endDate ?? '9999-12-31');

// ---------------------------------------------------------------------------
// Thunk — fetch the authenticated user's vouchers from the server
// ---------------------------------------------------------------------------
export const fetchMyVouchers = createAppAsyncThunk(
  'campaigns/fetchMyVouchers',
  async (_, { rejectWithValue }) => {
    try {
      return await axiosApi.voucherApi.getMyVouchers();
    } catch {
      return rejectWithValue('Failed to load vouchers');
    }
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    addVoucher: (state, action: PayloadAction<Voucher>) => {
      const exists = state.vouchers.some(
        (v) => v.voucherId === action.payload.voucherId
      );
      if (!exists) {
        state.vouchers.push(action.payload);
      }
    },
    updateQuestProgress: (state, action: PayloadAction<QuestProgress>) => {
      const idx = state.quests.findIndex(
        (q) => q.campaignId === action.payload.campaignId
      );
      if (idx >= 0) {
        state.quests[idx] = action.payload;
      } else {
        state.quests.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVouchers.pending, (state) => {
        state.vouchersLoading = true;
        state.vouchersError = null;
      })
      .addCase(fetchMyVouchers.fulfilled, (state, action) => {
        state.vouchersLoading = false;
        // Full upsert: API is the source of truth — replace existing entries,
        // keep locally-added vouchers (e.g. addVoucher) that the API didn't return.
        const incoming = new Map(action.payload.map((v) => [v.voucherId, v]));
        const merged = state.vouchers.map((v) =>
          incoming.has(v.voucherId) ? incoming.get(v.voucherId)! : v
        );
        action.payload.forEach((apiVoucher) => {
          if (!merged.some((v) => v.voucherId === apiVoucher.voucherId)) {
            merged.push(apiVoucher);
          }
        });
        state.vouchers = merged;
      })
      .addCase(fetchMyVouchers.rejected, (state, action) => {
        state.vouchersLoading = false;
        state.vouchersError = action.payload as string;
      });
  },
});

export const { addVoucher, updateQuestProgress } = campaignsSlice.actions;

export default campaignsSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectVouchers = (state: RootState): Voucher[] =>
  state.campaigns.vouchers ?? [];

export const selectVouchersLoading = (state: RootState): boolean =>
  state.campaigns.vouchersLoading;

export const selectVouchersError = (state: RootState): string | null =>
  state.campaigns.vouchersError;

export const selectActiveVouchers = createSelector(
  [selectVouchers],
  (vouchers): Voucher[] =>
    vouchers.filter((v) => getExpiresAt(v) > new Date() && v.isAvailable)
);

export const selectExpiredVouchers = createSelector(
  [selectVouchers],
  (vouchers): Voucher[] =>
    vouchers.filter((v) => getExpiresAt(v) <= new Date() || !v.isAvailable)
);

/** Marketplace / platform vouchers — no campaign attached */
export const selectSystemVouchers = createSelector(
  [selectActiveVouchers],
  (vouchers): Voucher[] => vouchers.filter((v) => v.campaignId == null)
);

/** All vouchers tied to a campaign (restaurant or platform campaign) */
export const selectCampaignVouchers = createSelector(
  [selectActiveVouchers],
  (vouchers): Voucher[] => vouchers.filter((v) => v.campaignId != null)
);

/** Alias kept for backward compatibility — same as campaign vouchers */
export const selectRestaurantVouchers = selectCampaignVouchers;

export const selectQuests = (state: RootState): QuestProgress[] =>
  state.campaigns.quests ?? [];
