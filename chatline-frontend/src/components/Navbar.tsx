import React, { ReactElement } from "react";
import { Link, NavLink } from "react-router-dom";
import { BiMessage, BiUser, BiX } from "react-icons/bi";
import { GiThreeFriends } from "react-icons/gi";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../store";
import ProfileDropDown from "./ProfileDropDown";
import { changeTheme, toggleNavbar } from "../features/UI/UISlice";
import { cn } from "../helper/tailwindMergeClass.helper";
import { MdDarkMode, MdHome, MdLightMode } from "react-icons/md";
import BrandMark from "./BrandMark";

function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const uiSlice = useAppSelector((state) => state.ui);
  const incomingFriendRequests = useAppSelector(
    (state) => state.friends.incomingRequests
  );
  const incomingBadge = incomingFriendRequests?.length ?? 0; // Display count mirrors the same array the Friends page uses.
  const unreadCounts = useAppSelector((state) => state.conversation.unreadCounts);
  // Sum unread counts from every conversation so the chat tab mirrors overall unread status.
  const chatBadge = Object.values(unreadCounts ?? {}).reduce<number>(
    (total, count) => total + (typeof count === "number" ? count : 0),
    0
  );

  // Close the mobile navigation menu when a link is selected.
  const CloseNavBar = () => {
    dispatch(toggleNavbar(false));
  };

  return (
    <>
      <div className="bg-secondary-bg-color flex items-center justify-center">
        <div className="hover-section  flex items-center justify-between  my-width pt-2 h-20  ">
          {/* Logo always routes home; nav links live inside the responsive menu. */}
          <Link to="/" className="icon">
            <BrandMark />
          </Link>

          <nav
            className={cn(
              "  gap-5 flex fixed md:relative top-0 left-0 z-10 bg-secondary-bg-color md:bg-transparent h-screen w-screen md:h-auto md:w-auto flex-col md:flex-row items-start justify-start md:pt-0 translate-x-[100vw] md:translate-x-0 transition-transform",
              {
                // Slide-in menu for mobile, fixed horizontal bar on desktop.
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
            <NavLinkItem
              onClick={CloseNavBar}
              to="/chat"
              text="Chat"
              badgeCount={chatBadge}
            >
              <BiMessage />
            </NavLinkItem>
            <NavLinkItem
              onClick={CloseNavBar}
              to="/friends"
              text="Friends"
              badgeCount={incomingBadge}
            >
              <GiThreeFriends />
            </NavLinkItem>
            <NavLinkItem onClick={CloseNavBar} to="/profile" text="Profile">
              <BiUser />
            </NavLinkItem>
            <button
              type="button"
              className="bg-unit-bg-color shadow-lg text-primary-text-color p-2 rounded-full grid place-items-center"
              // Flip between light/dark themes based on the stored preference.
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
  badgeCount?: number;
}
const NavLinkItem = (props: NavlinkType) => {
  const { text, to, children, badgeCount, ...rest } = props;
  const showBadge = typeof badgeCount === "number" && badgeCount > 0; // Shared helper so every nav item could opt-in later.
  return (
    <NavLink
      to={to as string}
      // Highlight active routes while keeping other links subtle but interactive.
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
      <span className="text-[15px] flex items-center gap-2">
        {text}
        {showBadge && (
          // Badge collapses to "9+" on double digits so the nav width stays consistent.
          <span className="inline-flex min-w-5 justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">
            {badgeCount && badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </span>
    </NavLink>
  );
};
