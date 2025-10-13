import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { getMessages, sendMessage } from "../controllers/message.controller";
const router = Router();

router.post("/send/:id", isAuthenticated, sendMessage);
router.get("/:id", isAuthenticated, getMessages);

export default router;
