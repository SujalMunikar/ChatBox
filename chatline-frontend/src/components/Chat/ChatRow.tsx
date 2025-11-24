/* eslint-disable @typescript-eslint/no-unused-vars */
// Renders a single conversation preview entry with presence indicators.
import { useAppSelector } from "../../store";
import { UserType } from "../../Types/user.type";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ChartRowPropsType {
  active?: boolean;
  data: UserType;
  onClick?: () => void;
}
function ChatRow(props: ChartRowPropsType) {
  const { active, data, ...rest } = props;
  const uiSlice = useAppSelector((state) => state.ui);
  const isOnline = Boolean(data?.isOnline);
  // Friendly human-readable last seen string for offline users.
  const lastSeenLabel = data?.lastSeen ? dayjs(data.lastSeen).fromNow() : "Offline";
  return (
    <div
      className={`flex items-center justify-between px-3 hover:bg-[#DBDDE1] dark:hover:bg-[#272A30] ${
        active && "bg-[#DBDDE1] dark:bg-[#272A30]"
      } cursor-pointer h-20`}
      {...rest}
    >
      <div className="left flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <Avatar name={data?.name} image={data?.image} size={sizeList.medium} />
          {/* Show the presence badge when the contact is online. */}
          {isOnline && (
            <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-[#17191c]" />
          )}
        </div>
        {uiSlice.isSidebarOpen && (
          <div className="name-and-message flex flex-col gap-[2px]">
            <div className="name font-bold dark:text-white">{data?.name}</div>
            {isOnline ? (
              <span className="text-xs font-medium text-emerald-500">Online</span>
            ) : (
              <span className="text-xs text-[#747881]">Last seen {lastSeenLabel}</span>
            )}
          </div>
        )}
      </div>
      {uiSlice.isSidebarOpen && (
        <div className="right flex flex-col justify-between">
          <div className="r-top h-4"></div>
          {/* <div className="r-bottom dark:text-[#747881]">9:41 AM</div> */}
        </div>
      )}
    </div>
  );
}

export default ChatRow;

export const ChatRowLoading = () => {
  // Skeleton used while contact data is loading.
  return (
    <div className={`flex items-center justify-between px-3 h-20`}>
      <div className="left flex items-center gap-2.5">
        <div className="h-12 w-12 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700" />
        <div className="name-and-message flex flex-col gap-[2px]">
          <div className="name font-bold animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-28"></div>
          <div className="message text-sm dark:text-[#747881] whitespace-nowrap text-ellipsis  overflow-hidden animate-pulse bg-gray-200 dark:bg-gray-700 h-5 w-[280px]"></div>
        </div>
      </div>
    </div>
  );
};
