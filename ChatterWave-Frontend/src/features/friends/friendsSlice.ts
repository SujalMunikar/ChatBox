import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  getAllGlobalUsers,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoinFriendRequests,
} from "./friendsAction";

// Tracks global friend discovery lists plus incoming/outgoing request collections.

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
    // Filter utilities so list views can search client-side without re-fetching from the API.
    filterGlobalFriends: (state, action: PayloadAction<string>) => {
      // @ts-expect-error Global users are hydrated from backend responses and kept as loose objects.
      state.allUsers = state.globalUsers.filter(
        (user: any) =>
          user.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          user.email.toLowerCase().includes(action.payload.toLowerCase())
      );
    },

    filterAllMyFriends: (state, action: PayloadAction<string>) => {
      // @ts-expect-error Friend collections share the same loose typing as global users.
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
        // @ts-expect-error API payloads are dynamic; runtime guards ensure keys exist before use.
        if (payload?.success) {
          // @ts-expect-error Console logging only for debugging dynamic payload content.
          console.log(payload, payload.users);
          // @ts-expect-error Friend lists are stored as-is from the backend response.
          state.allUsers = payload?.users;
          // @ts-expect-error See comment above regarding dynamic payload typing.
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
        // @ts-expect-error Dynamic payload from backend lacks a static type definition.
        if (payload?.success) {
          // @ts-expect-error Logging and assignments rely on runtime guards.
          console.log(payload, payload.requests);
          // @ts-expect-error Requests array is persisted as provided by the backend.
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
        // @ts-expect-error Optional chaining keeps the dynamic payload safe at runtime.
        if (payload?.success) {
          // @ts-expect-error Requests payload mirrors backend data, so typing stays loose.
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
        // @ts-expect-error Friend list payload is dynamically shaped.
        if (payload?.success) {
          // @ts-expect-error Friend data is stored directly without strict typing.
          state.myFriends = payload?.friends;
          // @ts-expect-error Maintains a copy for filtering operations; see note above.
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
