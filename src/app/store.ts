import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@slices/auth';
import dietaryReducer from '@slices/dietary';

const rootReducer = combineReducers({
  user: authReducer,
  dietary: dietaryReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
