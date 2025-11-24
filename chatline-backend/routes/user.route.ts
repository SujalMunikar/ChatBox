import { Router, Request, Response } from "express";
import {
  deleteAllUser,
  deleteMyAccount,
  getAllUser,
  getStats,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
const router = Router();

// User directory and profile maintenance routes.
// Paginated list used by the client search bar.
router.get("/", isAuthenticated, getUsers);
// Admin/dev endpoint to retrieve every user document at once.
router.get("/all", getAllUser);
// Danger: nukes the entire user table; keep disabled outside local testing.
router.delete("/", deleteAllUser);

// Allows a user to self-delete their account.
router.delete("/me", isAuthenticated, deleteMyAccount);
// Dashboard numbers for counts, online presence, etc.
router.get("/stats", isAuthenticated, getStats);
// Update profile fields (name, avatar, biography).
router.put("/update", isAuthenticated, updateUser);

// router.get("/friends",)

export default router;
