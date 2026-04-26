import { createSlice } from '@reduxjs/toolkit';
import { userLogout } from '@slices/auth';

export type DietaryState = Record<string, never>;

const initialState: DietaryState = {};

export const dietarySlice = createSlice({
  name: 'dietary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userLogout.fulfilled, () => initialState);
  },
});

export default dietarySlice.reducer;
