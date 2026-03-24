import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import branchesReducer from '@slices/branches';
import dietaryReducer from '@slices/dietary';
import directOrderingReducer from '@slices/directOrdering';
import notificationsReducer from '@slices/notifications';
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
});

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
