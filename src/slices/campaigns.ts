import type { RootState } from '@app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { UserVoucherApiDto } from '@features/campaigns/api/voucherApi';

// ---------------------------------------------------------------------------
// Voucher type (not generated — local to the mobile client)
// ---------------------------------------------------------------------------
export interface Voucher {
  voucherId: string;
  campaignId: string;
  title: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValueVnd?: number | null;
  maxDiscountValue?: number | null;
  expiresAt: string;
  claimedAt: string;
  /** 'system' = earned via quest/platform campaign; 'restaurant' = direct vendor claim */
  source: 'system' | 'restaurant';
  /** For restaurant vouchers: the specific vendor */
  vendorId?: string;
  vendorName?: string;
  /** For system vouchers: the campaign name (used for scope display) */
  campaignName?: string;
  /** Voucher code for display / checkout */
  voucherCode?: string;
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
// Thunk — fetch the authenticated user's vouchers from the server
// ---------------------------------------------------------------------------
const mapApiVoucher = (dto: UserVoucherApiDto): Voucher => ({
  voucherId: String(dto.voucherId),
  campaignId: '',
  title: dto.voucherName,
  discountType:
    dto.voucherType === 'PERCENTAGE' ? 'percentage' : 'fixed_amount',
  discountValue: dto.discountValue,
  maxDiscountValue: dto.maxDiscountValue,
  // API doesn't return expiry — use a sentinel far-future date so the voucher
  // shows as active; real expiry is available once the user claims via a campaign.
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  claimedAt: new Date().toISOString(),
  source: 'system',
  voucherCode: dto.voucherCode,
});

export const fetchMyVouchers = createAppAsyncThunk(
  'campaigns/fetchMyVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await axiosApi.voucherApi.getMyVouchers();
      return data.map(mapApiVoucher);
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
        // Merge: keep existing rich vouchers, add/update from API
        const existing = new Map(state.vouchers.map((v) => [v.voucherId, v]));
        action.payload.forEach((apiVoucher) => {
          if (!existing.has(apiVoucher.voucherId)) {
            existing.set(apiVoucher.voucherId, apiVoucher);
          } else {
            // Patch voucherCode if missing on the existing entry
            const current = existing.get(apiVoucher.voucherId)!;
            if (!current.voucherCode && apiVoucher.voucherCode) {
              existing.set(apiVoucher.voucherId, {
                ...current,
                voucherCode: apiVoucher.voucherCode,
              });
            }
          }
        });
        state.vouchers = Array.from(existing.values());
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
    vouchers.filter((v) => new Date(v.expiresAt) > new Date())
);

export const selectExpiredVouchers = createSelector(
  [selectVouchers],
  (vouchers): Voucher[] =>
    vouchers.filter((v) => new Date(v.expiresAt) <= new Date())
);

export const selectSystemVouchers = createSelector(
  [selectActiveVouchers],
  (vouchers): Voucher[] => vouchers.filter((v) => v.source === 'system')
);

export const selectRestaurantVouchers = createSelector(
  [selectActiveVouchers],
  (vouchers): Voucher[] => vouchers.filter((v) => v.source === 'restaurant')
);

export const selectQuests = (state: RootState): QuestProgress[] =>
  state.campaigns.quests ?? [];
