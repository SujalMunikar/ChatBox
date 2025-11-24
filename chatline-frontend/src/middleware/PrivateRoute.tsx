import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { connectSocket, disconnectSocket } from "../features/socket/socketConfig";
import { clearOnlineUsers, setOnlineUsers } from "../features/socket/socketSlice";
import {
  addIncomingRequest,
  removeIncomingRequestBySenderId,
  removeOutgoingRequestByReceiverId,
  syncFriendPresenceMap,
  updateFriendPresence,
} from "../features/friends/friendsSlice";
import { syncUserPresenceMap, updateUserPresence } from "../features/user/userSlice";
import toast from "react-hot-toast";
import {
  getIncomingFriendRequests,
  getOutgoinFriendRequests,
} from "../features/friends/friendsAction";
import {
  incrementUnreadCount,
  resetAllUnreadCounts,
} from "../features/conversation/conversationSlice";

// Gate for authenticated/verified users that wires up socket listeners while the protected area is mounted.

function PrivateRoute() {
  const { authState } = useAuth();
  const dispatch = useAppDispatch();
  const isAuthenticated = Boolean(authState?.isAuth);
  const currentUserId = authState?.user?.id ?? null;
  const activeConversationPeerId = useAppSelector(
    (state) => state.user.currConversationUser?.id ?? null
  );
  const activeConversationRef = useRef<string | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversationPeerId;
  }, [activeConversationPeerId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      dispatch(clearOnlineUsers());
      dispatch(resetAllUnreadCounts());
      disconnectSocket();
      return () => undefined;
    }

    const socket = connectSocket(currentUserId);
    if (!socket) {
      console.warn("Socket client not available");
      return () => disconnectSocket();
    }

    // Wire socket presence events into Redux so UI components stay in sync with backend state.
    const handlePresenceSnapshot = (data: Record<string, boolean>) => {
      dispatch(setOnlineUsers(data));
      dispatch(syncUserPresenceMap(data));
      dispatch(syncFriendPresenceMap(data));
    };

    const handleUserPresenceChanged = (payload: {
      userId: string;
      isOnline: boolean;
      lastSeen?: string;
    }) => {
      dispatch(updateUserPresence(payload));
      dispatch(updateFriendPresence(payload));
    };

    const handleFriendRequestReceived = (payload: any) => {
      const request = payload?.request;
      const name = request?.sender?.name ?? "Someone";
      toast.success(`${name} sent you a friend request.`, {
        duration: 3500,
        icon: "🤝",
      });
      if (request?.id) {
        dispatch(addIncomingRequest(request));
      } else {
        dispatch(getIncomingFriendRequests());
      }
    };

    const handleFriendRequestCancelled = (payload: any) => {
      const name = payload?.byName ?? "Someone";
      toast(`${name} cancelled the friend request.`, {
        duration: 3500,
        icon: "⚠️",
      });
      if (payload?.byId) {
        dispatch(removeIncomingRequestBySenderId(payload.byId));
      } else {
        dispatch(getIncomingFriendRequests());
      }
    };

    const handleFriendRequestRejected = (payload: any) => {
      const name = payload?.byName ?? "Someone";
      toast(`${name} declined your friend request.`, {
        duration: 3500,
        icon: "❌",
      });
      if (payload?.byId) {
        dispatch(removeOutgoingRequestByReceiverId(payload.byId));
      } else {
        dispatch(getOutgoinFriendRequests());
      }
    };

    const handleNewMessage = (message: any) => {
      if (!message || !currentUserId) {
        return;
      }
      const { senderId, receiverId } = message;
      if (!senderId || !receiverId) {
        return;
      }
      const peerId = senderId === currentUserId ? receiverId : senderId;
      const isIncoming = receiverId === currentUserId;

      if (isIncoming && peerId && activeConversationRef.current !== peerId) {
        dispatch(incrementUnreadCount(peerId));
      }
    };

    socket.on("getOnlineUsers", handlePresenceSnapshot);
    socket.on("userStatusChanged", handleUserPresenceChanged);
    socket.on("friend-request-received", handleFriendRequestReceived);
    socket.on("friend-request-cancelled", handleFriendRequestCancelled);
    socket.on("friend-request-rejected", handleFriendRequestRejected);
    socket.on("newMessage", handleNewMessage);

    dispatch(getIncomingFriendRequests());
    dispatch(getOutgoinFriendRequests());

    return () => {
      socket.off("getOnlineUsers", handlePresenceSnapshot);
      socket.off("userStatusChanged", handleUserPresenceChanged);
      socket.off("friend-request-received", handleFriendRequestReceived);
      socket.off("friend-request-cancelled", handleFriendRequestCancelled);
      socket.off("friend-request-rejected", handleFriendRequestRejected);
      socket.off("newMessage", handleNewMessage);
      dispatch(clearOnlineUsers());
      dispatch(resetAllUnreadCounts());
      disconnectSocket();
    };
  }, [isAuthenticated, currentUserId, dispatch]);

  return authState?.isAuth && authState?.user?.verified ? (
    <Outlet />
  ) : (
    <Navigate to="/verify-otp" />
  );
}

export default PrivateRoute;
