import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { deleteAccount, getUsers } from "./userAction";
import { UserType } from "../../Types/user.type";
import { logout } from "../auth/authAction";

export interface UserState {
  value: number;
  users: unknown;
  friends: Array<UserType> | null;
  user: UserType | null;
  currConversationUser: UserType | null;
  loading: boolean;
  success: boolean;
}

// Stores data related to the people the current user chats with along with presence metadata.
const createInitialState = (): UserState => ({
  value: 0,
  users: null,
  friends: null,
  currConversationUser: null,
  user: null,
  loading: false,
  success: false,
});

const initialState: UserState = createInitialState();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setConversationUser: (state, action: PayloadAction<UserType | null>) => {
      // Legacy naming: stores whichever user the chat page is about to open.
      state.user = action.payload;
    },
    setCurrentConversationUser: (
      state,
      action: PayloadAction<UserType | null>
    ) => {
      // Marks the active chat partner so components can read presence/metadata quickly.
      state.currConversationUser = action.payload;
    },
    syncUserPresenceMap: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      const map = action.payload ?? {};
      if (state.friends) {
        state.friends = state.friends.map((friend) => ({
          ...friend,
          isOnline: Boolean(map[friend.id]),
        }));
      }
      if (state.user && state.user.id in map) {
        state.user = {
          ...state.user,
          isOnline: Boolean(map[state.user.id]),
        } as UserType;
      }
      if (state.currConversationUser) {
        state.currConversationUser = {
          ...state.currConversationUser,
          isOnline: Boolean(map[state.currConversationUser.id]),
        } as UserType;
      }
    },
    updateUserPresence: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: string }>
    ) => {
      const { userId, isOnline, lastSeen } = action.payload;
      if (state.friends) {
        state.friends = state.friends.map((friend) =>
          friend.id === userId ? { ...friend, isOnline, lastSeen } : friend
        );
      }
      if (state.currConversationUser?.id === userId && state.currConversationUser) {
        state.currConversationUser = {
          ...state.currConversationUser,
          isOnline,
          lastSeen,
        };
      }
      if (state.user?.id === userId && state.user) {
        state.user = {
          ...state.user,
          isOnline,
          lastSeen,
        } as UserType;
      }
    },
  },
  extraReducers(builder) {
    //GET USERS -> FRIENDS
    builder.addCase(getUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getUsers.fulfilled,
      (state, { payload }: PayloadAction<any>) => {
        if (payload?.success) {
          state.users = payload.data;
          state.friends = payload.data.users;
        }
        state.loading = false;
      }
    );
    builder.addCase(getUsers.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(deleteAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteAccount.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.success = true;
    });
    builder.addCase(deleteAccount.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(logout.fulfilled, () => createInitialState());
  },
});

// Action creators are generated for each case reducer function
export const {
  setConversationUser,
  setCurrentConversationUser,
  syncUserPresenceMap,
  updateUserPresence,
} = userSlice.actions;

export default userSlice.reducer;
