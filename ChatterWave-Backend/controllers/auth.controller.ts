import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import {
  deleteCookieForToken,
  generateOTP,
  generateToken,
  sendOtpEmail,
  setCookieFromToken,
  verifyToken,
} from "../helpers/auth.helpers";
import { Register, VerifyUser } from "../types/auth.type";
import {
  returnInvalidCredentials,
  returnVerificationFailed,
} from "../helpers/api.helper";
import { generateKeys } from "../helpers/algorithms/rsa.helper";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  // Authenticate a user, mint a JWT, and persist it via cookies for subsequent requests.
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      const hasvalidPassword = await compare(password, user.password);
      if (hasvalidPassword) {
        const payload = { ...user, password: "" };
        const token = await generateToken(payload);

        const checkCookie = await setCookieFromToken(res, token);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: { ...payload, otp: "", password: "" },
          token,
        });
      } else returnInvalidCredentials(res);
    } else {
      returnInvalidCredentials(res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Login Failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  // Create a new user, generate RSA keys, and kick off the email verification flow.
  const { name, email, password }: Register = req.body;
  const otp = generateOTP();
  try {
    const userExists = await prisma.user.findFirst({
      where: { email, verified: true },
    });
    if (userExists)
      return res.status(500).json({
        success: false,
        message: "Verified User with this email already exists",
      });
    const keys = generateKeys(1, 9999);
    const hashedPassword = await hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        // verified: true,
        publicKey: JSON.stringify(keys?.publicKey),
        privateKey: JSON.stringify(keys?.privateKey),
      },
    });
    // const createdUser = await prisma.user.deleteMany();
    if (createdUser) {
      const emailSent = await sendOtpEmail({ ...createdUser }, otp);
      return res.status(201).json({
        success: true,
        emailSent: emailSent,
        message: `Verification mail has been sent to ${email}. Click the link or enter the OTP to verify your account`,
        data: { ...createdUser, otp: "", password: "", privateKey: "" },
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "User register failed", error: error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  // Validate the user's current password before hashing and storing the replacement.
  try {
    const { oldPassword, newPassword, validatedUser } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        id: validatedUser.id,
      },
    });
    if (user) {
      const hasvalidPassword = await compare(oldPassword, user.password);
      if (hasvalidPassword) {
        const hashedPassword = await hash(newPassword, 10);
        const updatedUser = await prisma.user.update({
          where: {
            id: validatedUser.id,
          },
          data: {
            password: hashedPassword,
          },
        });
        if (updatedUser) {
          return res
            .status(200)
            .json({ success: true, message: "Password Updated" });
        } else {
          return res
            .status(500)
            .json({ success: false, message: "Password Update Failed" });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid old password" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Password Update Failed" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  // const { id, email, otp } = req.body;
  const { id, email, otp } = req.query as VerifyUser;
  // res.status(200).json({ status: true, message: { ...req.query } });
  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
        email,
      },
    });

    if (user) {
      if (user.verified) {
        return res
          .status(200)
          .json({ success: false, message: "User already verified" });
      }
      //now if not verified
      // todo just for dev
      if (user.otp === otp || otp === "123456") {
        const verifiedUser = await prisma.user.update({
          where: {
            id,
            email,
          },
          data: { verified: true, otp: "" },
        });
        if (verifiedUser) {
          const deleteOtherUserWithSameEmailButUnverifid =
            await prisma.user.deleteMany({ where: { email, verified: false } });
          console.log(
            "deleteOtherUserWithSameEmailButUnverifid",
            deleteOtherUserWithSameEmailButUnverifid
          );
          const payload = { ...verifiedUser, password: "", otp: "" };
          const token = await generateToken(payload);
          await setCookieFromToken(res, token);
          return res.status(200).json({
            success: true,
            message: "Verified Successfully",
            data: { ...payload },
            token,
          });
        } else returnVerificationFailed(res);
      } else returnVerificationFailed(res);
    } else {
      returnVerificationFailed(res);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "verification Failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // Clear the auth cookie so the browser no longer sends the previous session token.
  try {
    await deleteCookieForToken(res);
    return res.status(200).json({ success: true, message: "LOGGED OUT" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error LOGGED OUT" });
  }
};

export const getme = async (req: Request, res: Response) => {
  // Reissue a token containing the sanitized user payload for client refresh workflows.
  const { validatedUser } = req.body;

  try {
    const token = await generateToken(validatedUser);
    return res.status(200).json({
      success: true,
      message: "Fetched Me success",
      data: { ...validatedUser, password: "" },
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Fetch Failed" });
  }
};

export const removeAll = async (req: Request, res: Response) => {
  // Development-only helper to purge all relational data for a clean slate.
  try {
    await prisma.conversation.deleteMany();
    await prisma.message.deleteMany();
    await prisma.friendRequest.deleteMany();

    await prisma.user.deleteMany();
    await prisma.friendship.deleteMany();

    // await prisma.user.createMany({
    //   data: [
    //     {
    //       name: "Test1",
    //       email: "test1@gmail.com",
    //       verified: true,
    //       password: "12345678",
    //       otp: "123456",
    //     },
    //     {
    //       name: "Test2",
    //       email: "test2@gmail.com",
    //       verified: true,
    //       password: "12345678",
    //       otp: "123456",
    //     },
    //     {
    //       name: "Test3",
    //       email: "test3@gmail.com",
    //       verified: true,
    //       password: "12345678",
    //       otp: "123456",
    //     },
    //     {
    //       name: "Test4",
    //       email: "test4@gmail.com",
    //       verified: true,
    //       password: "12345678",
    //       otp: "123456",
    //     },
    //   ],
    // });
    return res
      .status(200)
      .json({ success: true, message: "All users removed" });
  } catch (error) {
    return res
      .status(500)

      .json({ success: false, message: "Failed to remove all users" });
  }
};
