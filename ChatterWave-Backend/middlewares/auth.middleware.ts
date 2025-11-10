import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/auth.helpers";
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
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = cookieToken || bearerToken;


    if (token) {
      const decodedData = (await verifyToken(token)) as User;
      // console.log("Decoded DATA FROM MIDDLEWARE:::", decodedData);
      if (decodedData) {
        const user = await prisma.user.findFirst({
          where: {
            email: decodedData?.email,
            id: decodedData?.id,
          },
        });

        if (user) {
          // console.log("Valid user detected");
          // console.log("USER________________________", user);
          // Strip sensitive fields before stashing the user object on the request body.
          req.body.validatedUser = { ...user, otp: "", password: "" };
          next();
        } else {
          return returnAuthorizationError(res);
        }
      }
    } else throw "No Token available";
  } catch (error) {
    return returnAuthorizationError(res);
  }
};
