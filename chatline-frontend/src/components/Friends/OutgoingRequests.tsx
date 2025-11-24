import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getOutgoinFriendRequests } from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import { cancelFriendRequest } from "../../features/friends/friendsAction";
import ViewToggle from "../UI/ViewToggle";
import usePersistedViewMode from "../../hooks/usePersistedViewMode";

// Shared helper below keeps email strings readable even in tight row layouts.
const getEmailClassName = (email: string | undefined, variant: "card" | "list") => {
  if (variant === "list") {
    return "text-sm text-slate-500 truncate";
  }
  const length = email?.length ?? 0;
  const sizeClass = length > 36 ? "text-xs" : length > 24 ? "text-[13px]" : "text-sm";
  return `${sizeClass} text-center text-slate-500 break-words`;
};

// Shows everyone you've already invited so you can cancel or simply keep track.
export default function OutgoingRequests() {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  // Remember the preferred visual layout for this table separately from other tabs.
  const [viewMode, setViewMode] = usePersistedViewMode("friends:view:outgoing", "card");

  useEffect(() => {
    dispatch(getOutgoinFriendRequests());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasItems = friends?.outgoingRequests?.length > 0;
  const refresh = () => dispatch(getOutgoinFriendRequests()); // Re-fetch after cancellations to keep the tally accurate.

  return (
    <div className="flex flex-col">
      <div className="pt-1 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Outgoing Requests</h2>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <hr className="mb-4" />
      {!hasItems ? (
        <div className="text-slate-500 min-h-[260px] flex items-center">
          You haven't sent any requests yet.
        </div>
      ) : (
  <div className="min-h-[260px] max-h-[60vh] overflow-y-auto thin-scrollbar scrollbar-stable">
        {viewMode === "card" ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {friends?.outgoingRequests.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col bg-secondary-bg-color border dark:border-gray-500 rounded-lg w-full pt-4"
                  >
                    <div className="m-auto size-24 flex justify-center items-center">
                      <Avatar name={item?.receiver?.name} image={item?.receiver?.image ?? undefined} size={sizeList.large} />
                    </div>
                <div className="p-6 pb-2 text-center">
                      <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                        {item?.receiver?.name}
                      </h4>
                      <p className={getEmailClassName(item?.receiver?.email, "card")}>
                        {item?.receiver?.email}
                      </p>
                    </div>
                <div className="flex justify-center gap-2 p-4">
                      <button
                    className="flex-1 max-w-[8rem] rounded-md bg-red-700 py-2 px-3 sm:px-4 text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-red-800 active:bg-red-800 disabled:opacity-50"
                        type="button"
                        onClick={() => dispatch(cancelFriendRequest({ id: item.id, onSuccess: refresh }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {friends?.outgoingRequests.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border dark:border-gray-600 rounded-lg px-4 py-3 bg-secondary-bg-color"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-14 grid place-items-center">
                    <Avatar name={item?.receiver?.name} image={item?.receiver?.image ?? undefined} size={sizeList.medium} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-primary-text-color truncate">{item?.receiver?.name}</div>
                    <div className={getEmailClassName(item?.receiver?.email, "list")}>{item?.receiver?.email}</div>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    className="rounded-md bg-red-700 py-2 px-4 text-sm text-white shadow-md hover:shadow-lg"
                    type="button"
                    onClick={() => dispatch(cancelFriendRequest({ id: item.id, onSuccess: refresh }))}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
