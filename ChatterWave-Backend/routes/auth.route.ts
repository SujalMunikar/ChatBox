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

// router.get("/test", (req: Request, res: Response) => {
//   res.status(201).json({ status: true });
// });

router.post("/login", login);
router.post("/register", register);
router.post("/reset-password", isAuthenticated, resetPassword);
router.get("/verify-email", verifyEmail);
router.get("/logout", logout);
router.get("/getme", isAuthenticated, getme);
router.get("/removeAll", removeAll);

export default router;
