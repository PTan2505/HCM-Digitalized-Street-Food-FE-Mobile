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
  startDate?: string | null;
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
  /** Whether the user's copy is still usable (false = already used) */
  isAvailable?: boolean;
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
  campaignId: dto.campaignId != null ? String(dto.campaignId) : '',
  title: dto.voucherName,
  description: dto.description ?? null,
  discountType:
    dto.voucherType === 'PERCENTAGE' ? 'percentage' : 'fixed_amount',
  discountValue: dto.discountValue,
  minOrderValueVnd: dto.minAmountRequired ?? null,
  maxDiscountValue: dto.maxDiscountValue,
  startDate: dto.startDate ?? null,
  // Prefer expiredDate (hard cutoff), fall back to endDate (campaign window)
  expiresAt:
    dto.expiredDate ??
    dto.endDate ??
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  claimedAt: new Date().toISOString(),
  // No campaignId = marketplace/platform voucher; campaignId = vendor campaign
  source: dto.campaignId != null ? 'restaurant' : 'system',
  voucherCode: dto.voucherCode,
  isAvailable: dto.isAvailable,
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
    vouchers.filter(
      (v) => new Date(v.expiresAt) > new Date() && v.isAvailable !== false
    )
);

export const selectExpiredVouchers = createSelector(
  [selectVouchers],
  (vouchers): Voucher[] =>
    vouchers.filter(
      (v) => new Date(v.expiresAt) <= new Date() || v.isAvailable === false
    )
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
