import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Maps user IDs to active socket IDs so targeted emits can find the right connection.
const userSocketMap: Record<string, string> = {};

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  // console.log("USER connect", socket.id, userId);
  if (userId != undefined) {
    // Record the latest socket linked to the authenticated user.
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", userSocketMap);

  socket.on("disconnect", () => {
    console.log("USER disconnect", socket.id, userId);
    // Remove the socket so stale IDs are never reused for new events.
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", userSocketMap);
  });
});

export { app, server, io };
