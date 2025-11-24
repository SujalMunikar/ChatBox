import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type OnlineUsersMap = Record<string, boolean>;

interface SocketState {
  onlineUsers: OnlineUsersMap;
}

// Stores the online/offline map the socket server emits.
const initialState: SocketState = {
  onlineUsers: {},
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<OnlineUsersMap>) => {
      // Replace the cached presence map whenever the server pushes a new snapshot.
      state.onlineUsers = action.payload ?? {};
    },
    clearOnlineUsers: (state) => {
      // Reset when the socket disconnects or the user logs out.
      state.onlineUsers = {};
    },
  },
});

// Action creators are generated for each case reducer function
export const { setOnlineUsers, clearOnlineUsers } = socketSlice.actions;

export default socketSlice.reducer;
