import React, { useEffect, useMemo } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import ChatRow, { ChatRowLoading } from "../components/Chat/ChatRow";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getUsers } from "../features/user/userAction";
import { useNavigate } from "react-router-dom";
import { toggleSidebar } from "../features/UI/UISlice";
import { ButtonWithIcon } from "../components/UI/Button/Button";
import { getMyFriends } from "../features/friends/friendsAction";
import { cn } from "../helper/tailwindMergeClass.helper";
import { filterAllMyFriends } from "../features/friends/friendsSlice";
import useAuth from "../hooks/useAuth";

interface ChatHomeLayoutPropsType {
  children: React.ReactNode;
  embedded?: boolean;
}

function ChatHomeLayout(props: ChatHomeLayoutPropsType) {
  const { children, embedded = false } = props;
  const [searchText, setSearchText] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();
  const userSlice = useSelector((state: RootState) => state.user);
  const uiSlice = useSelector((state: RootState) => state.ui);
  const friendSlice = useSelector((state: RootState) => state.friends);
  const { authState } = useAuth();
  // const socketSlice = useSelector((state: RootState) => state.socket);
  const navigate = useNavigate();

  useEffect(() => {
    // Hydrate the chat sidebar: pull all users once and make sure the "My Friends" cache is ready.
    if (!userSlice?.users) {
      dispatch(getUsers());
    }

    if (!friendSlice?.hasLoadedMyFriends && !friendSlice?.loading) {
      dispatch(getMyFriends());
    }
  }, [dispatch, userSlice?.users, friendSlice?.hasLoadedMyFriends, friendSlice?.loading]);

  useEffect(() => {
    // Keep the filtered friend list in sync with the search box; empty string resets to full list.
    if (searchText.trim().length) {
      dispatch(filterAllMyFriends(searchText));
    } else {
      dispatch(filterAllMyFriends(""));
    }
  }, [searchText, dispatch]);

  const currentUserId = authState?.user?.id;
  const filteredFriends = useMemo(
    () =>
      Array.isArray(friendSlice?.myFriends)
        ? friendSlice.myFriends.filter(
            (friend: any) => friend?.id && friend.id !== currentUserId
          )
        : [],
    [friendSlice?.myFriends, currentUserId]
  );

  const hasFriends = filteredFriends.length > 0;
  const showSkeleton = friendSlice?.loading && !hasFriends;

  return (
    <div className={cn("flex", embedded ? "h-[calc(100vh-80px)]" : "h-screen")}>
      <div
        className={cn(
          "left h-full flex flex-col bg-white border-[#DBDDE1] dark:border-[#272A30] border-r dark:bg-[#17191c]",
          {
            // When collapsed, show just the icon rail; on mobile, the expanded sidebar takes the whole width.
            "w-[68px]": !uiSlice.isSidebarOpen,
            "w-full fixed sm:relative sm:w-80": uiSlice.isSidebarOpen,
          }
        )}
      >
        <div className="h-[60px] flex items-center px-3 gap-3">
          <div className="shrink-0">
            <ButtonWithIcon
              onClick={() => dispatch(toggleSidebar(!uiSlice.isSidebarOpen))}
            >
              <GiHamburgerMenu />
            </ButtonWithIcon>
            {/* {uiSlice.isSidebarOpen && (
              <ButtonWithIcon
                onClick={() => {
                  return navigate("/");
                }}
              >
                <BiHome />
              </ButtonWithIcon>
            )} */}
          </div>
          {uiSlice.isSidebarOpen && (
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none px-4 py-[10px] rounded-3xl flex-1 min-w-0 dark:text-neutral-50"
            />
          )}
        </div>
        <div className="scss-chat-row-container flex-1 overflow-y-auto thin-scrollbar scrollbar-stable">
          {filteredFriends.map((e: any) => (
            <ChatRow
              key={e?.id}
              active={e?.id === userSlice?.currConversationUser?.id}
              data={e}
              onClick={() => {
                navigate(`/chat/${e?.id}`);
                if (window.innerWidth < 768) {
                  dispatch(toggleSidebar(false));
                }
              }}
            />
          ))}
          {!friendSlice?.loading && filteredFriends.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500 dark:text-neutral-400">
              No friends yet.
            </div>
          )}
          {showSkeleton &&
            [...Array(4)].map((_, index) => <ChatRowLoading key={`skeleton-${index}`} />)}
          <div className="h-[5px] w-full bg-white dark:bg-[#17191c]" />
        </div>
      </div>
      <div className="right flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-2.5 mb-[10px] dark:bg-[#17191c]">
        {children}
      </div>

      {/* {children} */}
    </div>
  );
}

export default ChatHomeLayout;
