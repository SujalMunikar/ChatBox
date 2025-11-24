import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { io, getReceiverSocketIds, enqueuePendingEvent } from "../socket/socket";

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  // List every verified user except the current one, flagging which ones are already friends.
  try {
    const validatedUser = req.body.validatedUser.id;
    let users = await prisma.user.findMany({
      where: {
        verified: true,
        NOT: {
          id: validatedUser,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        friends: true,
      },
    });
    if (users) {
      const usersFormatted = users.map((user: any) => {
        let isFriend = false;
        user.friends.forEach((item: any) => {
          // Prisma returns both directions of friendships; flip a flag if we already know each other.
          if (item.friendId === validatedUser) {
            isFriend = true;
            return;
          }
        });
        user.isFriend = isFriend;
        return user;
      });
      console.log(usersFormatted); // Debug log to inspect mapping; disable in production to avoid leaking user lists.

      return res.status(200).json({
        success: true,
        users: usersFormatted,
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "All global users",
      error,
    });
  }
};

// get all my friends only
export const getMyFriends = async (req: Request, res: Response) => {
  // Fetch confirmed friendships and format them as a flat user list for the client.
  try {
    const users = await prisma.friendship.findMany({
      where: {
        userId: req.body.validatedUser.id,
      },
      select: {
        friend: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
      },
    });
    if (users) {
      // Flatten the nested records so the frontend receives just an array of profile summaries.
      const friends = users.map((user) => user.friend);
      return res.status(200).json({
        success: true,
        friends,
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my friends",
      error,
    });
  }
};

export const getIncomingFriendRequests = async (
  req: Request,
  res: Response
) => {
  // Retrieve pending requests where the current user is the receiver.
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: req.body.validatedUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    console.log(requests); // Helpful for debugging, but silence this in production to avoid leaking user data.
    if (requests) {
      return res.status(200).json({
        success: true,
        requests,
        message: "Incoming friend requests",
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't retrieve friend requests incoming data",
      error,
    });
  }
};

export const getOutgoinFriendRequests = async (req: Request, res: Response) => {
  // Retrieve pending requests initiated by the current user.
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: req.body.validatedUser.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    if (requests) {
      return res.status(200).json({
        success: true,
        requests,
        message: "Outgoing friend requests",
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't retrieve friend requests outgoing data",
      error,
    });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  // Entry point used by the frontend thunk; every early return mirrors a toast message so the UI stays in sync with backend validation.
  // Guard against duplicate friendships or duplicate requests before creating a new friend request.
  try {
    const { id: senderId } = req.body.validatedUser ?? {};
    const receiverId = req.body.receiverId as string | undefined;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        status: false,
        message: "Sender and receiver must be provided.",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        status: false,
        message: "You cannot send a friend request to yourself.",
      });
    }

    const alreadyFriend = await prisma.friendship.findFirst({
      where: {
        userId: senderId,
        friendId: receiverId,
      },
    });
    if (alreadyFriend) {
      return res.status(200).json({
        success: false,
        status: false,
        message: "You are already friends.",
      });
    }

    // Block duplicate outbound requests so the receiver gets only one notification.
    const alreadySent = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
      },
    });
    if (alreadySent) {
      return res.status(200).json({
        success: false,
        status: false,
        message: "Friend request already sent.",
      });
    }

    const reversePending = await prisma.friendRequest.findFirst({
      where: {
        senderId: receiverId,
        receiverId: senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (reversePending) {
      return res.status(200).json({
        success: false,
        status: false,
        message: "This user has already sent you a friend request.",
      });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!friendRequest) {
      return res.status(500).json({
        success: false,
        status: false,
        message: "Couldn't send friend request.",
      });
    }

    // Let the receiver's active socket know there is a pending invitation.
    const receiverSocketIds = getReceiverSocketIds(receiverId); // Used to emit a real-time update so the receiver's UI can add the request instantly.
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("friend-request-received", {
        request: friendRequest,
      });
    });

    return res.status(200).json({
      success: true,
      status: true,
      message: "Friend request sent.",
      request: friendRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't Send friend request",
      error,
    });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  // Convert a pending request into a bidirectional friendship, notify both parties, and clean up redundant records.
  try {
    const validatedUser = req.body.validatedUser;
    const friendRequestId = req.body.friendRequestId as string | undefined;

    if (!friendRequestId) {
      return res.status(400).json({
        success: false,
        message: "friendRequestId is required.",
      });
    }

    // Check if the friend request exists
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
      },
    });

    if (!friendRequest || friendRequest.receiverId !== validatedUser.id) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or unauthorized.",
      });
    }

    const requesterId = friendRequest.senderId;
    const receiverId = friendRequest.receiverId;

    const reverseFriendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: receiverId,
        receiverId: requesterId,
      },
    });

    const operations = [
      prisma.friendship.create({
        data: {
          userId: validatedUser.id,
          friendId: requesterId,
        },
      }),
      prisma.friendship.create({
        data: {
          userId: requesterId,
          friendId: validatedUser.id,
        },
      }),
      prisma.friendRequest.delete({
        where: { id: friendRequest.id },
      }),
    ];

    if (reverseFriendRequest) {
      // If the other side also sent a request, clear it to avoid stale duplicates.
      operations.push(
        prisma.friendRequest.delete({
          where: { id: reverseFriendRequest.id },
        })
      );
    }

    await prisma.$transaction(operations);

    const senderProfile = friendRequest.sender;
    const receiverProfile = friendRequest.receiver;

    const payloadForReceiver = {
      friend: senderProfile,
      friendId: senderProfile?.id,
      friendName: senderProfile?.name,
      friendEmail: senderProfile?.email,
      requestSenderId: requesterId,
      requestReceiverId: receiverId,
    };

    const payloadForSender = {
      friend: receiverProfile,
      friendId: receiverProfile?.id,
      friendName: receiverProfile?.name,
      friendEmail: receiverProfile?.email,
      requestSenderId: requesterId,
      requestReceiverId: receiverId,
    };

    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("friendship-accepted", payloadForReceiver);
    });
    if (receiverSockets.length === 0) {
      // Receiver is offline; stash the event so they'll see the toast after logging back in.
      enqueuePendingEvent(receiverId, "friendship-accepted", payloadForReceiver);
    }

    const senderSockets = getReceiverSocketIds(requesterId);
    senderSockets.forEach((socketId) => {
      io.to(socketId).emit("friendship-accepted", payloadForSender);
    });
    if (senderSockets.length === 0) {
      // Same treatment for the requester—inform them once they return.
      enqueuePendingEvent(requesterId, "friendship-accepted", payloadForSender);
    }

    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
      friend: senderProfile,
      friendRequestId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't accept friend request",
      error,
    });
  }
};

