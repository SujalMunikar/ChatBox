/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import MessageRow from "./MessageRow";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setCurrentConversationUser,
} from "../../features/user/userSlice";
import {
  getConversations,
  sendMessage,
} from "../../features/conversation/conversationAction";
import useAuth from "../../hooks/useAuth";
import { getSocket } from "../../features/socket/socketConfig";
import { appendConversation, clearError } from "../../features/conversation/conversationSlice";
import { censorMessage } from "../../helper/message.helper";
import { useParams } from "react-router-dom";
import { UserType } from "../../Types/user.type";

type ConversationBodyProps = {
  peerId?: string;
};

function ConversationBody(props: ConversationBodyProps) {
  const { peerId } = props;
  const { id: routeId } = useParams();
  const id = (peerId ?? routeId) as string | undefined;
  const conversationAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const [inputString, setInputString] = useState("");
  const dispatch = useAppDispatch();
  const userSlice = useAppSelector((state) => state.user);
  const { authState } = useAuth();
  const conversationSlice = useAppSelector((state) => state.conversation);
  const socketSlice = useAppSelector((state) => state.socket);
  const isOnline = id ? (socketSlice.onlineUsers as any)?.[id as string] : undefined;

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

  // Set current conversation user
  useEffect(() => {
    if (userSlice?.friends && id) {
      const currActive = userSlice.friends.filter((user: UserType) => {
        return user.id === id;
      });
      if (currActive.length > 0) {
        dispatch(setCurrentConversationUser(currActive[0]));
      }
    }
    return () => {
      dispatch(setCurrentConversationUser(null));
    };
  }, [userSlice?.friends, id, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!conversationSlice?.conversation) {
      return;
    }
    window.requestAnimationFrame(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [conversationSlice?.conversation]);

  const handleSendMessage = () => {
    if (inputString.trim() && id && authState.user.id) {
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
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      );
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
        <div className="chat-section-right-head h-[60px] bg-white border-[#DBDDE1] border-b dark:bg-[#17191c] dark:border-[#17191c] flex items-center px-3 ">
          <div className="flex gap-2 ">
            <div className="img h-10 w-10 rounded-full bg-slate-500">
              <img src="https://avatar.iran.liara.run/public/42" alt="" />
            </div>
            <div className="name-and-message flex flex-col gap-[0px]">
              <div className="name font-bold dark:text-white">
                {userSlice?.currConversationUser?.name || "Unknown User"}
              </div>
              <div className="message text-sm ">
                {isOnline ? (
                  <span className="text-green-500">Online</span>
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