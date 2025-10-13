// socketClient.ts
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../config/urlConfig";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
    });
    socket.on("disconnect", () => {
      socket?.off("getOnlineUsers");
      socket?.off("newMessage");
      console.log("DIsconnected from socket");
    });
  }
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
