import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../config/urlConfig";

// export interface SocketState {
//   socket: unknown | null | Socket;
//   isConnected: boolean;
//   onlineUsers: Array<onlineUserType>;
// }

const initialState = {
  socket: null,
  isConnected: false,
  onlineUsers: [],
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers(builder) {},
});

// Action creators are generated for each case reducer function
export const { setOnlineUsers } = socketSlice.actions;

export default socketSlice.reducer;
