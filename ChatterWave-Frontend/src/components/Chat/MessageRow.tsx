// import { censorMessage } from "../../helper/message.helper";
// import { decryptMessage } from "../../helper/rsa.helper";
// import useAuth from "../../hooks/useAuth";

// type MessageRowType = {
//   isSent?: boolean;
//   message?: string;
//   data?: any;
// };
// function MessageRow(props: MessageRowType) {
//   const { isSent, message, data } = props;
//   // console.log()
//   const { authState } = useAuth();
//   return (
//     <div
//       className={`flex items-end mb-1 ${
//         isSent ? "justify-end" : ""
//       } gap-2 px-2 py-1`}
//     >
//       {!isSent && (
//         <div className="left pb-5">
//           <div className="img h-9 w-9 rounded-full bg-slate-400">
//             <img src="https://avatar.iran.liara.run/public/42" />
//           </div>
//         </div>
//       )}
//       <div
//         className={`right flex flex-col ${
//           isSent ? "items-end" : "items-start"
//         } `}
//       >
//         <div
//           className={`msg w-fit max-w-72  py-2 px-4 break-words ${
//             isSent
//               ? "rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl bg-[#E0F0FF] dark:bg-[#001A3D] dark:text-white"
//               : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl bg-[#E9EAED] dark:bg-[#17191c] dark:text-white"
//           }`}
//         >
//           {/* {message}{" "} */}
//           {isSent
//             ? censorMessage(
//                 decryptMessage(
//                   data?.encryptedMessageFromSender,
//                   JSON.parse(authState.user.privateKey)
//                 )
//               )
//             : censorMessage(
//                 decryptMessage(
//                   data?.encryptedMessageForReceiver,
//                   JSON.parse(authState.user.privateKey)
//                 )
//               )}
//         </div>

//         <div
//           className={`mt-[2px] text-xs text-[#747881] ${
//             isSent ? "text-right " : ""
//           }`}
//         >
//           {data?.createdAt} 2:21 PM
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MessageRow;

// import { censorMessage } from "../../helper/message.helper";
// import { decryptMessage } from "../../helper/rsa.helper";
// import useAuth from "../../hooks/useAuth";

// type MessageRowType = {
//   isSent?: boolean;
//   message?: string;
//   data?: any;
// };

// function MessageRow(props: MessageRowType) {
//   const { isSent, message, data } = props;
//   const { authState } = useAuth();

//   // Add error handling for message decryption
//   const renderMessage = () => {
//     try {
//       if (!data) {
//         return message || "No message data";
//       }

//       const privateKey = authState.user.privateKey;
//       if (!privateKey) {
//         console.error("No private key available");
//         return message || "Unable to decrypt message";
//       }

//       let decryptedMessage = "";
      
//       if (isSent) {
//         if (data?.encryptedMessageFromSender) {
//           decryptedMessage = decryptMessage(
//             data.encryptedMessageFromSender,
//             JSON.parse(privateKey)
//           );
//         } else {
//           decryptedMessage = message || "No encrypted message";
//         }
//       } else {
//         if (data?.encryptedMessageForReceiver) {
//           decryptedMessage = decryptMessage(
//             data.encryptedMessageForReceiver,
//             JSON.parse(privateKey)
//           );
//         } else {
//           decryptedMessage = message || "No encrypted message";
//         }
//       }

//       return censorMessage(decryptedMessage);
//     } catch (error) {
//       console.error("Error decrypting message:", error);
//       return message || "Error displaying message";
//     }
//   };

//   return (
//     <div
//       className={`flex items-end mb-1 ${
//         isSent ? "justify-end" : ""
//       } gap-2 px-2 py-1`}
//     >
//       {!isSent && (
//         <div className="left pb-5">
//           <div className="img h-9 w-9 rounded-full bg-slate-400">
//             <img src="https://avatar.iran.liara.run/public/42" alt="User avatar" />
//           </div>
//         </div>
//       )}
//       <div
//         className={`right flex flex-col ${
//           isSent ? "items-end" : "items-start"
//         } `}
//       >
//         <div
//           className={`msg w-fit max-w-72 py-2 px-4 break-words ${
//             isSent
//               ? "rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl bg-[#E0F0FF] dark:bg-[#001A3D] dark:text-white"
//               : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl bg-[#E9EAED] dark:bg-[#17191c] dark:text-white"
//           }`}
//         >
//           {renderMessage()}
//         </div>

//         <div
//           className={`mt-[2px] text-xs text-[#747881] ${
//             isSent ? "text-right " : ""
//           }`}
//         >
//           {data?.createdAt ? new Date(data.createdAt).toLocaleTimeString() : "2:21 PM"}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MessageRow;

import { censorMessage } from "../../helper/message.helper";
import { decryptMessage } from "../../helper/rsa.helper";
import useAuth from "../../hooks/useAuth";

type MessageRowType = {
  isSent?: boolean;
  message?: string;
  data?: any;
};

function MessageRow(props: MessageRowType) {
  const { isSent, message, data } = props;
  const { authState } = useAuth();

  const renderMessage = () => {
    try {
      // If no data, show the plain message
      if (!data) {
        return message || "No message data";
      }

      // Check if user has private key
      if (!authState.user.privateKey) {
        console.warn("No private key available for decryption");
        return message || "Unable to decrypt message";
      }

      let decryptedMessage = "";
      
      try {
        if (isSent) {
          // For sent messages, use encryptedMessageFromSender
          if (data?.encryptedMessageFromSender) {
            decryptedMessage = decryptMessage(
              data.encryptedMessageFromSender,
              JSON.parse(authState.user.privateKey)
            );
          } else {
            decryptedMessage = message || data?.message || "No encrypted message";
          }
        } else {
          // For received messages, use encryptedMessageForReceiver
          if (data?.encryptedMessageForReceiver) {
            decryptedMessage = decryptMessage(
              data.encryptedMessageForReceiver,
              JSON.parse(authState.user.privateKey)
            );
          } else {
            decryptedMessage = message || data?.message || "No encrypted message";
          }
        }
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
        // Fallback to plain message if decryption fails
        decryptedMessage = message || data?.message || "Decryption failed";
      }

      return censorMessage(decryptedMessage);
    } catch (error) {
      console.error("Error rendering message:", error);
      return message || data?.message || "Error displaying message";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return "2:21 PM"; // fallback
    }
  };

  return (
    <div
      className={`flex items-end mb-1 ${
        isSent ? "justify-end" : ""
      } gap-2 px-2 py-1`}
    >
      {!isSent && (
        <div className="left pb-5">
          <div className="img h-9 w-9 rounded-full bg-slate-400">
            <img src="https://avatar.iran.liara.run/public/42" alt="User avatar" />
          </div>
        </div>
      )}
      <div
        className={`right flex flex-col ${
          isSent ? "items-end" : "items-start"
        } `}
      >
        <div
          className={`msg w-fit max-w-72 py-2 px-4 break-words ${
            isSent
              ? "rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl bg-[#E0F0FF] dark:bg-[#001A3D] dark:text-white"
              : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl bg-[#E9EAED] dark:bg-[#17191c] dark:text-white"
          }`}
        >
          {renderMessage()}
        </div>

        <div
          className={`mt-[2px] text-xs text-[#747881] ${
            isSent ? "text-right " : ""
          }`}
        >
          {data?.createdAt ? formatTime(data.createdAt) : "2:21 PM"}
        </div>
      </div>
    </div>
  );
}

export default MessageRow;