// Displays authenticated user controls such as profile navigation, theme toggle, and logout.
import { useAppDispatch, useAppSelector } from "../store";
import { logout } from "../features/auth/authAction";
import useAuth from "../hooks/useAuth";
import {
  BiChevronDown,
  BiChevronUp,
  BiLogOut,
  BiMenu,
  BiUser,
} from "react-icons/bi";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import PopupWrapper from "./UX/PopUpWrapper";
import { cn } from "../helper/tailwindMergeClass.helper";
import { changeTheme, toggleNavbar } from "../features/UI/UISlice";

function ProfileDropDown() {
  const dispatch = useAppDispatch();
  const { authState } = useAuth();
  const uiSlice = useAppSelector((state) => state.ui);
  const [active, setActive] = useState(false);
  const navigate = useNavigate();
  const controllerRef = useRef(null);

  return (
    <div className="profile-drop relative  gap-2 flex items-center ">
      <button
        type="button"
        className={cn(
          "text-primary-text-color flex items-center gap-2  rounded-[5px] p-1",
          {
            "bg-link-hover": active,
          }
        )}
        // Toggle the dropdown visibility while tracking controller ref for outside clicks.
        onClick={() => {
          setActive((prev: boolean) => !prev);
        }}
        ref={controllerRef}
      >
        {active ? (
          <BiChevronUp className="text-[25px]" />
        ) : (
          <BiChevronDown className="text-[25px]" />
        )}{" "}
        <div className="md:flex hidden">{authState?.user?.name}</div>
        <Avatar name={authState?.user?.name} />
      </button>
      <button
        type="button"
        className="text-3xl text-primary-text-color  flex md:hidden "
        // Expose the navigation drawer on mobile when the hamburger is tapped.
        onClick={() => dispatch(toggleNavbar(true))}
      >
        <BiMenu />
      </button>
      <PopupWrapper
        isOpen={active}
        setIsOpen={setActive}
        controllerRef={controllerRef}
        className="w-[200px] bg-secondary-bg-color text-font-primary overflow-hidden absolute top-[70px] right-0 flex flex-col rounded-lg shadow-md z-50"
      >
        {authState?.isAuth && active && (
          <>
            <button
              type="button"
              className="flex items-center gap-2 py-3 px-4 hover:bg-link-hover flex-1"
              // Allow users to jump straight to the profile page from the dropdown.
              onClick={() => navigate("/profile")}
            >
              <BiUser /> Profile
            </button>
            <button
              type="button"
              className="flex items-center gap-2 py-3 px-4 hover:bg-link-hover flex-1"
              // Reuse the theme toggle so users can switch modes anywhere.
              onClick={() => dispatch(changeTheme(!uiSlice?.isDarkTheme))}
            >
              {uiSlice?.isDarkTheme ? <MdLightMode /> : <MdDarkMode />} Switch
              Theme
            </button>
            {/* <button
              type="button"
              className="flex items-center gap-2 py-3 px-4 hover:bg-link-hover flex-1"
              onClick={() => navigate("/setting")}
            >
              <MdSettings /> Setting
            </button> */}
            <button
              type="button"
              className="flex items-center gap-2 py-3 px-4 hover:bg-link-hover flex-1"
              // Sign the user out and clear their session state.
              onClick={() => dispatch(logout())}
            >
              <BiLogOut /> Logout
            </button>
          </>
        )}
      </PopupWrapper>
    </div>
  );
}

export default ProfileDropDown;
