/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint@typescript-eslint/no-unused-vars
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

export const SocketContext = createContext(undefined);
export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authState } = useAuth();

  // useEffect(() => {
  //   if (authState.isAuth) {
  //     const socket = io(SOCKET_URL, {
  //       query: {
  //         userId: authState?.user?.id,
  //       },
  //     });
  //     setSocket(socket);
  //     socket.on("getOnlineUsers", (users: any) => {
  //       setOnlineUsers(users);
  //     });

  //     return () => socket.close();
  //   } else {
  //     if (socket) {
  //       socket.close();
  //       setSocket(null);
  //     }
  //   }
  // }, [authState?.user?.id]);

// Add error handling and connection status
useEffect(() => {
  if (authState.isAuth && authState?.user?.id && SOCKET_URL) {
    const newSocket = io(SOCKET_URL, {
      query: {
        userId: authState?.user?.id,
      },
    });
    
    setSocket(newSocket as any);
    
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
    
    newSocket.on("getOnlineUsers", (users: any) => {
      setOnlineUsers(users);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      newSocket.close();
      setSocket(null);
    };
  } else {
    if (socket) {
      (socket as any).close();
      setSocket(null);
    }
  }
}, [authState?.user?.id, authState.isAuth]);

return (
  <SocketContext.Provider value={{ socket: socket as any, onlineUsers }}>
    {children}
  </SocketContext.Provider>
);
};
