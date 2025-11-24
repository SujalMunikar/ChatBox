import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  acceptFriendRequest,
  getAllGlobalUsers,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoinFriendRequests,
  sendFriendRequest,
  unfriend,
} from "./friendsAction";
import { logout } from "../auth/authAction";

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
  hasLoadedMyFriends: boolean;
}

// Utility helpers reused across reducers and socket-driven updates.
type LooseFriendRecord = {
  id?: string;
  [key: string]: unknown;
};

const upsertFriendInList = (
  list: LooseFriendRecord[] | undefined,
  friend: LooseFriendRecord
) => {
  if (!friend?.id) {
    return list ?? [];
  }
  if (!Array.isArray(list)) {
    return [friend];
  }
  const index = list.findIndex((item) => item?.id === friend.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...friend };
    return list;
  }
  list.unshift(friend);
  return list;
};

const removeFriendFromList = (
  list: LooseFriendRecord[] | undefined,
  friendId: string
) => {
  if (!Array.isArray(list)) {
    return list;
  }
  return list.filter((item) => item?.id !== friendId);
};

const createInitialState = (): FriendsState => ({
  loading: false,
  success: false,
  allUsers: [],
  globalUsers: [],
  outgoingRequests: [],
  incomingRequests: [],
  myFriends: [],
  allMyFriends: [],
  hasLoadedMyFriends: false,
});

