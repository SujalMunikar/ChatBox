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
import {
  DEFAULT_ADDED_TEAMMATE_IDS,
  GROUP_PREVIEW_NAME,
  GroupPreviewProvider,
  useGroupPreview,
} from "../context/GroupPreviewContext";
import { setCurrentConversationUser } from "../features/user/userSlice";
import { UserType } from "../Types/user.type";
import Avatar from "../components/Avatar";
import { sizeList } from "../constants/avatarSize";

interface ChatHomeLayoutPropsType {
  children: React.ReactNode;
  embedded?: boolean;
}

function ChatHomeLayout(props: ChatHomeLayoutPropsType) {
  return (
    <GroupPreviewProvider>
      <ChatHomeLayoutInner {...props} />
    </GroupPreviewProvider>
  );
}

function ChatHomeLayoutInner(props: ChatHomeLayoutPropsType) {
  const { children, embedded = false } = props;
  const [searchText, setSearchText] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();
  const userSlice = useSelector((state: RootState) => state.user);
  const uiSlice = useSelector((state: RootState) => state.ui);
  const friendSlice = useSelector((state: RootState) => state.friends);
  const { authState } = useAuth();
  const {
    isActive: isGroupPreviewActive,
    roster: groupRoster,
    teammateOptions,
    activatePreview,
    deactivate,
    showManager,
    toggleManager,
  } = useGroupPreview();
  const [newGroupName, setNewGroupName] = React.useState(GROUP_PREVIEW_NAME);
  const [teammateSearch, setTeammateSearch] = React.useState("");
  const [modalSelections, setModalSelections] = React.useState<string[]>([
    ...DEFAULT_ADDED_TEAMMATE_IDS,
  ]);
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
  const filteredFriends: UserType[] = useMemo(() => {
    if (!Array.isArray(friendSlice?.myFriends)) {
      return [];
    }
    return (friendSlice.myFriends as UserType[]).filter(
      (friend) => Boolean(friend?.id) && friend.id !== currentUserId
    );
  }, [friendSlice?.myFriends, currentUserId]);

  const hasFriends = filteredFriends.length > 0;
  const showSkeleton = friendSlice?.loading && !hasFriends;
  const showGroupChatRow = true;
  const groupMemberLabel = React.useMemo(() => {
    if (!groupRoster.length) {
      return "Add teammates";
    }
    return groupRoster.map((member) => member.name).join(", ");
  }, [groupRoster]);
  const groupRowIsActive = isGroupPreviewActive;

  const handleActivateGroupPreview = React.useCallback(() => {
    dispatch(setCurrentConversationUser(null));
    activatePreview();
  }, [activatePreview, dispatch]);

  const handleOpenGroupManager = () => {
    handleActivateGroupPreview();
    toggleManager(true);
  };

  useEffect(() => {
    if (showManager) {
      setNewGroupName(GROUP_PREVIEW_NAME);
      setTeammateSearch("");
      setModalSelections([...DEFAULT_ADDED_TEAMMATE_IDS]);
    }
  }, [showManager]);

  const filteredModalTeammates = useMemo(() => {
    const query = teammateSearch.trim().toLowerCase();
    if (!query) {
      return teammateOptions;
    }
    return teammateOptions.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    });
  }, [teammateOptions, teammateSearch]);

  const handleModalTeammateToggle = (memberId: string) => {
    setModalSelections((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

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
        {uiSlice.isSidebarOpen && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={handleOpenGroupManager}
              className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600"
            >
              + New Group Chat
            </button>
          </div>
        )}
        <div className="scss-chat-row-container flex-1 overflow-y-auto thin-scrollbar scrollbar-stable">
          {showGroupChatRow && (
            <button
              type="button"
              onClick={handleActivateGroupPreview}
              className={cn(
                "flex h-20 w-full items-center justify-between px-3 text-left transition dark:bg-transparent",
                groupRowIsActive
                  ? "bg-[#DBDDE1] dark:bg-[#272A30]"
                  : "hover:bg-[#DBDDE1] dark:hover:bg-[#272A30]"
              )}
            >
              <div className="left flex items-center gap-2.5">
                <Avatar name={GROUP_PREVIEW_NAME} size={sizeList.medium} />
                {uiSlice.isSidebarOpen && (
                  <div className="name-and-message flex flex-col gap-[2px]">
                    <div className="name font-bold dark:text-white">{GROUP_PREVIEW_NAME}</div>
                    <span className="text-xs text-[#747881]">{groupMemberLabel}</span>
                  </div>
                )}
              </div>
            </button>
          )}
          {filteredFriends.map((friend) => (
            <ChatRow
              key={friend?.id}
              active={friend?.id === userSlice?.currConversationUser?.id}
              data={friend}
              onClick={() => {
                if (isGroupPreviewActive) {
                  deactivate();
                }
                navigate(`/chat/${friend?.id}`);
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
      {showManager && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
          aria-modal="true"
          role="dialog"
          onClick={() => toggleManager(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#101114]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                New group setup
              </span>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full border border-[#E4E6EB] p-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:border-[#272A30] dark:text-slate-300"
                onClick={() => toggleManager(false)}
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8A8F99]">
                  Group name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                  placeholder="Name your group"
                  className="mt-2 w-full rounded-2xl border border-[#DBDDE1] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 dark:border-[#272A30] dark:bg-transparent dark:text-white"
                />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Add teammates</p>
                </div>
                <input
                  type="text"
                  value={teammateSearch}
                  onChange={(event) => setTeammateSearch(event.target.value)}
                  placeholder="Search teammates by name or email"
                  className="mt-3 w-full rounded-2xl border border-[#DBDDE1] px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400 dark:border-[#272A30] dark:bg-transparent dark:text-white"
                />
                <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1 scrollbar-hidden">
                  {filteredModalTeammates.map((member) => {
                    const isSelected = modalSelections.includes(member.id);
                    const actionLabel = isSelected ? "Remove" : "Add";
                    return (
                      <div
                        key={member.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition",
                          isSelected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#E4E6EB] hover:border-emerald-200 dark:border-[#272A30] dark:hover:border-emerald-500"
                        )}
                      >
                        <span className="rounded-full p-[1px] bg-custom-gradient">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                            {member.initials}
                          </span>
                        </span>
                        <div className="flex-1 leading-tight">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-[#8A8F99] dark:text-[#9AA0A8]">
                            {member.email.toLowerCase()}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={cn(
                            "rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
                            isSelected
                              ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                              : "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                          )}
                          onClick={() => handleModalTeammateToggle(member.id)}
                        >
                          {actionLabel}
                        </button>
                      </div>
                    );
                  })}
                  {!filteredModalTeammates.length && (
                    <div className="rounded-2xl border border-dashed border-[#D1D5DB] px-4 py-6 text-center text-sm text-[#9AA0A8]">
                      No teammates match “{teammateSearch}”.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600"
                onClick={() => toggleManager(false)}
              >
                Create
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-rose-200 py-3 text-sm font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                onClick={() => toggleManager(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHomeLayout;
