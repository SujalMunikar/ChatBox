import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { getme } from "../features/auth/authAction";
import useAuth from "../hooks/useAuth";

// Basic auth guard that fetches user data when a token is present but Redux state is empty.
function ProtectedRoute() {
  const { authState } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (token && !user) {
      // Fetch the latest user profile when a token exists but Redux hasn't hydrated yet.
      dispatch(getme());
    }
  }, [dispatch]);

  return authState?.isAuth ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
