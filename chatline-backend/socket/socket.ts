import { Server } from "socket.io";
import http from "http";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const server = http.createServer(app);

const prisma = new PrismaClient();

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Maps user IDs to their active socket IDs so targeted emits can find the right connection.
const userSocketMap: Record<string, Set<string>> = {};
// Queue of socket events to deliver once a user reconnects.
const pendingSocketEvents: Record<string, Array<{ event: string; payload: any }>> = {};

// When a user reconnects over websockets, replay anything they missed while offline.
const flushPendingEvents = (userId: string) => {
  const events = pendingSocketEvents[userId];
  if (!events || events.length === 0) {
    return;
  }
  const sockets = userSocketMap[userId];
  if (!sockets || sockets.size === 0) {
    return;
  }
  events.forEach(({ event, payload }) => {
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, payload);
    });
  });
  delete pendingSocketEvents[userId];
};

// Store an event for later delivery when the target user currently lacks a live socket.
export const enqueuePendingEvent = (
  userId: string,
  event: string,
  payload: any
) => {
  if (!pendingSocketEvents[userId]) {
    pendingSocketEvents[userId] = [];
  }
  pendingSocketEvents[userId].push({ event, payload });
};

// Allow REST endpoints (login/getme) to claim queued events so the client can surface them during bootstrap.
export const drainPendingEvents = (
  userId: string
): Array<{ event: string; payload: any }> => {
  const events = pendingSocketEvents[userId];
  if (!events || events.length === 0) {
    return [];
  }
  delete pendingSocketEvents[userId];
  return events;
};

// Broadcasts the latest online/offline map to every connected client.
const emitPresenceSnapshot = () => {
  const onlinePresence: Record<string, boolean> = {};
  Object.entries(userSocketMap).forEach(([id, sockets]) => {
    if (sockets.size > 0) {
      onlinePresence[id] = true;
    }
  });
  io.emit("getOnlineUsers", onlinePresence);
};

export const getReceiverSocketIds = (receiverId: string) => {
  const sockets = userSocketMap[receiverId];
  if (!sockets || sockets.size === 0) {
    return [];
  }
  return Array.from(sockets);
};

export const getReceiverSocketId = (receiverId: string) => {
  const [first] = getReceiverSocketIds(receiverId);
  return first;
};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId as string | undefined;
  if (userId) {
    // Sockets connect before JWT verification; rely on the frontend to pass the ID in the query string.
    // Record this socket under the authenticated user's presence set.
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
    const now = new Date();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: true,
          lastSeen: now,
        },
      });
      io.emit("userStatusChanged", {
        userId,
        isOnline: true,
        lastSeen: now.toISOString(),
      });
    } catch (error) {
      console.error("Failed to mark user online", { userId, error });
    }
    flushPendingEvents(userId);
  }

  emitPresenceSnapshot(); // Immediately inform everyone of the new presence change.

  socket.on("disconnect", async () => {
    console.log("USER disconnect", socket.id, userId);
    if (userId) {
      const sockets = userSocketMap[userId];
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          delete userSocketMap[userId];
          const now = new Date();
          try {
            await prisma.user.update({
              where: { id: userId },
              data: {
                isOnline: false,
                lastSeen: now,
              },
            });
            io.emit("userStatusChanged", {
              userId,
              isOnline: false,
              lastSeen: now.toISOString(),
            });
          } catch (error) {
            console.error("Failed to mark user offline", { userId, error });
          }
        }
      }
    }

    emitPresenceSnapshot(); // Recompute online status after a disconnect.
  });
});

export { app, server, io };
