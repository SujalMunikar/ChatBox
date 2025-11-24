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
// Get searchable list of people you are not yet connected with.
router.get("/get-all-users", isAuthenticated, getAllUsers);

// Retrieve established friendships for the logged-in user.
router.get("/get-my-friends", isAuthenticated, getMyFriends);

// Feed of requests sent to the user that still need a response.
router.get(
  "/incoming-friend-requests",
  isAuthenticated,
  getIncomingFriendRequests
);

// Requests the user has sent to others but that remain pending.
router.get(
  "/outgoing-friend-requests",
  isAuthenticated,
  getOutgoinFriendRequests
);

// Fire off a new friend invitation.
router.post("/send-friend-request", isAuthenticated, sendFriendRequest);

// Accept a pending invitation and create a friendship record.
router.post("/accept-friend-request", isAuthenticated, acceptFriendRequest);

// Withdraw an outstanding request that you sent.
router.post("/cancel-friend-request", isAuthenticated, cancelFriendRequest);
// Decline someone else's request.
router.post("/reject-friend-request", isAuthenticated, rejectFriendRequest);
// Fully remove the relationship and shared conversations.
router.post("/unfriend", isAuthenticated, unfriend);

export default router;
