import React, { ReactElement } from "react";
import { Link, NavLink } from "react-router-dom";
import { BiMenu, BiMessage, BiUser, BiX } from "react-icons/bi";
import { GiThreeFriends } from "react-icons/gi";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../store";
import { logout } from "../features/auth/authAction";
import ProfileDropDown from "./ProfileDropDown";
import { changeTheme, toggleNavbar } from "../features/UI/UISlice";
import { cn } from "../helper/tailwindMergeClass.helper";
import { MdDarkMode, MdHome, MdLightMode } from "react-icons/md";

function Navbar() {
  const { authState } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const uiSlice = useAppSelector((state) => state.ui);

  const CloseNavBar = () => {
    dispatch(toggleNavbar(false));
  };

  return (
    <>
      <div className="bg-secondary-bg-color flex items-center justify-center">
        <div className="hover-section  flex items-center justify-between  my-width pt-2 h-20  ">
          <Link
            to="/"
            className="icon text-primary-text-color font-bold text-[26px]"
          >
            ChatterWave
          </Link>

          <nav
            className={cn(
              "  gap-5 flex fixed md:relative top-0 left-0 z-10 bg-secondary-bg-color md:bg-transparent h-screen w-screen md:h-auto md:w-auto flex-col md:flex-row items-start justify-start md:pt-0 translate-x-[100vw] md:translate-x-0 transition-transform",
              {
                "translate-x-[0]": uiSlice.isNavbarOpen,
              }
            )}
          >
            <div className="flex md:hidden my-width justify-end items-center h-20">
              {" "}
              <button
                className="text-3xl text-primary-text-color flex md:hidden bg-link-hover p-1 rounded-md"
                onClick={() => {
                  dispatch(toggleNavbar(false));
                }}
              >
                <BiX />
              </button>
            </div>

            <NavLinkItem onClick={CloseNavBar} to="/" text="Home">
              <MdHome />
            </NavLinkItem>
            <NavLinkItem onClick={CloseNavBar} to="/chat" text="Chat">
              <BiMessage />
            </NavLinkItem>
            <NavLinkItem onClick={CloseNavBar} to="/friends" text="Friends">
              <GiThreeFriends />
            </NavLinkItem>
            <NavLinkItem onClick={CloseNavBar} to="/profile" text="Profile">
              <BiUser />
            </NavLinkItem>
            <button
              type="button"
              className="bg-unit-bg-color shadow-lg text-primary-text-color p-2 rounded-full grid place-items-center"
              onClick={() => dispatch(changeTheme(!uiSlice?.isDarkTheme))}
            >
              {uiSlice?.isDarkTheme ? <MdLightMode /> : <MdDarkMode />}
            </button>
          </nav>

          <ProfileDropDown />
        </div>
      </div>
    </>
  );
}

export default Navbar;

interface NavlinkType extends React.ComponentPropsWithoutRef<typeof NavLink> {
  text: string;
  children: ReactElement;
}
const NavLinkItem = (props: NavlinkType) => {
  const { text, to, children, ...rest } = props;
  return (
    <NavLink
      to={to as string}
      className={({ isActive }) =>
        [
          isActive
            ? " text-primary-accent-color md:bg-link-hover "
            : "text-link-color",
          " hover:text-primary-accent-color w-full flex px-8 md:px-3 md:py-2 md:items-center md:justify-center  gap-2  rounded-[4px] text-[20px] leading-[20px]  text-left",
        ].join(" ")
      }
      {...rest}
    >
      {children}
      <span className="text-[15px]">{text}</span>
    </NavLink>
  );
};
