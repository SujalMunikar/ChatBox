import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
        // Include other fields you need, but omit the password
        password: false,
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
    console.log(req.header);
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
