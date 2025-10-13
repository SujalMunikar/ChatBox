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

const userSocketMap: Record<string, string> = {};

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  // console.log("USER connect", socket.id, userId);
  if (userId != undefined) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", userSocketMap);

  socket.on("disconnect", () => {
    console.log("USER disconnect", socket.id, userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", userSocketMap);
  });
});

export { app, server, io };
