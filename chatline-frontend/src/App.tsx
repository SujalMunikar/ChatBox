// Root router: wires together authentication guards, top-level pages, and theme bootstrap.
import { Routes, Route, Navigate } from "react-router-dom";
import PrivatePage from "./pages/PrivatePage";

import ProtectedRoute from "./middleware/ProtectedRoute";
// import Navbar from "./components/Navbar";
import useAuth from "./hooks/useAuth";
import Register from "./pages/Register";
// import AuthLayout from "./Layouts/AuthLayout";
import PrivateRoute from "./middleware/PrivateRoute";
import Verify from "./pages/auth/Verify";
import VerifyOtp from "./pages/auth/VerifyOtp";
import { Toaster, ToastBar, toast, useToasterStore } from "react-hot-toast";
import ChatHome from "./pages/Chat/ChatHome";

import "./app.scss";
// import { BACKEND_URL } from "./config/urlConfig";
import IndividualChat from "./pages/Chat/IndividualChat";
import { useEffect, useLayoutEffect, type KeyboardEvent } from "react";
import { useAppDispatch } from "./store";
import { changeTheme } from "./features/UI/UISlice";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import FriendsPage from "./pages/FriendsPage";
// import { censorMessage } from "./helper/message.helper";
import Login from "./pages/Login";

// Keep toast timing and max visible count grouped for easy tuning.
const TOAST_DURATION = 3500;
const TOAST_LIMIT = 2;

const ToastViewport = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    // Drop older toasts when the limit is exceeded so the UI never gets crowded.
    const visibleToasts = toasts.filter((toastInstance) => toastInstance.visible);
    const nonCustomVisible = visibleToasts.filter((toastInstance) => toastInstance.type !== "custom");
    const overflowCount = nonCustomVisible.length - TOAST_LIMIT;
    if (overflowCount <= 0) {
      return;
    }
    nonCustomVisible
      .slice(0, overflowCount)
      .forEach((toastInstance) => toast.dismiss(toastInstance.id));
  }, [toasts]);

  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        duration: TOAST_DURATION,
        success: { duration: TOAST_DURATION },
        error: { duration: TOAST_DURATION },
        style: { cursor: "pointer" },
      }}
    >
      {(toastInstance) => {
        const isCustom = toastInstance.type === "custom";
        const dismiss = () => toast.dismiss(toastInstance.id);
        const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
          // Mirror the click handler so assistive tech can dismiss toasts too.
          if (event.key === "Enter" || event.key === " ") {
            dismiss();
          }
        };
        return (
          <div
            role={isCustom ? undefined : "button"}
            tabIndex={isCustom ? -1 : 0}
            onClick={isCustom ? undefined : dismiss}
            onKeyDown={isCustom ? undefined : handleKeyDown}
            style={{ outline: "none" }}
          >
            <ToastBar toast={toastInstance} />
          </div>
        );
      }}
    </Toaster>
  );
};

function App() {
  const { authState } = useAuth();
  const dispatch = useAppDispatch();
  // Sync the persisted color theme with the Redux UI slice before the first paint.
  useLayoutEffect(() => {
    const theme = localStorage.getItem("theme");
    // console.log(theme);
    if (theme === "dark") {
      dispatch(changeTheme(true));
    } else dispatch(changeTheme(false));
  }, []);

  return (
    <>
      <ToastViewport />
      {/* <Navbar /> */}
      {/* <div
        className={`h-[5px] w-auto ${
          authState.isAuth ? "bg-green-400" : "bg-red-500"
        }`}
      /> */}
      {/* {BACKEND_URL} */}
      {/* Authentication flow toggles between public routes and guarded routes based on auth status. */}
      <Routes>
        {!authState.isAuth && (
          <>
            {/* if logged in not need for this routes  */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        )}
        {/* {authState.isAuth && !authState.user.isVerified && ( */}
        <>
          {/* if logged in not need for this routes  */}

          <Route path="/verify" element={<Verify />} />
        </>
        {/* )} */}
        {/* protected routes  */}
        <Route element={<ProtectedRoute />}>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Register />} />
          {authState.isAuth && !authState.user.verified && (
            <>
              {/* Forces newly registered users to confirm their account before entering protected areas. */}
              <Route path="/verify-otp" element={<VerifyOtp />} />
            </>
          )}

          {/* PRIVATE ROUTE  */}
          <Route element={<PrivateRoute />}>
            {/* Redirect redundant routes away once the user is already authenticated. */}
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/setting" element={<>-Add bad word filter toggle</>} />
            <Route path="/chat" element={<ChatHome />} />
            <Route path="/chat/:id" element={<IndividualChat />} />
            <Route path="/private" element={<PrivatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            {/* fixing the unwanted routes for private user */}
            <Route path="/verify" element={<Navigate to="/" />} />
            <Route path="/verify-otp" element={<Navigate to="/" />} />
          </Route>
        </Route>
      </Routes>
      {/* {JSON.stringify(authState)} */}
    </>
  );
}

export default App;
