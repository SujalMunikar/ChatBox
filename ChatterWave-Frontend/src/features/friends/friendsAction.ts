import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axiosConfig";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../config/urlConfig";

// Friend management thunks cover directory lookups and the full request lifecycle.

export const getAllGlobalUsers = createAsyncThunk(
  "getAllGlobalUsers",
  async () => {
    try {
      const res = await api.get(`${BACKEND_URL}/friendship/get-all-users`);
      if (res.status === 200) {
        // Remove this toast - it's not necessary for background data fetching
        // toast.success("All global users fetch success");
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

// get all friends only
export const getMyFriends = createAsyncThunk("getMyFriends", async () => {
  try {
    const res = await api.get(`${BACKEND_URL}/friendship/get-my-friends`);
    if (res.status === 200) {
      // Remove this toast - it's not necessary for background data fetching
      // toast.success("My Friends fetch success");
      return res?.data;
    }
  } catch (error: unknown) {
    console.log(error);
  }
});

// get all incoming friend requests
export const getIncomingFriendRequests = createAsyncThunk(
  "getIncomingFriendRequests",
  async () => {
    try {
      const res = await api.get(
        `${BACKEND_URL}/friendship/incoming-friend-requests`
      );
      if (res.status === 200) {
        // Keep this one - user actions should provide feedback
        // toast.success(res?.data?.message);
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

//get all outgoing friend requests
export const getOutgoinFriendRequests = createAsyncThunk(
  "getOutgoinFriendRequests",
  async () => {
    try {
      const res = await api.get(
        `${BACKEND_URL}/friendship/outgoing-friend-requests`
      );
      if (res.status === 200) {
        // Keep this one - user actions should provide feedback
        // toast.success(res?.data?.message);
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

//send friend request
export const sendFriendRequest = createAsyncThunk(
  "sendFriendRequest",
  async (receiverId: string) => {
    try {
      const res = await api.post(
        `${BACKEND_URL}/friendship/send-friend-request`,
        {
          receiverId,
        }
      );
      if (res.status === 200) {
        // Keep this one - it's a user action
        toast.success(res?.data?.message);
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

// accept friend request
export const acceptFriendRequest = createAsyncThunk(
  "acceptFriendRequest",
  async (data: { id: string; onSuccess?: () => void }) => {
    const { id: friendRequestId, onSuccess } = data;
    try {
      const res = await api.post(
        `${BACKEND_URL}/friendship/accept-friend-request`,
        {
          friendRequestId,
        }
      );
      if (res.status === 200) {
        // Keep this one - it's a user action
        toast.success(res?.data?.message);
        if (onSuccess) onSuccess();
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

// cancel outgoing friend request (by sender)
export const cancelFriendRequest = createAsyncThunk(
  "cancelFriendRequest",
  async (data: { id: string; onSuccess?: () => void }) => {
    const { id: friendRequestId, onSuccess } = data;
    try {
      const res = await api.post(
        `${BACKEND_URL}/friendship/cancel-friend-request`,
        { friendRequestId }
      );
      if (res.status === 200) {
        toast.success(res?.data?.message ?? "Friend request cancelled");
        if (onSuccess) onSuccess();
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

// reject incoming friend request (by receiver)
export const rejectFriendRequest = createAsyncThunk(
  "rejectFriendRequest",
  async (data: { id: string; onSuccess?: () => void }) => {
    const { id: friendRequestId, onSuccess } = data;
    try {
      const res = await api.post(
        `${BACKEND_URL}/friendship/reject-friend-request`,
        { friendRequestId }
      );
      if (res.status === 200) {
        toast.success(res?.data?.message ?? "Friend request rejected");
        if (onSuccess) onSuccess();
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);

// unfriend (unfollow) an existing friend
export const unfriend = createAsyncThunk(
  "unfriend",
  async (data: { friendId: string; friendName?: string; onSuccess?: () => void }) => {
    const { friendId, friendName, onSuccess } = data;
    try {
      const res = await api.post(`${BACKEND_URL}/friendship/unfriend`, {
        friendId,
      });
      if (res.status === 200) {
        const fallback = "Unfollowed";
        const messageFromApi = res?.data?.message;
        const confirmation = friendName
          ? `You unfollowed ${friendName}.`
          : messageFromApi ?? fallback;
  toast.success(confirmation, { duration: 1200 });
        if (onSuccess) onSuccess();
        return res?.data;
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }
);
