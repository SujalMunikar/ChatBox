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
import { Toaster } from "react-hot-toast";
import ChatHome from "./pages/Chat/ChatHome";

import "./app.scss";
// import { BACKEND_URL } from "./config/urlConfig";
import IndividualChat from "./pages/Chat/IndividualChat";
import { useLayoutEffect } from "react";
import { useAppDispatch } from "./store";
import { changeTheme } from "./features/UI/UISlice";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import FriendsPage from "./pages/FriendsPage";
// import { censorMessage } from "./helper/message.helper";
import Login from "./pages/Login";

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
      <Toaster position="bottom-right" reverseOrder={false} />
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
