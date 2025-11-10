import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { io, getReceiverSocketId } from "../socket/socket";

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
        createdAt: true,
        friends: true,
      },
    });
    if (users) {
      const usersFormatted = users.map((user: any) => {
        let isFriend = false;
        user.friends.forEach((item: any) => {
          if (item.friendId === validatedUser) {
            isFriend = true;
            return;
          }
        });
        user.isFriend = isFriend;
        return user;
      });
      console.log(usersFormatted);

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
            createdAt: true,
          },
        },
      },
    });
    if (users) {
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
    console.log(requests);
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
  // Guard against duplicate friendships or duplicate requests before creating a new friend request.
  try {
    const alreadyFriend = await prisma.friendship.findFirst({
      where: {
        userId: req.body.validatedUser.id,
        friendId: req.body.receiverId,
      },
    });
    if (alreadyFriend) {
      return res.status(200).json({
        status: true,
        message: "Already A friend",
      });
    }
    const alreadySent = await prisma.friendRequest.findFirst({
      where: {
        senderId: req.body.validatedUser.id,
        receiverId: req.body.receiverId,
      },
    });
    if (!!!alreadySent) {
      const sendRequest = await prisma.friendRequest.create({
        data: {
          senderId: req.body.validatedUser.id,
          receiverId: req.body.receiverId,
        },
      });
      if (!sendRequest) {
        return res.status(404).json({
          success: false,
          message: "Couldn't Send friend request",
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Friend Request Sent" });
    }
    return res.status(200).json({
      status: true,
      message: "Friend Request Already Sent",
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
  // Convert a pending request into a bidirectional friendship and clean up redundant records.
  try {
    const validatedUser = req.body.validatedUser;
    const friendRequestId = req.body.friendRequestId;

    // Check if the friend request exists
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!friendRequest || friendRequest.receiverId !== validatedUser.id) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or unauthorized.",
      });
    }
    const you = friendRequest.receiverId;
    const friend = friendRequest.senderId;

    const reverseFriendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: you,
        receiverId: friend,
      },
    });

    const operations = [
      prisma.friendship.create({
        data: {
          userId: validatedUser.id,
          friendId: friendRequest.senderId,
        },
      }),
      prisma.friendship.create({
        data: {
          userId: friendRequest.senderId,
          friendId: validatedUser.id,
        },
      }),
      // Delete the friend request
      prisma.friendRequest.delete({
        where: { id: friendRequest.id },
      }),
    ];
    //delete the outgoing friend request
    if (reverseFriendRequest) {
      operations.push(
        prisma.friendRequest.delete({
          where: { id: reverseFriendRequest.id },
        })
      );
    }

    // Create a new friendship for both directions
    await prisma.$transaction(operations);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
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
  // Remove both sides of a friendship edge so neither user appears in the other's list.
  try {
    const validatedUser = req.body.validatedUser;
    const friendId = req.body.friendId as string;

    if (!friendId) {
      return res.status(400).json({ success: false, message: "friendId is required" });
    }

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: validatedUser.id, friendId },
          { userId: friendId, friendId: validatedUser.id },
        ],
      },
    });

    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
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
    const receiverSocketId = getReceiverSocketId(friendRequest.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend-request-cancelled", {
        byName: validatedUser.name,
        byId: validatedUser.id,
      });
    }

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
    const senderSocketId = getReceiverSocketId(friendRequest.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friend-request-rejected", {
        byName: validatedUser.name,
        byId: validatedUser.id,
      });
    }

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
