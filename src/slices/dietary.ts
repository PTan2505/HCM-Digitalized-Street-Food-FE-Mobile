import type { RootState } from '@app/store';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

import type { DietaryPreference } from '@features/user/types/dietaryPreference';
import type {
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
  UserDietary,
} from '@features/user/types/userDietary';

export interface DietaryState {
  dietaryPreferences: DietaryPreference[];
  userDietaryPreferences: UserDietary[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: DietaryState = {
  dietaryPreferences: [],
  userDietaryPreferences: [],
  status: 'idle',
  error: null,
};

export const getAllDietaryPreferences = createAppAsyncThunk(
  'dietary/getAllDietaryPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response: DietaryPreference[] =
        await axiosApi.dietaryPreferenceApi.getAllDietaryPreferences();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createOrUpdateUserDietaryPreferences = createAppAsyncThunk(
  'dietary/createOrUpdateUserDietaryPreferences',
  async (payload: CreateOrUpdateUserDietaryRequest, { rejectWithValue }) => {
    try {
      const response: CreateOrUpdateUserDietaryResponse =
        await axiosApi.userDietaryApi.createOrUpdateUserDietaryPreferences(
          payload
        );
      return response;
    } catch (error) {
      console.error(error);

      return rejectWithValue(error);
    }
  }
);

export const getUserDietaryPreferences = createAppAsyncThunk(
  'dietary/getUserDietaryPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response: UserDietary[] =
        await axiosApi.userDietaryApi.getUserDietaryPreferences();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const dietarySlice = createSlice({
  name: 'dietary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllDietaryPreferences.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(getAllDietaryPreferences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dietaryPreferences = action.payload;
      })
      .addCase(getAllDietaryPreferences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createOrUpdateUserDietaryPreferences.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createOrUpdateUserDietaryPreferences.fulfilled,
        (state, action) => {
          state.status = 'succeeded';
          const selectedIds = action.meta.arg;
          state.userDietaryPreferences = state.dietaryPreferences.filter(
            (pref) => selectedIds.includes(pref.dietaryPreferenceId)
          );
        }
      )
      .addCase(
        createOrUpdateUserDietaryPreferences.rejected,
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      )
      .addCase(getUserDietaryPreferences.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(getUserDietaryPreferences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userDietaryPreferences = action.payload;
      })
      .addCase(getUserDietaryPreferences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectDietaryState = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.dietary.status;
export const selectUserDietaryPreferences = (state: RootState): UserDietary[] =>
  state.dietary.userDietaryPreferences;
export const selectDietaryPreferences = (
  state: RootState
): DietaryPreference[] => state.dietary.dietaryPreferences;
export default dietarySlice.reducer;
