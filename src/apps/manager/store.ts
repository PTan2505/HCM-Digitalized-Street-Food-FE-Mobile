import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import branchesReducer from '@slices/branches';
import campaignsReducer from '@slices/campaigns';
import dietaryReducer from '@slices/dietary';
import directOrderingReducer from '@slices/directOrdering';
import managerAuthReducer from '@slices/managerAuth';
import notificationsReducer from '@slices/notifications';
import questsReducer from '@slices/quests';
import tastesReducer from '@slices/tastes';
import vendorsReducer from '@slices/vendors';

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
  managerAuth: managerAuthReducer,
});

export const managerStore = configureStore({
  reducer: rootReducer,
});

export type ManagerRootState = ReturnType<typeof managerStore.getState>;
export type ManagerAppDispatch = typeof managerStore.dispatch;
export type ManagerAppStore = typeof managerStore;
