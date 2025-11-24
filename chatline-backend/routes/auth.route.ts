import { Router, Request, Response } from "express";
import {
  getme,
  login,
  logout,
  register,
  removeAll,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
const router = Router();

// Authentication and session lifecycle endpoints.

// router.get("/test", (req: Request, res: Response) => {
//   res.status(201).json({ status: true });
// });

// Credentials -> session cookie exchange.
router.post("/login", login);
// Creates account and kicks off email verification pipeline.
router.post("/register", register);
// Requires active session, then lets the user change their password.
router.post("/reset-password", isAuthenticated, resetPassword);
// Email link callback that confirms OTP tokens.
router.get("/verify-email", verifyEmail);
// Clears auth cookies and session flags for the current user.
router.get("/logout", isAuthenticated, logout);
// Fetch self profile details, used by the frontend on refresh.
router.get("/getme", isAuthenticated, getme);
router.get("/removeAll", removeAll); // Dev utility to purge user records; keep behind admin guards in production.

export default router;
