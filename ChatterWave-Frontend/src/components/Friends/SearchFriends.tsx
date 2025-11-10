import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  getAllGlobalUsers,
  sendFriendRequest,
} from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import ViewToggle from "../UI/ViewToggle";
import usePersistedViewMode from "../../hooks/usePersistedViewMode";
import { filterGlobalFriends } from "../../features/friends/friendsSlice";

function SearchFriends() {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const friends = useAppSelector((state) => state.friends);
  const [viewMode, setViewMode] = usePersistedViewMode("friends:view:global", "card");
  
  // Load data once on mount
  useEffect(() => {
    dispatch(getAllGlobalUsers());
  }, []);
  // }, [dispatch]); // Empty dependency array - only run once

  const handleAddFriend = (id: string) => {
    dispatch(sendFriendRequest(id));
  };

  // Filter based on search text without dispatching
  useEffect(() => {
    if (searchText === "") {
      // Reset to show all global users from state
      // Show all users - no dispatch needed, just use state
      // The data is already in state.globalUsers
      // dispatch(getAllGlobalUsers());
    } else {
      dispatch(filterGlobalFriends(searchText));
    }
  }, [searchText, dispatch]);

  return (
    <div className="flex flex-col">
      <div className="pt-1 pb-2 mb-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search Users by name or email"
            className="flex-1 border border-[#DBDDE1] dark:border-[#272A30] dark:bg-[#17191C] outline-none px-4 py-[10px] rounded-3xl dark:text-neutral-50"
          />
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <hr className="mb-4" />
      {searchText?.length > 0 && (
        <div className="text-primary-text-color text-sm mt-2">
          Showing results for "{searchText}"
        </div>
      )}

      {viewMode === "card" ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(friends?.allUsers ?? []).filter((u: any) => !u?.isFriend).map((item: any) => {
            return (
              <div
                key={item.id}
                className="flex flex-col bg-secondary-bg-color border dark:border-gray-500 rounded-lg w-full pt-4"
              >
                <div className="m-auto size-24 flex justify-center items-center">
                  <Avatar name={item.name} image={item?.image ?? undefined} size={sizeList.large} />
                </div>
                <div className="p-6 pb-2 text-center">
                  <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-500 uppercase">{item.email}</p>
                </div>
                <div className="flex justify-center p-4 gap-4">
                  {item?.isFriend ? (
                    <span className="text-slate-500">Already a friend</span>
                  ) : (
                    <button
                      className="min-w-32 rounded-md bg-slate-800 py-2 px-4 text-sm text-white shadow-md hover:shadow-lg"
                      type="button"
                      onClick={() => handleAddFriend(item.id)}
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {(friends?.allUsers ?? []).filter((u: any) => !u?.isFriend).map((item: any) => {
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
                <div className="shrink-0">
                  {item?.isFriend ? (
                    <span className="text-slate-500 text-sm">Friend</span>
                  ) : (
                    <button
                      className="rounded-md bg-slate-800 py-2 px-4 text-sm text-white shadow-md hover:shadow-lg"
                      type="button"
                      onClick={() => handleAddFriend(item.id)}
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchFriends;
