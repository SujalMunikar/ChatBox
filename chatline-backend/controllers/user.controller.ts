import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { deleteCookieForToken } from "../helpers/auth.helpers";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  // Return everyone except the authenticated user for friend discovery.
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: req.body.validatedUser.id,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
        image: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({
      success: true,
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Couldn't retrieve data", error });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  // Admin-style endpoint that includes relationship edges for all users.
  try {
    console.log(req.header); // Debug log; remove or guard when shipping to production.
    const users = await prisma.user.findMany({
      include: {
        incomingFriendRequest: true,
        outgoingFriendRequest: true,
        friendOf: true,
        friends: true,
      },
    });
    return res.status(200).json({
      success: true,
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Couldn't retrieve data", error });
  }
};

export const deleteAllUser = async (req: Request, res: Response) => {
  // Utility to wipe the users table; intended for development resets.
  try {
    const users = await prisma.user.deleteMany();
    return res.status(200).json({
      success: true,
      data: {
        ...users,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Couldn't delete data", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  // Allow the authenticated user to update their profile data (currently name only).
  try {
    // Only expose safe columns here; anything in `data` becomes writeable.
    const updateUser = await prisma.user.update({
      where: { id: req.body.validatedUser.id },
      data: { name: req.body.name },
    });
    if (updateUser) {
      return res.status(200).json({
        success: true,
        data: {
          ...updateUser,
        },
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Couldn't update data", error });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  // Permanently remove the authenticated user and clean up related relational data.
  try {
    const userId = req.body.validatedUser?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user reference" });
    }

    await prisma.$transaction([
      // Clear pending friend requests and bilateral friendships so no dangling references remain.
      prisma.friendRequest.deleteMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      }),
      prisma.friendship.deleteMany({
        where: {
          OR: [{ userId }, { friendId: userId }],
        },
      }),
      prisma.conversation.deleteMany({
        where: {
          participants: {
            some: { id: userId },
          },
        },
      }),
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);

    // Also drop the auth cookie so the browser forgets the previous session immediately.
    await deleteCookieForToken(res);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't delete account",
      error,
    });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  // Provide aggregate counts for dashboard summaries (users, conversations, messages).
  try {
    const [userCount, conversationCount, messageCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.message.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: userCount,
        conversations: conversationCount,
        messages: messageCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error,
    });
  }
};
