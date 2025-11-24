/* eslint-disable @typescript-eslint/no-explicit-any */
// Primary chat pane responsible for loading conversation history and handling message send flow.
import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageRow from "./MessageRow";
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
    if (id && authState.user.id) {
      console.log("Loading conversations for user:", id);
      dispatch(getConversations(id));
    }
  }, [id, authState.user.id, dispatch]);

  useEffect(() => {
    if (!id) {
      return;
    }
    dispatch(clearUnreadCount(id));
    return () => {
      dispatch(clearUnreadCount(id));
    };
  }, [id, dispatch]);

  // Socket event listener for new messages
  useEffect(() => {
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
  }, [id, authState.user.id, dispatch]);

  // Set current conversation user using the freshest friend directory, falling back to global user list for pending connections.
  useEffect(() => {
    if (!id) {
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
  }, [friendsList, directoryUsers, id, dispatch, conversationUser]);

  useEffect(() => {
    return () => {
      dispatch(setCurrentConversationUser(null));
    };
  }, [dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!conversationSlice?.conversation) {
      return;
    }
    window.requestAnimationFrame(() => {
      lastMessageRef.current?.scrollIntoView({ block: "end" });
    });
  }, [conversationSlice?.conversation]);

  useEffect(() => {
    if (id) {
      messageInputRef.current?.focus({ preventScroll: true });
    }
  }, [id]);

  useEffect(() => {
    if (!conversationSlice?.sendMessage_loading) {
      messageInputRef.current?.focus({ preventScroll: true });
    }
  }, [conversationSlice?.sendMessage_loading]);

  // Sanitize, dispatch, and reset the message input.
  const handleSendMessage = () => {
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