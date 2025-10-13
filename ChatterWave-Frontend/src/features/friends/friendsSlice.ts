import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  getAllGlobalUsers,
  getConversations,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoinFriendRequests,
  sendMessage,
} from "./friendsAction";

export interface FriendsState {
  loading: boolean;
  success: boolean;
  allUsers: [];
  globalUsers: [];
  outgoingRequests: [];
  incomingRequests: [];
  myFriends: [];
  allMyFriends: [];
}

const initialState: FriendsState = {
  loading: false,
  success: false,
  allUsers: [],
  globalUsers: [],
  outgoingRequests: [],
  incomingRequests: [],
  myFriends: [],
  allMyFriends: [],
};

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    filterGlobalFriends: (state, action: PayloadAction<string>) => {
      state.allUsers = state.globalUsers.filter(
        (user: any) =>
          user.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          user.email.toLowerCase().includes(action.payload.toLowerCase())
      );
    },

    filterAllMyFriends: (state, action: PayloadAction<string>) => {
      state.myFriends = state.allMyFriends.filter(
        (user: any) =>
          user.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          user.email.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
  },
  extraReducers(builder) {
    // get all global users
    builder.addCase(getAllGlobalUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getAllGlobalUsers.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        if (payload?.success) {
          console.log(payload, payload.users);
          state.allUsers = payload?.users;
          state.globalUsers = payload?.users;
          state.loading = false;
          state.success = true;
        }
      }
    );
    builder.addCase(getAllGlobalUsers.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    // get all outgoing friend requests
    builder.addCase(getOutgoinFriendRequests.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getOutgoinFriendRequests.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        if (payload?.success) {
          console.log(payload, payload.requests);
          state.outgoingRequests = payload?.requests;
          state.loading = false;
          state.success = true;
        }
      }
    );
    builder.addCase(getOutgoinFriendRequests.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    // get all incoming friend requests
    builder.addCase(getIncomingFriendRequests.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getIncomingFriendRequests.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        if (payload?.success) {
          state.incomingRequests = payload?.requests;
          state.loading = false;
          state.success = true;
        }
      }
    );
    builder.addCase(getIncomingFriendRequests.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    //get my friends
    builder.addCase(getMyFriends.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getMyFriends.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        if (payload?.success) {
          state.myFriends = payload?.friends;
          state.allMyFriends = payload?.friends;
          state.loading = false;
          state.success = true;
        }
      }
    );
    builder.addCase(getMyFriends.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });
  },
});

// Action creators are generated for each case reducer function
export const { filterGlobalFriends, filterAllMyFriends } = friendsSlice.actions;

export default friendsSlice.reducer;
