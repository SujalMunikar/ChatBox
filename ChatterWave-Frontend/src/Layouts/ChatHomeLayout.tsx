import React, { useEffect } from "react";
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
  // const socketSlice = useSelector((state: RootState) => state.socket);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getMyFriends());
  }, [dispatch]);

  useEffect(() => {
    if (searchText.trim().length) {
      dispatch(filterAllMyFriends(searchText));
    } else {
      dispatch(getMyFriends());
    }
  }, [searchText]);

  return (
    <div className={cn("flex", embedded ? "h-[calc(100vh-80px)]" : "h-screen")}>
      <div
        className={cn(
          "left h-full flex flex-col bg-white border-[#DBDDE1] dark:border-[#272A30] border-r dark:bg-[#17191c]",
          {
            "w-[68px]": !uiSlice.isSidebarOpen,
            "w-full fixed sm:relative sm:w-96 ": uiSlice.isSidebarOpen,
          }
        )}
      >
        <div className="h-[60px] flex items-center justify-center px-2 gap-4">
          <div>
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
              name=""
              id=""
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none  px-4 py-[10px] rounded-3xl flex-1 dark:text-neutral-50"
            />
          )}
        </div>
        <div className="scss-chat-row-container flex-1 overflow-y-auto thin-scrollbar scrollbar-stable">
          {!friendSlice?.loading && friendSlice?.myFriends?.length ? (
            <>
              {friendSlice?.myFriends?.map((e: any) => {
                return (
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
                );
              })}
            </>
          ) : (
            <div className="dark:text-neutral-50">No Friends</div>
          )}
          {userSlice?.loading &&
            [...Array(4)].map(() => {
              return <ChatRowLoading />;
            })}
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
