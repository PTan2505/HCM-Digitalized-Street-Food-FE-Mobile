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
import settingsReducer from '@slices/settings';
import xpToastReducer from '@slices/xpToast';

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
  settings: settingsReducer,
  xpToast: xpToastReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
