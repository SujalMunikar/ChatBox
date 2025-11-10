import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { setAuthUser } from "../features/auth/authSlice";

// Consolidated hook that exposes authentication state and rehydrates Redux from localStorage on mount.

const useAuth = () => {
  const authSlice = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Align Redux with any persisted credentials so page refreshes stay logged in.
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      dispatch(setAuthUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  // TO fix .IT is redundant here. I did it so tthat when refreshing the states where taking time to update.meanwhile the protected route redirects to home page
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");
  if (storedToken && storedUser) {
    return {
      authState: {
        isAuth: true,
        user: JSON.parse(storedUser),
      },
    };
  }

  return {
    authState: {
      isAuth: !!authSlice?.user,
      user: authSlice?.user ?? null,
    },
  };
};

export default useAuth;
