import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getMyFriends, unfriend } from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import ViewToggle from "../UI/ViewToggle";
import usePersistedViewMode from "../../hooks/usePersistedViewMode";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

type MyFriendsProps = {
  onStartChat?: (friendId: string) => void;
};

export default function MyFriends({ onStartChat }: MyFriendsProps) {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  const [viewMode, setViewMode] = usePersistedViewMode("friends:view:myfriends", "card");
  // const navigate = useNavigate();
  useEffect(() => {
    dispatch(getMyFriends());
  }, []);
  const refresh = () => dispatch(getMyFriends());

  const confirmUnfollow = (friend: { id: string; name: string }) => {
    const toastId = `unfollow-${friend.id}`;
    toast.custom(
      (t) => (
        <div className="rounded-lg bg-secondary-bg-color px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-primary-text-color">
            Do you want to end the friendship with {friend.name}?
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white shadow hover:bg-red-700 hover:shadow-md"
              onClick={() => {
                toast.dismiss(t.id);
                toast.remove(t.id);
                dispatch(
                  unfriend({ friendId: friend.id, friendName: friend.name, onSuccess: refresh })
                );
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-primary-text-color shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                toast.dismiss(t.id);
                toast.remove(t.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        id: toastId,
        position: "bottom-right",
        duration: 10000,
      }
    );
  };

  return (
    <div className="flex flex-col">
      <div className="pt-1 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">My Friends</div>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <hr className="mb-4" />

      {viewMode === "card" ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {friends.allMyFriends?.map((item: any) => {
            return (
              <div
                key={item.id}
                className="flex flex-col bg-secondary-bg-color border dark:border-gray-500 rounded-lg w-full pt-4"
              >
                <div className="m-auto size-24 flex justify-center items-center">
                  <Avatar name={item.name} image={item?.image ?? undefined} size={sizeList.large} />
                </div>
                <div className="p-6 pb-2 text-center">
                  <h4 className="mb-1 text-xl font-semibold 
                  
                  text-primary-text-color">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-500 uppercase">{item.email}</p>
                </div>
                <div className="flex justify-center gap-2 p-4">
                  {onStartChat ? (
                    <button
                      className="flex-1 max-w-[8rem] rounded-md bg-slate-800 py-2 px-3 sm:px-4 text-sm text-white shadow-md hover:shadow-lg"
                      type="button"
                      onClick={() => onStartChat(item.id)}
                    >
                      Chat
                    </button>
                  ) : (
                    <Link to={`/chat/${item.id}`} className="flex-1 max-w-[8rem]">
                      <button
                        className="w-full rounded-md bg-slate-800 py-2 px-3 sm:px-4 text-sm text-white shadow-md hover:shadow-lg"
                        type="button"
                      >
                        Chat
                      </button>
                    </Link>
                  )}
                  <button
                    className="flex-1 max-w-[8rem] rounded-md bg-red-700 py-2 px-3 sm:px-4 text-sm text-white shadow-md hover:shadow-lg focus:bg-red-800 active:bg-red-800"
                    type="button"
                    onClick={() => confirmUnfollow(item)}
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {friends.allMyFriends?.map((item: any) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border dark:border-gray-600 rounded-lg px-4 py-3 bg-secondary-bg-color"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-14 grid place-items-center">
                    <Avatar name={item.name} image={item?.image ?? undefined} size={sizeList.medium} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-primary-text-color truncate">{item.name}</div>
                    <div className="text-xs uppercase text-slate-500 truncate">{item.email}</div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {onStartChat ? (
                    <button
                      className="rounded-md bg-slate-800 py-1.5 px-3 text-xs md:py-2 md:px-4 md:text-sm text-white shadow-md hover:shadow-lg"
                      type="button"
                      onClick={() => onStartChat(item.id)}
                    >
                      Chat
                    </button>
                  ) : (
                    <Link to={`/chat/${item.id}`}>
                      <button
                        className="rounded-md bg-slate-800 py-1.5 px-3 text-xs md:py-2 md:px-4 md:text-sm text-white shadow-md hover:shadow-lg"
                        type="button"
                      >
                        Chat
                      </button>
                    </Link>
                  )}
                  <button
                    className="rounded-md bg-red-700 py-1.5 px-3 text-xs md:py-2 md:px-4 md:text-sm text-white shadow-md hover:shadow-lg"
                    type="button"
                    onClick={() => confirmUnfollow(item)}
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
