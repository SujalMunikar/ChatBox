import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../config/urlConfig";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Connected to socket:", socket?.id);
    });
    
    socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket:", reason);
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn("Socket not connected");
    return null;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};


// socketClient.ts
// import { io, Socket } from "socket.io-client";
// import { SOCKET_URL } from "../../config/urlConfig";

// let socket: Socket | null = null;

// export const connectSocket = (userId: string) => {
//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       query: { userId },
//     });

//     socket.on("connect", () => {
//       console.log("Connected to socket");
//     });
//     socket.on("disconnect", () => {
//       socket?.off("getOnlineUsers");
//       socket?.off("newMessage");
//       console.log("DIsconnected from socket");
//     });
//   }
//   return socket;
// };

// export const getSocket = () => socket;
// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };
