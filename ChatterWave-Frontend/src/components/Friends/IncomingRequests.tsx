import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  acceptFriendRequest,
  getIncomingFriendRequests,
} from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import { rejectFriendRequest } from "../../features/friends/friendsAction";
import ViewToggle from "../UI/ViewToggle";
import usePersistedViewMode from "../../hooks/usePersistedViewMode";

export default function IncomingRequests() {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  const [viewMode, setViewMode] = usePersistedViewMode("friends:view:incoming", "card");

  const refresh = () => {
    dispatch(getIncomingFriendRequests());
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = (id: string) => {
    dispatch(acceptFriendRequest({ id, onSuccess: refresh }));
  };
  const handleReject = (id: string) => {
    dispatch(rejectFriendRequest({ id, onSuccess: refresh }));
  };

  const hasItems = friends?.incomingRequests?.length > 0;

  return (
    <div className="flex flex-col">
      <div className="pt-1 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Incoming Requests</h2>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <hr className="mb-4" />
      {!hasItems ? (
        <div className="text-slate-500 min-h-[260px] flex items-center">
          No incoming requests right now.
        </div>
      ) : (
  <div className="min-h-[260px] max-h-[60vh] overflow-y-auto thin-scrollbar scrollbar-stable">
          {viewMode === "card" ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends?.incomingRequests.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-secondary-bg-color border dark:border-gray-500 rounded-lg w-full pt-4"
                >
                  <div className="m-auto size-24 flex justify-center items-center">
                    <Avatar name={item?.sender?.name} image={item?.sender?.image ?? undefined} size={sizeList.large} />
                  </div>
                  <div className="p-6 pb-2 text-center">
                    <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                      {item?.sender?.name}
                    </h4>
                    <p className="text-sm text-slate-500 uppercase">
                      {item?.sender?.email}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 p-4">
                    <button
                      className="flex-1 max-w-[8rem] rounded-md bg-slate-800 py-2 px-3 sm:px-4 text-sm text-white shadow-md hover:shadow-lg focus:bg-slate-700 active:bg-slate-700 disabled:opacity-50"
                      type="button"
                      onClick={() => handleAccept(item?.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 max-w-[8rem] rounded-md bg-red-700 py-2 px-3 sm:px-4 text-sm text-white shadow-md hover:shadow-lg focus:bg-red-800 active:bg-red-800 disabled:opacity-50"
                      type="button"
                      onClick={() => handleReject(item?.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {friends?.incomingRequests.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border dark:border-gray-600 rounded-lg px-4 py-3 bg-secondary-bg-color"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-14 grid place-items-center">
                    <Avatar name={item?.sender?.name} image={item?.sender?.image ?? undefined} size={sizeList.medium} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-primary-text-color truncate">{item?.sender?.name}</div>
                    <div className="text-xs uppercase text-slate-500 truncate">{item?.sender?.email}</div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    className="rounded-md bg-slate-800 py-1.5 px-3 text-xs md:py-2 md:px-4 md:text-sm text-white shadow-md hover:shadow-lg"
                    type="button"
                    onClick={() => handleAccept(item?.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="rounded-md bg-red-700 py-1.5 px-3 text-xs md:py-2 md:px-4 md:text-sm text-white shadow-md hover:shadow-lg"
                    type="button"
                    onClick={() => handleReject(item?.id)}
                  >
                    Decline
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
