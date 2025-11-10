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
  useState,
} from "react";
import useAuth from "../hooks/useAuth";
import { SOCKET_URL } from "../config/urlConfig";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

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

  // Establish and tear down the socket connection whenever the authenticated user changes.
  useEffect(() => {
    if (authState.isAuth && authState?.user?.id && SOCKET_URL) {
      console.log("Connecting to socket with user ID:", authState.user.id);
      
      const newSocket = io(SOCKET_URL, {
        query: {
          userId: authState.user.id,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      setSocket(newSocket);
      
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

      // Friend request notifications
      newSocket.on("friend-request-cancelled", (payload: any) => {
        const name = payload?.byName ?? "Someone";
        toast(`${name} cancelled the friend request.`, {
          duration: 5000,
          icon: "⚠️",
        });
      });

      newSocket.on("friend-request-rejected", (payload: any) => {
        const name = payload?.byName ?? "Someone";
        toast(`${name} declined your friend request.`, {
          duration: 5000,
          icon: "❌",
        });
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
    } else {
      if (socket) {
        console.log("Disconnecting socket - user not authenticated");
        socket.close();
        setSocket(null);
      }
    }
  }, [authState?.user?.id, authState.isAuth]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers } as any}>
      {children}
    </SocketContext.Provider>
  );
};