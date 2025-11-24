import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import conversationReducer from "./features/conversation/conversationSlice";
import socketReducer from "./features/socket/socketSlice";
import uiReducer from "./features/UI/UISlice";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import friendsReducer from "./features/friends/friendsSlice";

// Central Redux store wiring together all feature slices.

export const store = configureStore({
  reducer: {
    auth: authReducer, // Handles login/logout flow plus token persistence status.
    user: userReducer, // Keeps the active user's profile details and conversation context.
    conversation: conversationReducer, // Tracks chat threads, messages, and active conversation metadata.
    socket: socketReducer, // Reflects WebSocket connection status + emitted events.
    ui: uiReducer, // Stores theme, layout, and other presentation preferences.
    friends: friendsReducer, // Powers global directory, friend lists, and request queues.
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Re-export strongly typed helpers so components can use them without re-declaring types.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
