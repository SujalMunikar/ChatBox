// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import MessageRow from "./MessageRow";
// import { useAppDispatch, useAppSelector } from "../../store";
// import {
//   setConversationUser,
//   setCurrentConversationUser,
// } from "../../features/user/userSlice";
// import {
//   getConversations,
//   sendMessage,
// } from "../../features/conversation/conversationAction";
// import useAuth from "../../hooks/useAuth";
// import { getSocket } from "../../features/socket/socketConfig";
// import { appendConversation } from "../../features/conversation/conversationSlice";
// import { useParams } from "react-router-dom";
// import { UserType } from "../../Types/user.type";

// function ConversationBody() {
//   const { id } = useParams();
//   const conversationAreaRef = useRef<HTMLDivElement>(null);
//   const lastMessageRef = useRef<HTMLDivElement>(null);

//   const [inputString, setInputString] = useState("");
//   const dispatch = useAppDispatch();
//   const userSlice = useAppSelector((state) => state.user);
//   const { authState } = useAuth();
//   const conversationSlice = useAppSelector((state) => state.conversation);
//   const socketSlice = useAppSelector((state) => state.socket);
//   const isOnline = socketSlice.onlineUsers[id] as string;

//   useEffect(() => {
//     dispatch(getConversations(id as string));
//     console.timeStamp("hi");
//   }, [id]);

//   useEffect(() => {
//     //socket was not initializing so we did intentionally rerender here with conversationSlice dependency
//     const socket = getSocket();
//     console.log("SOCKET CHECK:::", socket);
//     socket?.on("newMessage", (newMessage) => {
//       //only append when selected user is on screen
//       if (newMessage?.senderId === id) dispatch(appendConversation(newMessage));
//     });

//     return () => {
//       socket?.off("newMessage");
//     };
//   }, [conversationSlice]);

//   useEffect(() => {
//     const currActive = userSlice?.friends?.filter((user: UserType) => {
//       return user.id === id;
//     });
//     if (currActive) dispatch(setCurrentConversationUser(currActive[0]));
//     return () => {
//       dispatch(setCurrentConversationUser(null));
//     };
//   }, [userSlice?.friends, id]);

//   useEffect(() => {
//     if (conversationSlice?.conversation) {
//       setTimeout(() => {
//         lastMessageRef.current?.scrollIntoView({});
//       });
//     }
//   }, [conversationSlice?.conversation]);

//   return (
//     <>
//       <div className="chat-section-right h-full flex flex-col ">
//         <div className="chat-section-right-head h-[60px] bg-white  border-[#DBDDE1] border-b dark:bg-[#17191c] dark:border-[#17191c] flex items-center px-3 ">
//           <div className="flex gap-2 ">
//             <div className="img h-10 w-10 rounded-full bg-slate-500">
//               <img src="https://avatar.iran.liara.run/public/42" alt="" />
//             </div>
//             <div className="name-and-message flex flex-col gap-[0px]">
//               <div className="name font-bold dark:text-white">
//                 {userSlice?.currConversationUser?.name}
//               </div>
//               <div className="message text-sm ">
//                 {isOnline ? (
//                   <span className="text-green-500">Online</span>
//                 ) : (
//                   <span className="text-[#747881]">Offline</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div
//           className="scss-chat-section-right-body flex-1 py-3 dark:bg-[#080707] "
//           ref={conversationAreaRef}
//         >
//           {!conversationSlice?.conversation_loading &&
//             conversationSlice?.conversation?.map((message: any) => {
//               return (
//                 <div ref={lastMessageRef} key={message?.id}>
//                   <MessageRow
//                     message={message?.message}
//                     isSent={message?.senderId === authState.user.id}
//                     data={message}
//                   />
//                 </div>
//               );
//             })}
//           {conversationSlice?.conversation_loading && <></>}
//         </div>
//         <div className="chat-type-section h-14  flex items-center justify-center px-5 dark:bg-[#17191c] ">
//           <input
//             type="text"
//             name=""
//             id=""
//             maxLength={180}
//             value={inputString}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setInputString(e.target.value)
//             }
//             onKeyDown={(e: any) => {
//               if (e.key === "Enter") {
//                 if (e.target.value.trim() !== "") {
//                   dispatch(
//                     sendMessage({
//                       id: id as string,
//                       message: e.target.value,
//                     })
//                   );
//                 }
//                 setInputString("");
//               }
//             }}
//             disabled={conversationSlice?.conversation_loading}
//             placeholder={
//               conversationSlice?.conversation_loading
//                 ? "Getting Data..."
//                 : "Type your message"
//             }
//             className="border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none  px-4 py-[10px] rounded-3xl flex-1 dark:text-neutral-50"
//           />
//         </div>
//       </div>
//     </>
//   );
// }

// export default ConversationBody;


/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import MessageRow from "./MessageRow";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setConversationUser,
  setCurrentConversationUser,
} from "../../features/user/userSlice";
import {
  getConversations,
  sendMessage,
} from "../../features/conversation/conversationAction";
import useAuth from "../../hooks/useAuth";
import { getSocket } from "../../features/socket/socketConfig";
import { appendConversation } from "../../features/conversation/conversationSlice";
import { useParams } from "react-router-dom";
import { UserType } from "../../Types/user.type";

function ConversationBody() {
  const { id } = useParams();
  const conversationAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const [inputString, setInputString] = useState("");
  const dispatch = useAppDispatch();
  const userSlice = useAppSelector((state) => state.user);
  const { authState } = useAuth();
  const conversationSlice = useAppSelector((state) => state.conversation);
  const socketSlice = useAppSelector((state) => state.socket);
  const isOnline = socketSlice.onlineUsers[id] as string;

  // Fix: Remove the problematic dependency that causes infinite re-renders
  useEffect(() => {
    if (id) {
      dispatch(getConversations(id));
    }
  }, [id, dispatch]);

  // Fix: Socket event listener without problematic dependencies
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      // Only append when the message is for current conversation
      if (newMessage?.receiverId === authState.user.id && newMessage?.senderId === id) {
        dispatch(appendConversation(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [id, authState.user.id, dispatch]);

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

  useEffect(() => {
    if (conversationSlice?.conversation && lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [conversationSlice?.conversation]);

  const handleSendMessage = () => {
    if (inputString.trim() && id) {
      dispatch(sendMessage({
        id: id,
        message: inputString.trim(),
      }));
      setInputString("");
    }
  };

  return (
    <>
      <div className="chat-section-right h-full flex flex-col ">
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
          className="scss-chat-section-right-body flex-1 py-3 dark:bg-[#080707] overflow-y-auto"
          ref={conversationAreaRef}
        >
          {!conversationSlice?.conversation_loading && conversationSlice?.conversation ? (
            conversationSlice.conversation.map((message: any, index: number) => (
              <div 
                ref={index === conversationSlice.conversation.length - 1 ? lastMessageRef : null} 
                key={message?.id}
              >
                <MessageRow
                  message={message?.message}
                  isSent={message?.senderId === authState.user.id}
                  data={message}
                />
              </div>
            ))
          ) : conversationSlice?.conversation_loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">No messages yet. Start a conversation!</div>
            </div>
          )}
        </div>
        <div className="chat-type-section h-14 flex items-center justify-center px-5 dark:bg-[#17191c] ">
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
            disabled={conversationSlice?.conversation_loading}
            placeholder={
              conversationSlice?.conversation_loading
                ? "Getting Data..."
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