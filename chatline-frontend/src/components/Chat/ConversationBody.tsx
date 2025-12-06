/* eslint-disable @typescript-eslint/no-explicit-any */
// Primary chat pane responsible for loading conversation history and handling message send flow.
import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageRow from "./MessageRow";
import WelcomeChat from "./WelcomeChat";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentConversationUser } from "../../features/user/userSlice";
import {
  getConversations,
  sendMessage,
} from "../../features/conversation/conversationAction";
import useAuth from "../../hooks/useAuth";
import { getSocket } from "../../features/socket/socketConfig";
import {
  appendConversation,
  clearError,
  clearUnreadCount,
} from "../../features/conversation/conversationSlice";
import { censorMessage } from "../../helper/message.helper";
import { useParams } from "react-router-dom";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DEFAULT_ADDED_TEAMMATE_IDS,
  GROUP_PREVIEW_NAME,
  useGroupPreview,
} from "../../context/GroupPreviewContext";
import { cn } from "../../helper/tailwindMergeClass.helper";

dayjs.extend(relativeTime);

type ConversationBodyProps = {
  peerId?: string;
};

function ConversationBody(props: ConversationBodyProps) {
  const { peerId } = props;
  const { id: routeId } = useParams();
  const id = (peerId ?? routeId) as string | undefined;
  const conversationAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [inputString, setInputString] = useState("");
  const dispatch = useAppDispatch();
  const userSlice = useAppSelector((state) => state.user);
  const friendsSlice = useAppSelector((state) => state.friends);
  const { authState } = useAuth();
  const conversationUser = userSlice?.currConversationUser;
  const conversationSlice = useAppSelector((state) => state.conversation);
  const {
    isActive: isGroupPreviewActive,
    roster: groupPreviewRoster,
    messages: groupPreviewMessages,
    deactivate,
    teammateOptions,
  } = useGroupPreview();
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([...DEFAULT_ADDED_TEAMMATE_IDS]);
  const [previewDraft, setPreviewDraft] = useState("");
  const isOnline = conversationUser?.isOnline;
  const lastSeenLabel = conversationUser?.lastSeen
    ? dayjs(conversationUser.lastSeen).fromNow()
    : undefined;

  const friendsList = useMemo(() => {
    return Array.isArray(friendsSlice?.allMyFriends)
      ? friendsSlice.allMyFriends
      : [];
  }, [friendsSlice?.allMyFriends]);

  const directoryUsers = useMemo(() => {
    const usersData = (userSlice?.users as any)?.users;
    return Array.isArray(usersData) ? usersData : [];
  }, [userSlice?.users]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load conversations when component mounts or id changes
  useEffect(() => {
    if (isGroupPreviewActive) {
      return;
    }
    if (id && authState.user.id) {
      console.log("Loading conversations for user:", id);
      dispatch(getConversations(id));
    }
  }, [id, authState.user.id, dispatch, isGroupPreviewActive]);

  useEffect(() => {
    if (isGroupPreviewActive || !id) {
      return;
    }
    dispatch(clearUnreadCount(id));
    return () => {
      dispatch(clearUnreadCount(id));
    };
  }, [id, dispatch, isGroupPreviewActive]);

  // Socket event listener for new messages
  useEffect(() => {
    if (isGroupPreviewActive) {
      return;
    }
    const socket = getSocket();
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

    const handleNewMessage = (newMessage: any) => {
      console.log("New message received:", newMessage);
      // Only append if message is for current conversation
      if (newMessage?.receiverId === authState.user.id && newMessage?.senderId === id) {
        dispatch(appendConversation(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [id, authState.user.id, dispatch, isGroupPreviewActive]);

  // Set current conversation user using the freshest friend directory, falling back to global user list for pending connections.
  useEffect(() => {
    if (isGroupPreviewActive || !id) {
      return;
    }

    const matchFromFriends = friendsList.find((friend: any) => friend?.id === id);
    const matchFromDirectory = directoryUsers.find((user: any) => user?.id === id);
    const nextConversationUser = matchFromFriends ?? matchFromDirectory ?? null;

    if (
      nextConversationUser &&
      (!conversationUser || conversationUser.id !== nextConversationUser.id)
    ) {
      dispatch(setCurrentConversationUser(nextConversationUser));
    }

    if (!nextConversationUser && conversationUser) {
      dispatch(setCurrentConversationUser(null));
    }
  }, [friendsList, directoryUsers, id, dispatch, conversationUser, isGroupPreviewActive]);

  useEffect(() => {
    return () => {
      dispatch(setCurrentConversationUser(null));
    };
  }, [dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isGroupPreviewActive || !conversationSlice?.conversation) {
      return;
    }
    window.requestAnimationFrame(() => {
      lastMessageRef.current?.scrollIntoView({ block: "end" });
    });
  }, [conversationSlice?.conversation, isGroupPreviewActive]);

  useEffect(() => {
    if (isGroupPreviewActive) {
      return;
    }
    if (id) {
      messageInputRef.current?.focus({ preventScroll: true });
    }
  }, [id, isGroupPreviewActive]);

  useEffect(() => {
    if (isGroupPreviewActive) {
      return;
    }
    if (!conversationSlice?.sendMessage_loading) {
      messageInputRef.current?.focus({ preventScroll: true });
    }
  }, [conversationSlice?.sendMessage_loading, isGroupPreviewActive]);

  useEffect(() => {
    setSelectedTeammates([...DEFAULT_ADDED_TEAMMATE_IDS]);
    setPreviewDraft("");
    if (!isGroupPreviewActive) {
      setShowAddPopover(false);
    }
  }, [isGroupPreviewActive]);

  const handleToggleTeammate = (memberId: string) => {
    setSelectedTeammates((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handlePreviewDraftSend = () => {
    if (!previewDraft.trim()) {
      return;
    }
    setPreviewDraft("");
  };

  // Sanitize, dispatch, and reset the message input.
  const handleSendMessage = () => {
    if (isGroupPreviewActive) {
      return;
    }
    if (inputString.trim() && id && authState.user.id) {
      // Run the outgoing text through the profanity filter and dispatch the async thunk.
      const sanitized = censorMessage(inputString.trim());
      console.log("Sending message:", sanitized, "to:", id);
      dispatch(sendMessage({
        id: id,
        message: sanitized,
      }));
      setInputString("");
    }
  };

  // Show error message if there's an error
  // if (conversationSlice.error) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <div className="text-center">
  //         <div className="text-red-500 mb-2">Error: {conversationSlice.error}</div>
  //         <button
  //           onClick={() => {
  //             dispatch(clearError());
  //             if (id) dispatch(getConversations(id));
  //           }}
  //           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Render messages with better error handling
  const renderMessages = () => {
    if (conversationSlice?.conversation_loading) {
      if (!conversationSlice?.conversation?.length) {
        return (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        );
      }
    }

    if (!conversationSlice?.conversation || conversationSlice.conversation.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">No messages yet. Start a conversation!</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {conversationSlice.conversation.map((message: any, index: number) => {
          try {
            return (
              <div
                ref={index === conversationSlice.conversation.length - 1 ? lastMessageRef : null}
                key={message?.id || index}
              >
                <MessageRow
                  message={message?.message}
                  isSent={message?.senderId === authState.user.id}
                  data={message}
                />
              </div>
            );
          } catch (error) {
            console.error("Error rendering message:", error, message);
            return (
              <div key={index} className="text-red-500 p-2">
                Error rendering message
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderGroupPreviewMessages = () => {
    return groupPreviewMessages.map((previewMessage) => {
      const sender = groupPreviewRoster.find((member) => member.id === previewMessage.senderId);
      const isSelf = Boolean(sender?.isViewer);
      const senderName = sender?.name ?? "Preview Member";
      const senderInitials = sender?.initials ?? senderName.slice(0, 2).toUpperCase();

      return (
        <div
          key={previewMessage.id}
          className={`flex items-end ${isSelf ? "justify-end" : ""} gap-2 px-2 py-1`}
        >
          {!isSelf && (
            <div className="left pb-5">
              <div className="rounded-full p-[1px] bg-custom-gradient">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                  {senderInitials}
                </div>
              </div>
            </div>
          )}
          <div className={`right flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
            <div
              className={`mb-0.5 text-xs text-[#8A8F99] ${
                isSelf ? "text-right" : ""
              }`}
            >
              {senderName.toLowerCase()}
            </div>
            <div
              className={`msg w-fit max-w-72 py-2 px-4 break-words ${
                isSelf
                  ? "rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl bg-[#E0F0FF] text-slate-900 dark:bg-[#001A3D] dark:text-white"
                  : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl bg-[#E9EAED] text-slate-900 dark:bg-[#17191c] dark:text-white"
              }`}
            >
              {previewMessage.text}
            </div>
            <div
              className={`mt-[2px] text-xs text-[#747881] ${
                isSelf ? "text-right" : ""
              }`}
            >
              {previewMessage.timestampLabel}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderGroupPreviewPane = () => {
    const memberSubtitle = groupPreviewRoster.map((member) => member.name).join(" · ");

    return (
      <div className="chat-section-right flex min-h-0 flex-1 flex-col">
        <div className="chat-section-right-head h-[60px] bg-white border-[#DBDDE1] border-b dark:bg-[#17191c] dark:border-[#17191c] flex items-center px-4">
          <div className="flex flex-1 items-center gap-2.5">
            <Avatar name={GROUP_PREVIEW_NAME} size={sizeList.medium} />
            <div className="flex flex-col">
              <div className="font-bold text-slate-900 dark:text-white">{GROUP_PREVIEW_NAME}</div>
              <div className="text-sm text-[#747881] dark:text-slate-400">{memberSubtitle}</div>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-emerald-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
              onClick={() => setShowAddPopover((prev) => !prev)}
              aria-expanded={showAddPopover}
            >
              Add teammate
            </button>
            <button
              type="button"
              className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-500 hover:text-white"
              onClick={() => {
                setShowAddPopover(false);
                deactivate();
              }}
            >
              Delete group
            </button>
            {showAddPopover && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border border-[#DBDDE1] bg-white p-4 text-sm text-slate-700 shadow-xl dark:bg-[#101114] dark:border-[#272A30]">
                <div className="font-semibold mb-3 text-slate-900 dark:text-white">
                  Add teammates
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-hidden">
                  {teammateOptions.map((member) => {
                    const isSelected = selectedTeammates.includes(member.id);
                    const actionLabel = isSelected ? "Remove" : "Add";
                    return (
                      <div
                        key={member.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2 transition",
                          isSelected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#E4E6EB] hover:border-emerald-200 dark:border-[#272A30] dark:hover:border-emerald-500"
                        )}
                      >
                        <span className="rounded-full p-[1px] bg-custom-gradient">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700">
                            {member.initials}
                          </span>
                        </span>
                        <div className="flex-1 leading-tight">
                          <div className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-[11px] tracking-wide text-[#8A8F99] dark:text-[#9AA0A8]">
                            {member.email.toLowerCase()}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                            isSelected
                              ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                              : "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                          )}
                          onClick={() => handleToggleTeammate(member.id)}
                        >
                          {actionLabel}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="w-full rounded-full bg-slate-900 py-2 text-xs font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-slate-900"
                    onClick={() => setShowAddPopover(false)}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-full bg-rose-500 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-rose-600"
                    onClick={() => setShowAddPopover(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="scss-chat-section-right-body flex-1 min-h-0 overflow-y-auto py-3 dark:bg-[#080707] thin-scrollbar scrollbar-stable"
          ref={conversationAreaRef}
        >
          <div className="flex min-h-full flex-col justify-end gap-3">
            {renderGroupPreviewMessages()}
          </div>
        </div>
        <div className="chat-type-section h-14 shrink-0 flex items-center justify-center px-5 dark:bg-[#17191c] ">
          <input
            type="text"
            maxLength={180}
            value={previewDraft}
            onChange={(e) => setPreviewDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePreviewDraftSend();
              }
            }}
            placeholder="Type your message"
            className="border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none px-4 py-[10px] rounded-3xl flex-1 text-sm text-slate-900 dark:text-neutral-50"
          />
        </div>
      </div>
    );
  };

  if (isGroupPreviewActive) {
    return renderGroupPreviewPane();
  }

  if (!isGroupPreviewActive && !id) {
    return (
      <div className="chat-section-right flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center bg-white dark:bg-[#17191c]">
          <WelcomeChat />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="chat-section-right flex min-h-0 flex-1 flex-col">
        <div className="chat-section-right-head h-[60px] bg-white border-[#DBDDE1] border-b dark:bg-[#17191c] dark:border-[#17191c] flex items-center px-4">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={conversationUser?.name}
              image={conversationUser?.image}
              size={sizeList.medium}
            />
            <div className="name-and-message flex flex-col gap-[0px]">
              <div className="name font-bold dark:text-white flex flex-wrap items-center gap-2">
                <span>{conversationUser?.name || "Unknown User"}</span>
                {conversationUser?.email && (
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {conversationUser.email}
                  </span>
                )}
              </div>
              <div className="message text-sm ">
                {isOnline ? (
                  <span className="text-emerald-500">Online</span>
                ) : lastSeenLabel ? (
                  <span className="text-[#747881]">Last seen {lastSeenLabel}</span>
                ) : (
                  <span className="text-[#747881]">Offline</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="scss-chat-section-right-body flex-1 min-h-0 overflow-y-auto py-3 dark:bg-[#080707] thin-scrollbar scrollbar-stable"
          ref={conversationAreaRef}
        >
          <div className="flex min-h-full flex-col justify-end gap-3">
            {conversationSlice.error && (
              <div className="px-4 py-2 text-red-500">
                Error: {conversationSlice.error}{" "}
                <button
                  className="underline"
                  onClick={() => {
                    dispatch(clearError());
                    if (id) dispatch(getConversations(id));
                  }}
                >
                  Retry
                </button>
              </div>
            )}
            {renderMessages()}
          </div>
        </div>
        <div className="chat-type-section h-14 shrink-0 flex items-center justify-center px-5 dark:bg-[#17191c] ">
          <input
            type="text"
            maxLength={180}
            value={inputString}
            ref={messageInputRef}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputString(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={conversationSlice?.conversation_loading || conversationSlice?.sendMessage_loading}
            placeholder={
              conversationSlice?.conversation_loading
                ? "Getting Data..."
                : conversationSlice?.sendMessage_loading
                ? "Sending..."
                : "Type your message"
            }
            className="border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none px-4 py-[10px] rounded-3xl flex-1 dark:text-neutral-50"
          />
        </div>
      </div>
    </>
  );
}

export default ConversationBody;