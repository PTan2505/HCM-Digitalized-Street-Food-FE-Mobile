import type { RootState } from '@app/store';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface XPToastState {
  visible: boolean;
  xpEarned: number;
  previousXP: number;
  newXP: number;
}

const initialState: XPToastState = {
  visible: false,
  xpEarned: 0,
  previousXP: 0,
  newXP: 0,
};

const xpToastSlice = createSlice({
  name: 'xpToast',
  initialState,
  reducers: {
    showXPToast: (
      state,
      action: PayloadAction<{
        xpEarned: number;
        previousXP: number;
        newXP: number;
      }>
    ) => {
      state.visible = true;
      state.xpEarned = action.payload.xpEarned;
      state.previousXP = action.payload.previousXP;
      state.newXP = action.payload.newXP;
    },
    hideXPToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showXPToast, hideXPToast } = xpToastSlice.actions;
export default xpToastSlice.reducer;

export const selectXPToast = (state: RootState): XPToastState => state.xpToast;
