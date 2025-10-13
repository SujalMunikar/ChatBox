import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import conversationReducer from "./features/conversation/conversationSlice";
import socketReducer from "./features/socket/socketSlice";
import uiReducer from "./features/UI/UISlice";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import friendsReducer from "./features/friends/friendsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    conversation: conversationReducer,
    socket: socketReducer,
    ui: uiReducer,
    friends: friendsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
