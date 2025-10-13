import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { getme } from "../features/auth/authAction";
import useAuth from "../hooks/useAuth";

function ProtectedRoute() {
  const { authState } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    // if (token && !user) {
    //   dispatch(getme());
    // }
    if (token && !user) {
      dispatch(getme());
    }
    // dispatch(getme());
  }, [dispatch]);

  return authState?.isAuth ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
