import type { RootState } from '@app/store';
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

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
  expiresAt: string;
  claimedAt: string;
  /** 'system' = earned via quest; 'restaurant' = direct claim */
  source: 'system' | 'restaurant';
  /** For restaurant vouchers: the specific vendor */
  vendorId?: string;
  vendorName?: string;
  /** For system vouchers: the campaign name (used for scope display) */
  campaignName?: string;
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
}

const initialState: CampaignsState = {
  vouchers: [],
  quests: [],
};

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    addVoucher: (state, action: PayloadAction<Voucher>) => {
      state.vouchers.push(action.payload);
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
});

export const { addVoucher, updateQuestProgress } = campaignsSlice.actions;

export default campaignsSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectVouchers = (state: RootState): Voucher[] =>
  state.campaigns.vouchers ?? [];

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

export const selectQuests = (state: RootState): QuestProgress[] =>
  state.campaigns.quests ?? [];
