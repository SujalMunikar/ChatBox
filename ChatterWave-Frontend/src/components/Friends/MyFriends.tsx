import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getMyFriends } from "../../features/friends/friendsAction";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";
import { Link, useNavigate } from "react-router-dom";

export default function MyFriends() {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(getMyFriends());
  }, []);
  return (
    <div>
      <h1>My Friends</h1>
      <div className="grid grid-cols-4 gap-3">
        {friends.allMyFriends?.map((item: any) => {
          return (
            <>
              <div
                key={item.id}
                className="flex flex-col bg-secondary-bg-color border dark:border-gray-500  rounded-lg my-6 w-full pt-4"
              >
                <div className="m-auto overflow-hidden rounded-full size-24 flex justify-center items-center">
                  {item?.image ? (
                    <img
                      className="w-full h-full object-cover"
                      src={
                        item.image ?? "https://avatar.iran.liara.run/public/42"
                      }
                      alt="profile-picture"
                    />
                  ) : (
                    <Avatar name={item.name} size={sizeList.large} />
                  )}
                </div>
                <div className="p-6 pb-2 text-center">
                  <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                    {item.name}
                  </h4>
                  <p className="text-sm  text-slate-500 uppercase">
                    {item.email}
                  </p>
                </div>
                <div className="flex justify-center p-6 pt-2 gap-7">
                  <Link to={`/chat/${item.id}`}>
                    <button
                      className="min-w-32  rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                    >
                      Chat
                    </button>
                  </Link>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
