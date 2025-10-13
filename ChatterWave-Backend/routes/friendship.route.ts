import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  acceptFriendRequest,
  getAllUsers,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoinFriendRequests,
  sendFriendRequest,
} from "../controllers/friendship.controller";
const router = Router();

// router.get("/test", (req: Request, res: Response) => {
//   res.status(201).json({ status: true });
// });

router.get("/get-all-users", isAuthenticated, getAllUsers);

router.get("/get-my-friends", isAuthenticated, getMyFriends);

router.get(
  "/incoming-friend-requests",
  isAuthenticated,
  getIncomingFriendRequests
);

router.get(
  "/outgoing-friend-requests",
  isAuthenticated,
  getOutgoinFriendRequests
);

router.post("/send-friend-request", isAuthenticated, sendFriendRequest);

router.post("/accept-friend-request", isAuthenticated, acceptFriendRequest);

export default router;
