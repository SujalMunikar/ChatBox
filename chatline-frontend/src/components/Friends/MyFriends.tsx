import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getMyFriends, unfriend } from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import ViewToggle from "../UI/ViewToggle";
import usePersistedViewMode from "../../hooks/usePersistedViewMode";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

// Keeps email text from overflowing regardless of layout choice.
const getEmailClassName = (email: string | undefined, variant: "card" | "list") => {
  if (variant === "list") {
    return "text-sm text-slate-500 truncate";
  }
  const length = email?.length ?? 0;
  const sizeClass = length > 36 ? "text-xs" : length > 24 ? "text-[13px]" : "text-sm";
  return `${sizeClass} text-center text-slate-500 break-words`;
};

type MyFriendsProps = {
  onStartChat?: (friendId: string) => void;
};

// Displays the signed-in user's friends and wires up chat + unfriend actions.
export default function MyFriends({ onStartChat }: MyFriendsProps) {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  // Preserve the user's preferred card/list view across page refreshes.
  const [viewMode, setViewMode] = usePersistedViewMode("friends:view:myfriends", "card");
  const { authState } = useAuth();
  // const navigate = useNavigate();
  useEffect(() => {
    // Avoid refetching once we already have the friend roster unless new actions fire refresh().
    if (!friends.hasLoadedMyFriends && !friends.loading) {
      dispatch(getMyFriends());
    }
  }, [dispatch, friends.hasLoadedMyFriends, friends.loading]);

  const refresh = () => dispatch(getMyFriends());

  const currentUserId = authState?.user?.id;
  // Memoize so the render diff only runs when the data changes, not just on view toggles.
  const friendCards = useMemo(
    () =>
      Array.isArray(friends.allMyFriends)
        ? friends.allMyFriends.filter((item: any) => item?.id && item.id !== currentUserId)
        : [],
    [friends.allMyFriends, currentUserId]
  );

  const confirmUnfollow = (friend: { id: string; name: string }) => {
    // Custom toast doubles as a confirmation modal without leaving the page context.
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
          {friendCards.map((item: any) => {
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
                  <p className={getEmailClassName(item.email, "card")}>{item.email}</p>
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
          {friendCards.map((item: any) => {
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
                    <div className={getEmailClassName(item.email, "list")}>{item.email}</div>
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
