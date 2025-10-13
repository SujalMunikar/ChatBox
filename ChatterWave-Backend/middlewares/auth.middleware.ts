import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/auth.helpers";
import { PrismaClient } from "@prisma/client";
import { User } from "../types/auth.type";
import {
  returnAuthorizationError,
  returnInvalidCredentials,
} from "../helpers/api.helper";

const prisma = new PrismaClient();
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log(req.cookies);
    // const token =
    //   req.cookies.jwt || req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies.jwt;
    // console.log("COOKIES:::", req.cookies, req.signedCookies);
    // const token = req.cookies.jwt;
    // console.log("TOKEN:::", token);
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
