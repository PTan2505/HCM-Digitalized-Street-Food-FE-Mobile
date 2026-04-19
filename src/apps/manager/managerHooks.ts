import { createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { ManagerAppDispatch, ManagerRootState } from '@manager-app/store';

export const useManagerDispatch = useDispatch.withTypes<ManagerAppDispatch>();
export const useManagerSelector = useSelector.withTypes<ManagerRootState>();
export const createManagerAsyncThunk = createAsyncThunk.withTypes<{
  state: ManagerRootState;
  dispatch: ManagerAppDispatch;
}>();
