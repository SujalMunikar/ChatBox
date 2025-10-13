import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../features/socket/socketConfig";
import { setOnlineUsers } from "../features/socket/socketSlice";

function PrivateRoute() {
  const { authState } = useAuth();
  const dispatch = useAppDispatch();
  const socketSlice = useAppSelector((state) => state.socket);
  useEffect(() => {
    connectSocket(authState?.user?.id);
    if (authState?.isAuth) {
      const socket = getSocket();
      socket?.on("getOnlineUsers", (data) => {
        dispatch(setOnlineUsers(data));
      });
    }
    return () => disconnectSocket();
  }, [authState?.user?.id]);

  return authState?.isAuth && authState?.user?.verified ? (
    <Outlet />
  ) : (
    <Navigate to="/verify-otp" />
  );
}

export default PrivateRoute;
