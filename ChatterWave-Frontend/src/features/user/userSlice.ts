import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getUsers } from "./userAction";
import { UserType } from "../../Types/user.type";

export interface UserState {
  value: number;
  users: unknown;
  friends: Array<UserType> | null;
  user: UserType | null;
  currConversationUser: UserType | null;
  loading: boolean;
  success: boolean;
}

const initialState: UserState = {
  value: 0,
  users: null,
  friends: null,
  currConversationUser: null,
  user: null,
  loading: false,
  success: false,
};

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
    setConversationUser: (state, action: PayloadAction<unknown>) => {
      state.user = action.payload;
    },
    setCurrentConversationUser: (state, action: PayloadAction<unknown>) => {
      state.currConversationUser = action.payload;
    },
  },
  extraReducers(builder) {
    //GET USERS -> FRIENDS
    builder.addCase(getUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getUsers.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
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
  },
});

// Action creators are generated for each case reducer function
export const { setConversationUser, setCurrentConversationUser } =
  userSlice.actions;

export default userSlice.reducer;
