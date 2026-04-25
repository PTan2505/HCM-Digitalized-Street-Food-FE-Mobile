import { createSlice } from '@reduxjs/toolkit';
import { userLogout } from '@slices/auth';

export interface DietaryState {
  // placeholder — dietary data is now fetched via React Query
}

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
