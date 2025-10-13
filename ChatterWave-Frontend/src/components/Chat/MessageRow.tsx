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
  // console.log()
  const { authState } = useAuth();
  return (
    <div
      className={`flex items-end mb-1 ${
        isSent ? "justify-end" : ""
      } gap-2 px-2 py-1`}
    >
      {!isSent && (
        <div className="left pb-5">
          <div className="img h-9 w-9 rounded-full bg-slate-400">
            <img src="https://avatar.iran.liara.run/public/42" />
          </div>
        </div>
      )}
      <div
        className={`right flex flex-col ${
          isSent ? "items-end" : "items-start"
        } `}
      >
        <div
          className={`msg w-fit max-w-72  py-2 px-4 break-words ${
            isSent
              ? "rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl bg-[#E0F0FF] dark:bg-[#001A3D] dark:text-white"
              : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl bg-[#E9EAED] dark:bg-[#17191c] dark:text-white"
          }`}
        >
          {/* {message}{" "} */}
          {isSent
            ? censorMessage(
                decryptMessage(
                  data?.encryptedMessageFromSender,
                  JSON.parse(authState.user.privateKey)
                )
              )
            : censorMessage(
                decryptMessage(
                  data?.encryptedMessageForReceiver,
                  JSON.parse(authState.user.privateKey)
                )
              )}
        </div>

        <div
          className={`mt-[2px] text-xs text-[#747881] ${
            isSent ? "text-right " : ""
          }`}
        >
          {data?.createdAt} 2:21 PM
        </div>
      </div>
    </div>
  );
}

export default MessageRow;
