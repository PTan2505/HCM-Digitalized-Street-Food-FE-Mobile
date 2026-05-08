import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import connectivityReducer from '@slices/connectivity';
import dietaryReducer from '@slices/dietary';
import managerAuthReducer from '@slices/managerAuth';
import questsReducer from '@slices/quests';
import xpToastReducer from '@slices/xpToast';

const rootReducer = combineReducers({
  user: authReducer,
  dietary: dietaryReducer,
  quests: questsReducer,
  managerAuth: managerAuthReducer,
  xpToast: xpToastReducer,
  connectivity: connectivityReducer,
});

export const managerStore = configureStore({
  reducer: rootReducer,
});

export type ManagerRootState = ReturnType<typeof managerStore.getState>;
export type ManagerAppDispatch = typeof managerStore.dispatch;
export type ManagerAppStore = typeof managerStore;
