import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { setAuthUser } from "../features/auth/authSlice";


// Consolidated hook that exposes authentication state and rehydrates Redux from session storage on mount.

const useAuth = () => {
  const authSlice = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Rehydrate Redux with the session-backed user and migrate any legacy localStorage entries.
    if (typeof window === "undefined") {
      return;
    }
    const sessionUser = sessionStorage.getItem("user");
    const sessionToken = sessionStorage.getItem("token");
    const localUser = localStorage.getItem("user");
    const localToken = localStorage.getItem("token");

    let persistedUser = sessionUser;
    let persistedToken = sessionToken;

    // Migrate any legacy localStorage auth into sessionStorage so sessions end with the tab.
    if (!sessionUser && !sessionToken && localUser && localToken) {
      sessionStorage.setItem("user", localUser);
      sessionStorage.setItem("token", localToken);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      persistedUser = localUser;
      persistedToken = localToken;
    }

    if (persistedUser && persistedToken) {
      dispatch(setAuthUser(JSON.parse(persistedUser)));
    }
  }, [dispatch]);

  if (typeof window !== "undefined") {
    // Immediate read keeps route guards stable while Redux finishes its own hydration.
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (storedToken && storedUser) {
      return {
        authState: {
          isAuth: true,
          user: JSON.parse(storedUser),
        },
      };
    }
  }

  return {
    authState: {
      isAuth: !!authSlice?.user,
      user: authSlice?.user ?? null,
    },
  };
};

export default useAuth;
