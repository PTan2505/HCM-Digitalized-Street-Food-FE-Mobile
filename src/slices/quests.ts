import type { RootState } from '@customer-app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { APIErrorResponse } from '@custom-types/apiResponse';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error)
    return (error as APIErrorResponse).message ?? fallback;
  return fallback;
};

import type {
  PaginatedQuests,
  PaginatedUserQuests,
  QuestTaskRewardItem,
  UserQuestProgress,
} from '@features/customer/quests/types/quest';

export interface PendingQuestReward {
  rewards: QuestTaskRewardItem[];
  xpEarned?: number;
}

export interface QuestsState {
  publicQuests: PaginatedQuests | null;
  myQuests: PaginatedUserQuests | null;
  currentQuestDetail: UserQuestProgress | null;
  pendingReward: PendingQuestReward | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuestsState = {
  publicQuests: null,
  myQuests: null,
  currentQuestDetail: null,
  pendingReward: null,
  loading: false,
  error: null,
};

export const fetchPublicQuests = createAppAsyncThunk(
  'quests/fetchPublicQuests',
  async (
    {
      pageNumber,
      pageSize,
      isStandalone,
      isTierUp,
    }: {
      pageNumber?: number;
      pageSize?: number;
      isStandalone?: boolean;
      isTierUp?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await axiosApi.questApi.getPublicQuests(
        pageNumber,
        pageSize,
        isStandalone,
        isTierUp
      );
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to fetch quests')
      );
    }
  }
);

export const enrollInQuest = createAppAsyncThunk(
  'quests/enrollInQuest',
  async (questId: number, { rejectWithValue }) => {
    try {
      return await axiosApi.questApi.enrollInQuest(questId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to enroll in quest')
      );
    }
  }
);

export const stopQuest = createAppAsyncThunk(
  'quests/stopQuest',
  async (questId: number, { rejectWithValue }) => {
    try {
      return await axiosApi.questApi.stopQuest(questId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to stop quest')
      );
    }
  }
);

export const fetchMyQuests = createAppAsyncThunk(
  'quests/fetchMyQuests',
  async (
    {
      status,
      isTierUp,
      pageNumber,
      pageSize,
    }: {
      status?: string;
      isTierUp?: boolean;
      pageNumber?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      return await axiosApi.questApi.getMyQuests(
        status,
        isTierUp,
        pageNumber,
        pageSize
      );
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to fetch my quests')
      );
    }
  }
);

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    clearQuestError: (state) => {
      state.error = null;
    },
    setPendingReward: (state, action: PayloadAction<PendingQuestReward>) => {
      state.pendingReward = action.payload;
    },
    clearPendingReward: (state) => {
      state.pendingReward = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.publicQuests = action.payload;
      })
      .addCase(fetchPublicQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(enrollInQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInQuest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestDetail = action.payload;
      })
      .addCase(enrollInQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(stopQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopQuest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestDetail = action.payload;
      })
      .addCase(stopQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.myQuests = action.payload;
      })
      .addCase(fetchMyQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearQuestError, setPendingReward, clearPendingReward } =
  questsSlice.actions;
export default questsSlice.reducer;

// Selectors
export const selectPublicQuests = (state: RootState): PaginatedQuests | null =>
  state.quests.publicQuests;
export const selectMyQuests = (state: RootState): PaginatedUserQuests | null =>
  state.quests.myQuests;
export const selectQuestsLoading = (state: RootState): boolean =>
  state.quests.loading;
export const selectQuestsError = (state: RootState): string | null =>
  state.quests.error;
export const selectPendingReward = (
  state: RootState
): PendingQuestReward | null => state.quests.pendingReward;