const initialState: FriendsState = createInitialState();

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
    syncFriendPresenceMap: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      const map = action.payload ?? {};
      // @ts-expect-error Presence updates rely on backend-provided objects.
      state.allMyFriends = state.allMyFriends.map((friend: any) => ({
        ...friend,
        isOnline: Boolean(map[friend.id]),
      }));
      // @ts-expect-error Filtered view stays consistent with the full collection.
      state.myFriends = state.myFriends.map((friend: any) => ({
        ...friend,
        isOnline: Boolean(map[friend.id]),
      }));
    },
    updateFriendPresence: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: string }>
    ) => {
      const { userId, isOnline, lastSeen } = action.payload;
      const update = (friend: any) =>
        friend.id === userId
          ? { ...friend, isOnline, lastSeen }
          : friend;
      // @ts-expect-error Arrays hold loosely typed friend objects.
      state.allMyFriends = state.allMyFriends.map(update);
      // @ts-expect-error Same loose typing for filtered list.
      state.myFriends = state.myFriends.map(update);
    },
    addIncomingRequest: (state, action: PayloadAction<any>) => {
      // Called by socket listener when another user sends us a request; avoids a full refetch and powers badges instantly.
      const request = action.payload;
      if (!request?.id) {
        return;
      }
      const alreadyExists = (state.incomingRequests as any[]).some(
        (item: any) => item?.id === request.id
      );
      if (alreadyExists) {
        return;
      }
      // @ts-expect-error Incoming request objects are provided by the backend.
      state.incomingRequests = [request, ...state.incomingRequests];
    },
    removeIncomingRequestBySenderId: (state, action: PayloadAction<string>) => {
      // Used when a sender cancels; keeps the incoming list/badge in sync without extra API calls.
      const senderId = action.payload;
      // @ts-expect-error Incoming request objects are loosely typed.
      state.incomingRequests = state.incomingRequests.filter(
        (item: any) => item?.senderId !== senderId
      );
    },
    removeOutgoingRequestByReceiverId: (state, action: PayloadAction<string>) => {
      // Invoked when the receiver declines; outbound list shrinks so "Request Sent" buttons reset.
      const receiverId = action.payload;
      // @ts-expect-error Outgoing requests are stored as raw backend objects.
      state.outgoingRequests = state.outgoingRequests.filter(
        (item: any) => item?.receiverId !== receiverId
      );
    },
    addFriend: (state, action: PayloadAction<any>) => {
      const friend = action.payload;
      if (!friend?.id) {
        return;
      }
      // @ts-expect-error Friend collections are loosely typed objects from the backend.
      state.allMyFriends = upsertFriendInList(state.allMyFriends, friend);
      // @ts-expect-error Same typing considerations for the filtered list.
      state.myFriends = upsertFriendInList(state.myFriends, friend);
      state.hasLoadedMyFriends = true;
    },
    removeFriendById: (state, action: PayloadAction<string>) => {
      const friendId = action.payload;
      if (!friendId) {
        return;
      }
      // @ts-expect-error See note on dynamic payload typing across friend collections.
      state.allMyFriends = removeFriendFromList(state.allMyFriends, friendId);
      // @ts-expect-error Filtered list shares the same loose typing model.
      state.myFriends = removeFriendFromList(state.myFriends, friendId);
    },
    resetFriendCollections: () => {
      return createInitialState();
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
          state.hasLoadedMyFriends = true;
        }
      }
    );
    builder.addCase(getMyFriends.rejected, (state) => {
      state.loading = false;
      state.success = false;
      state.hasLoadedMyFriends = true;
    });

    builder.addCase(
      sendFriendRequest.fulfilled,
      (state, { payload }: PayloadAction<unknown>) => {
        // @ts-expect-error The backend response includes the created friend request payload.
        const request = payload?.request;
        // Store the fresh outgoing request so buttons flip to "Request Sent" immediately after the thunk resolves.
        if (!request?.id) {
          return;
        }
        const exists = (state.outgoingRequests as any[]).some(
          (item: any) => item?.id === request.id
        );
        if (exists) {
          return;
        }
        // @ts-expect-error Outgoing requests are stored using backend-provided structures.
        state.outgoingRequests = [request, ...state.outgoingRequests];
      }
    );

    builder.addCase(
      acceptFriendRequest.fulfilled,
      (state, { payload }: PayloadAction<any>) => {
        state.loading = false;
        const friend = payload?.friend;
        const requestId = payload?.friendRequestId;
        if (requestId) {
          // @ts-expect-error Incoming requests contain dynamic fields from the backend response.
          state.incomingRequests = state.incomingRequests.filter(
            (item: any) => item?.id !== requestId
          );
        }
        if (friend?.id) {
          // Remove any stale incoming request entries that match the friend.
          // @ts-expect-error Arrays store raw backend objects.
          state.incomingRequests = state.incomingRequests.filter(
            (item: any) => item?.senderId !== friend.id
          );
          // @ts-expect-error Friend lists carry backend-provided payloads without strict typing.
          state.allMyFriends = upsertFriendInList(state.allMyFriends, friend);
          // @ts-expect-error Mirrored update for the filtered friend list.
          state.myFriends = upsertFriendInList(state.myFriends, friend);
          state.hasLoadedMyFriends = true;
        }
      }
    );

    builder.addCase(acceptFriendRequest.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(
      unfriend.fulfilled,
      (state, { payload }: PayloadAction<any>) => {
        state.loading = false;
        const removedFriendId = payload?.friendId ?? payload?.data?.friendId;
        if (removedFriendId) {
          // @ts-expect-error Friend lists maintain loose typing for backend payload compatibility.
          state.allMyFriends = removeFriendFromList(
            state.allMyFriends,
            removedFriendId
          );
          // @ts-expect-error Filtered list update mirrors allMyFriends adjustments.
          state.myFriends = removeFriendFromList(state.myFriends, removedFriendId);
          // @ts-expect-error Request collections share the same dynamic typing constraints.
          state.incomingRequests = state.incomingRequests.filter(
            (item: any) => item?.senderId !== removedFriendId
          );
          // @ts-expect-error Request collections share the same dynamic typing constraints.
          state.outgoingRequests = state.outgoingRequests.filter(
            (item: any) => item?.receiverId !== removedFriendId
          );
        }
      }
    );

    builder.addCase(logout.fulfilled, () => createInitialState());
  },
});

// Action creators are generated for each case reducer function
export const {
  filterGlobalFriends,
  filterAllMyFriends,
  syncFriendPresenceMap,
  updateFriendPresence,
  addIncomingRequest,
  removeIncomingRequestBySenderId,
  removeOutgoingRequestByReceiverId,
  addFriend,
  removeFriendById,
  resetFriendCollections,
} = friendsSlice.actions;

export default friendsSlice.reducer;
