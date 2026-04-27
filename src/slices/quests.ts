import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { QuestTaskRewardItem } from '@features/customer/quests/types/quest';
import type { RootState } from '@customer-app/store';

export interface PendingQuestReward {
  rewards: QuestTaskRewardItem[];
  xpEarned?: number;
}

interface QuestsState {
  pendingReward: PendingQuestReward | null;
}

const initialState: QuestsState = {
  pendingReward: null,
};

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setPendingReward: (state, action: PayloadAction<PendingQuestReward>) => {
      state.pendingReward = action.payload;
    },
    clearPendingReward: (state) => {
      state.pendingReward = null;
    },
  },
});

export const { setPendingReward, clearPendingReward } = questsSlice.actions;
export default questsSlice.reducer;

export const selectPendingReward = (
  state: RootState
): PendingQuestReward | null => state.quests.pendingReward;
