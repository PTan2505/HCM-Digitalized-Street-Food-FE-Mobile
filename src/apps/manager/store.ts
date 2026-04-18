import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import branchesReducer from '@slices/branches';
import campaignsReducer from '@slices/campaigns';
import dietaryReducer from '@slices/dietary';
import directOrderingReducer from '@slices/directOrdering';
import notificationsReducer from '@slices/notifications';
import questsReducer from '@slices/quests';
import tastesReducer from '@slices/tastes';
import vendorsReducer from '@slices/vendors';

// Same reducer shape as customer so shared selectors and hooks stay compatible.
// Manager-specific slices can be added here as the feature grows.
const rootReducer = combineReducers({
  user: authReducer,
  dietary: dietaryReducer,
  vendors: vendorsReducer,
  branches: branchesReducer,
  tastes: tastesReducer,
  directOrdering: directOrderingReducer,
  notifications: notificationsReducer,
  campaigns: campaignsReducer,
  quests: questsReducer,
});

export const managerStore = configureStore({
  reducer: rootReducer,
});

export type ManagerRootState = ReturnType<typeof managerStore.getState>;
export type ManagerAppDispatch = typeof managerStore.dispatch;
export type ManagerAppStore = typeof managerStore;
