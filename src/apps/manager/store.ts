import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import branchesReducer from '@slices/branches';
import campaignsReducer from '@slices/campaigns';
import dietaryReducer from '@slices/dietary';
import directOrderingReducer from '@slices/directOrdering';
import managerAuthReducer from '@slices/managerAuth';
import questsReducer from '@slices/quests';
import xpToastReducer from '@slices/xpToast';

const rootReducer = combineReducers({
  user: authReducer,
  dietary: dietaryReducer,
  branches: branchesReducer,
  directOrdering: directOrderingReducer,
  campaigns: campaignsReducer,
  quests: questsReducer,
  managerAuth: managerAuthReducer,
  xpToast: xpToastReducer,
});

export const managerStore = configureStore({
  reducer: rootReducer,
});

export type ManagerRootState = ReturnType<typeof managerStore.getState>;
export type ManagerAppDispatch = typeof managerStore.dispatch;
export type ManagerAppStore = typeof managerStore;
