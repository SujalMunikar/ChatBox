import React, { PropsWithChildren, useEffect, useState } from "react";
import ProfileLayout from "../Layouts/ProfileLayout";
import PageTitleSection from "../components/UI/PageTitleSection";
import { cn } from "../helper/tailwindMergeClass.helper";
import SearchFriends from "../components/Friends/SearchFriends";
import MyFriends from "../components/Friends/MyFriends";
import FriendRequests from "../components/Friends/FriendRequests";

interface tabsType {
  title: string;
}

function FriendsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs: Array<tabsType> = [
    { title: "Global" },
    { title: "My Friends" },
    { title: "Friend Requests" },
    // { title: "MyFriends" },
    // { title: "MyFriends" },
  ];

  useEffect(() => {}, []);

  return (
    <ProfileLayout>
      <div className="my-width">
        <PageTitleSection title="Friends" p="Get connected securely." />
        <div className="flex  gap-5 flex-col-reverse md:flex-row">
          <div className="w-[200px] ">
            <div className="w-full bg-secondary-bg-color shadow-md p-4 text-primary-text-color rounded-lg">
              {tabs.map((tab: tabsType, index: number) => {
                return (
                  <button
                    className={cn(
                      " p-2 text-link-color hover:text-primary-accent-color w-full text-left",
                      {
                        "bg-link-hover text-primary-accent-color":
                          activeTab === index,
                      }
                    )}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab.title}
                  </button>
                );
              })}
            </div>
          </div>
          <div className=" flex-1 shadow-lg bg-secondary-bg-color p-4 text-primary-text-color">
            {/* {activeTab} */}
            {activeTab === 0 && <SearchFriends />}
            {activeTab === 1 && <MyFriends />}
            {activeTab === 2 && <FriendRequests />}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default FriendsPage;
