import { Response } from "express";

export const returnInvalidCredentials = (res: Response) => {
  return res.status(401).json({
    success: false,
    message: "Invalid credentials!! Provide valid credentials.",
  });
};

export const returnVerificationFailed = (res: Response) => {
  return res.status(401).json({
    success: false,
    message: "OTP verification failed",
  });
};

export const returnAuthorizationError = (res: Response) => {
  return res.status(403).json({
    success: false,
    message: "Authorization Invalid",
  });
};
