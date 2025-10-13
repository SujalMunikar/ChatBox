import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  acceptFriendRequest,
  getIncomingFriendRequests,
  getOutgoinFriendRequests,
} from "../../features/friends/friendsAction";
import { ButtonPrimaryGradient } from "../UI/Button/Button";
import Avatar from "../Avatar";
import { sizeList } from "../../constants/avatarSize";

export default function FriendRequests() {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.friends);
  const fetchIncomingAndOutgoingRequests = () => {
    dispatch(getOutgoinFriendRequests());
    dispatch(getIncomingFriendRequests());
  };
  useEffect(() => {
    fetchIncomingAndOutgoingRequests();
  }, []);

  const handleAccept = (id: string) => {
    dispatch(
      acceptFriendRequest({ id, onSuccess: fetchIncomingAndOutgoingRequests })
    );
  };
  return (
    <div>
      FriendRequests
      <br />
      <h1>Outgoing</h1>
      <hr />
      <div className="grid grid-cols-4 gap-3">
        {friends?.outgoingRequests.map((item: any) => {
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
                    <Avatar name={item?.receiver?.name} size={sizeList.large} />
                  )}
                </div>
                <div className="p-6 pb-2 text-center">
                  <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                    {item?.receiver?.name}
                  </h4>
                  <p className="text-sm  text-slate-500 uppercase">
                    {item?.receiver?.email}
                  </p>
                </div>
              </div>
            </>
          );
        })}
      </div>
      <h1>Incoming</h1>
      <hr />
      <div className="grid grid-cols-4 gap-3">
        {friends?.incomingRequests.map((item: any) => {
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
                    <Avatar name={item?.sender?.name} size={sizeList.large} />
                  )}
                </div>
                <div className="p-6 pb-2 text-center">
                  <h4 className="mb-1 text-xl font-semibold text-primary-text-color">
                    {item?.sender?.name}
                  </h4>
                  <p className="text-sm  text-slate-500 uppercase">
                    {item?.sender?.email}
                  </p>
                </div>
                <div className="flex justify-center p-6 pt-2 gap-7">
                  <button
                    className="min-w-32  rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={() => handleAccept(item?.id)}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