export const unfriend = async (req: Request, res: Response) => {
  // Remove both sides of a friendship edge and purge any shared conversations so neither user sees past history.
  try {
    const validatedUser = req.body.validatedUser;
    const friendId = req.body.friendId as string | undefined;

    if (!friendId) {
      return res.status(400).json({ success: false, message: "friendId is required" });
    }

    const [friendProfile, currentProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: friendId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: validatedUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
        },
      }),
    ]);

    const sharedConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { id: validatedUser.id } } },
          { participants: { some: { id: friendId } } },
        ],
      },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: validatedUser.id, friendId },
            { userId: friendId, friendId: validatedUser.id },
          ],
        },
      }),
      prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: validatedUser.id, receiverId: friendId },
            { senderId: friendId, receiverId: validatedUser.id },
          ],
        },
      }),
      ...sharedConversations.map((conversation) =>
        // Removing old messages prevents either user from seeing prior history after the breakup.
        prisma.conversation.delete({ where: { id: conversation.id } })
      ),
    ]);

    const payloadForInitiator = {
      friendId,
      byId: validatedUser.id,
      byName: currentProfile?.name ?? "Someone",
      friendEmail: friendProfile?.email,
      friendName: friendProfile?.name ?? "that user",
    };

    const payloadForFriend = {
      friendId: validatedUser.id,
      byId: validatedUser.id,
      byName: currentProfile?.name ?? "Someone",
      byEmail: currentProfile?.email,
    };

    const initiatorSockets = getReceiverSocketIds(validatedUser.id);
    initiatorSockets.forEach((socketId) => {
      io.to(socketId).emit("friendship-removed", payloadForInitiator);
    });

    const friendSockets = getReceiverSocketIds(friendId);
    const friendPayload = {
      ...payloadForFriend,
      friendName: friendProfile?.name,
      friendEmail: friendProfile?.email,
    };
    friendSockets.forEach((socketId) => {
      io.to(socketId).emit("friendship-removed", friendPayload);
    });

    if (friendSockets.length === 0) {
      // The removed user is offline; queue the event so they'll still see the toast post-login.
      enqueuePendingEvent(friendId, "friendship-removed", friendPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Unfollowed successfully",
      friendId,
      removedConversations: sharedConversations.map((conversation) => conversation.id),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Couldn't unfriend", error });
  }
};

export const cancelFriendRequest = async (req: Request, res: Response) => {
  // Allow the sender to retract a request and notify the receiver in real time.
  try {
    const validatedUser = req.body.validatedUser;
    const friendRequestId = req.body.friendRequestId;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
    });

    if (!friendRequest || friendRequest.senderId !== validatedUser.id) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or unauthorized.",
      });
    }

    await prisma.friendRequest.delete({ where: { id: friendRequestId } });

    // Notify the receiver that the request was cancelled
    const receiverSocketIds = getReceiverSocketIds(friendRequest.receiverId);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("friend-request-cancelled", {
        byName: validatedUser.name,
        byId: validatedUser.id,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Friend request cancelled.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't cancel friend request",
      error,
    });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  // Allow the receiver to decline a request and alert the sender over the socket channel.
  try {
    const validatedUser = req.body.validatedUser;
    const friendRequestId = req.body.friendRequestId;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
    });

    if (!friendRequest || friendRequest.receiverId !== validatedUser.id) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or unauthorized.",
      });
    }

    await prisma.friendRequest.delete({ where: { id: friendRequestId } });

    // Notify the sender that the request was rejected
    const senderSocketIds = getReceiverSocketIds(friendRequest.senderId);
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("friend-request-rejected", {
        byName: validatedUser.name,
        byId: validatedUser.id,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Friend request rejected.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't reject friend request",
      error,
    });
  }
};
