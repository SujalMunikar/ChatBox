import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  acceptFriendRequest,
  getAllUsers,
  getIncomingFriendRequests,
  getMyFriends,
  getOutgoinFriendRequests,
  sendFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  unfriend,
} from "../controllers/friendship.controller";
const router = Router();

// router.get("/test", (req: Request, res: Response) => {
//   res.status(201).json({ status: true });
// });

// Complete friendship lifecycle: discovery, requests, acceptance, and removal.
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

router.post("/cancel-friend-request", isAuthenticated, cancelFriendRequest);
router.post("/reject-friend-request", isAuthenticated, rejectFriendRequest);
router.post("/unfriend", isAuthenticated, unfriend);

export default router;
