import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { getMessages, sendMessage } from "../controllers/message.controller";
const router = Router();

// Messaging endpoints guarded by auth middleware.
router.post("/send/:id", isAuthenticated, sendMessage); // :id is the target user to receive the message.
router.get("/:id", isAuthenticated, getMessages); // Fetch conversation history with :id.

export default router;
