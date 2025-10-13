/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSocketContext } from "../../context/SocketContext";
import { useAppSelector } from "../../store";
import { UserType } from "../../Types/user.type";

interface ChartRowPropsType {
  active?: boolean;
  data: UserType;
  onClick?: () => void;
}
function ChatRow(props: ChartRowPropsType) {
  const { active, data, ...rest } = props;
  const socketSlice = useAppSelector((state) => state.socket);
  const uiSlice = useAppSelector((state) => state.ui);
  // const { onlineUsers } = useSocketContext();
  // const isOnline = onlineUsers[data?.id];
  const isOnline = socketSlice.onlineUsers[data?.id] as string;
  return (
    <div
      className={`flex items-center justify-between  px-2 hover:bg-[#DBDDE1] dark:hover:bg-[#272A30] ${
        active && "bg-[#DBDDE1] dark:bg-[#272A30]"
      } cursor-pointer h-20`}
      {...rest}
    >
      <div className="left flex gap-2 ">
        <div className="img size-[49px] rounded-full bg-slate-500 relative">
          <img src="https://avatar.iran.liara.run/public/42" alt="" />
          {isOnline && (
            <div className="dot h-3 w-3 rounded-full bg-green-500 absolute top-[0px] right-1" />
          )}
        </div>
        {uiSlice.isSidebarOpen && (
          <div className="name-and-message flex flex-col gap-[2px]">
            <div className="name font-bold dark:text-white">{data?.name}</div>
            <div className="message text-sm dark:text-[#747881] whitespace-nowrap text-ellipsis max-w-[240px] overflow-hidden">
              {data?.email}
              {/* {data?.id} */}
            </div>
          </div>
        )}
      </div>
      {uiSlice.isSidebarOpen && (
        <div className="right flex flex-col justify-between">
          <div className="r-top h-4"></div>
          <div className="r-bottom dark:text-[#747881]">9:41 AM</div>
        </div>
      )}
    </div>
  );
}

export default ChatRow;

export const ChatRowLoading = () => {
  return (
    <div className={`flex items-center justify-between  px-2  h-20`}>
      <div className="left flex gap-2 ">
        <div className="img size-[49px]  rounded-full animate-pulse bg-gray-200 dark:bg-gray-700 relative"></div>
        <div className="name-and-message flex flex-col gap-[2px]">
          <div className="name font-bold animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-28"></div>
          <div className="message text-sm dark:text-[#747881] whitespace-nowrap text-ellipsis  overflow-hidden animate-pulse bg-gray-200 dark:bg-gray-700 h-5 w-[280px]"></div>
        </div>
      </div>
    </div>
  );
};
