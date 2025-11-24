/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint@typescript-eslint/no-unused-vars
// import {
//   createContext,
//   PropsWithChildren,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import useAuth from "../hooks/useAuth";
// import { SOCKET_URL } from "../config/urlConfig";
// import { io } from "socket.io-client";

// export const SocketContext = createContext(undefined);
// export const useSocketContext = () => {
//   return useContext(SocketContext);
// };

// export const SocketContextProvider = (props: PropsWithChildren) => {
//   const { children } = props;
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const { authState } = useAuth();

//   // useEffect(() => {
//   //   if (authState.isAuth) {
//   //     const socket = io(SOCKET_URL, {
//   //       query: {
//   //         userId: authState?.user?.id,
//   //       },
//   //     });
//   //     setSocket(socket);
//   //     socket.on("getOnlineUsers", (users: any) => {
//   //       setOnlineUsers(users);
//   //     });

//   //     return () => socket.close();
//   //   } else {
//   //     if (socket) {
//   //       socket.close();
//   //       setSocket(null);
//   //     }
//   //   }
//   // }, [authState?.user?.id]);

// // Add error handling and connection status
// useEffect(() => {
//   if (authState.isAuth && authState?.user?.id && SOCKET_URL) {
//     const newSocket = io(SOCKET_URL, {
//       query: {
//         userId: authState?.user?.id,
//       },
//     });
    
//     setSocket(newSocket as any);
    
//     newSocket.on("connect", () => {
//       console.log("Socket connected:", newSocket.id);
//     });
    
//     newSocket.on("getOnlineUsers", (users: any) => {
//       setOnlineUsers(users);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Socket disconnected");
//     });

//     return () => {
//       newSocket.close();
//       setSocket(null);
//     };
//   } else {
//     if (socket) {
//       (socket as any).close();
//       setSocket(null);
//     }
//   }
// }, [authState?.user?.id, authState.isAuth]);

// return (
//   <SocketContext.Provider value={{ socket: socket as any, onlineUsers }}>
//     {children}
//   </SocketContext.Provider>
// );
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useAuth from "../hooks/useAuth";
import { SOCKET_URL } from "../config/urlConfig";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store";
import {
  addIncomingRequest,
  addFriend,
  removeIncomingRequestBySenderId,
  removeOutgoingRequestByReceiverId,
  removeFriendById,
  resetFriendCollections,
} from "../features/friends/friendsSlice";
import {
  getIncomingFriendRequests,
  getOutgoinFriendRequests,
  getMyFriends,
} from "../features/friends/friendsAction";
import { clearConversation } from "../features/conversation/conversationSlice";
import { setCurrentConversationUser } from "../features/user/userSlice";
import { getUsers } from "../features/user/userAction";
import { showFriendRemovedToast, showFriendAcceptedToast } from "../helper/friendshipToast.helper";

// Keeps a singleton socket.io client and exposes it via context so that any component can subscribe to events.

export const SocketContext = createContext(undefined);
export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [socket, setSocket] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any>({});
  const { authState } = useAuth();
  const dispatch = useAppDispatch();
  const currConversationUserId = useAppSelector(
    (state) => state.user.currConversationUser?.id
  );
  const conversationUserIdRef = useRef<string | undefined>(
    currConversationUserId
  );
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    conversationUserIdRef.current = currConversationUserId;
  }, [currConversationUserId]);

  // Establish and tear down the socket connection whenever the authenticated user changes.
  useEffect(() => {
    const currentUserId = authState?.user?.id;

    if (previousUserIdRef.current !== currentUserId) {
      // When the authenticated identity swaps, flush friend/conversation state before reconnecting.
      dispatch(resetFriendCollections());
      dispatch(clearConversation());
      dispatch(setCurrentConversationUser(null));
      previousUserIdRef.current = currentUserId;
    }

    if (authState.isAuth && currentUserId && SOCKET_URL) {
      console.log("Connecting to socket with user ID:", currentUserId);

      const newSocket = io(SOCKET_URL, {
        query: {
          userId: currentUserId,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);
      dispatch(getIncomingFriendRequests());
      dispatch(getOutgoinFriendRequests());
      dispatch(getMyFriends());
      dispatch(getUsers());

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("getOnlineUsers", (users: any) => {
        console.log("Online users received:", users);
        setOnlineUsers(users);
      });

      newSocket.on("newMessage", (message: any) => {
        console.log("New message in context:", message);
      });

      newSocket.on("friend-request-received", (payload: any) => {
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
      });

      newSocket.on("friend-request-cancelled", (payload: any) => {
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
      });

      newSocket.on("friend-request-rejected", (payload: any) => {
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
      });

      newSocket.on("friendship-accepted", (payload: any) => {
        const friend = payload?.friend;
        const requestSenderId = payload?.requestSenderId;
        const requestReceiverId = payload?.requestReceiverId;
        const isReceiver = currentUserId === requestReceiverId;
        const isSender = currentUserId === requestSenderId;

        if (friend?.id && friend.id !== currentUserId) {
          dispatch(addFriend(friend));
          if (isSender) {
            const friendName = friend?.name ?? "A new friend";
            // Surface a toast for the requester so they notice the acceptance even if it happened while they were away.
            showFriendAcceptedToast(
              friendName,
              friend?.email ?? "(no email provided)"
            );
          }
        }

        if (isReceiver && requestSenderId) {
          dispatch(removeIncomingRequestBySenderId(requestSenderId));
        }
        if (isSender && requestReceiverId) {
          dispatch(removeOutgoingRequestByReceiverId(requestReceiverId));
        }
      });

      newSocket.on("friendship-removed", (payload: any) => {
        const friendId = payload?.friendId;
        const byName = payload?.byName ?? "Someone";
        const byEmail = payload?.byEmail ?? "(no email provided)";
        const isInitiator = payload?.byId === currentUserId;

        if (friendId && friendId !== currentUserId) {
          dispatch(removeFriendById(friendId));
          if (
            conversationUserIdRef.current &&
            conversationUserIdRef.current === friendId
          ) {
            dispatch(clearConversation());
            dispatch(setCurrentConversationUser(null));
          }
        }

        if (!isInitiator) {
          // Receiver learns about the removal both live and on their next login.
          showFriendRemovedToast(byName, byEmail);
        }
      });

      newSocket.on("disconnect", (reason: string) => {
        console.log("Socket disconnected:", reason);
      });

      newSocket.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.close();
        setSocket(null);
      };
    }

  }, [authState?.user?.id, authState.isAuth, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers } as any}>
      {children}
    </SocketContext.Provider>
  );
};