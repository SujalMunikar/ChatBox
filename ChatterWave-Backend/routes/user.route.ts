import { Router, Request, Response } from "express";
import {
  deleteAllUser,
  getAllUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
const router = Router();

// User directory and profile maintenance routes.
router.get("/", isAuthenticated, getUsers);
router.get("/all", getAllUser);
router.delete("/", deleteAllUser);

router.put("/update", isAuthenticated, updateUser);

// router.get("/friends",)

export default router;
