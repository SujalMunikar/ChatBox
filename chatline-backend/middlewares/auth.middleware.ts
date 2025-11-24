import { Request, Response, NextFunction } from "express";
import { verifyToken, deleteCookieForToken } from "../helpers/auth.helpers";
import { PrismaClient } from "@prisma/client";
import { User } from "../types/auth.type";
import { returnAuthorizationError } from "../helpers/api.helper";
// import {
//   returnAuthorizationError,
//   returnInvalidCredentials,
// } from "../helpers/api.helper";

const prisma = new PrismaClient();
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Accepts either cookie or Authorization header token, validates it, and hydrates req.body.validatedUser.
  try {
    // console.log(req.cookies);
    // const token =
    //   req.cookies.jwt || req.header("Authorization")?.replace("Bearer ", "");
//  .........   const token = req.cookies.jwt;
    // console.log("COOKIES:::", req.cookies, req.signedCookies);
    // const token = req.cookies.jwt;
    // console.log("TOKEN:::", token);
    const cookieToken = (req as any).cookies?.jwt as string | undefined;
    // Support mobile clients that send the token via Authorization header instead of cookies.
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      await deleteCookieForToken(res);
      return returnAuthorizationError(res);
    }

    const decodedData = (await verifyToken(token)) as User;
    if (decodedData) {
      const user = await prisma.user.findFirst({
        where: {
          email: decodedData?.email,
          id: decodedData?.id,
        },
      });

      if (user) {
        // Strip secrets before sharing user details downstream.
        req.body.validatedUser = { ...user, otp: "", password: "" };
        return next();
      }
    }

    await deleteCookieForToken(res);
    return returnAuthorizationError(res);
  } catch (error) {
    await deleteCookieForToken(res);
    // If verification blows up (expired token, tampering, etc.) fall back to the same unauthorized response.
    return returnAuthorizationError(res);
  }
};
