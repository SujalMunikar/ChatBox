import { useEffect, useState } from "react";
import ProfileLayout from "../Layouts/ProfileLayout";
import PageTitleSection from "../components/UI/PageTitleSection";
import { cn } from "../helper/tailwindMergeClass.helper";
import SearchFriends from "../components/Friends/SearchFriends";
import MyFriends from "../components/Friends/MyFriends";
import IncomingRequests from "../components/Friends/IncomingRequests.tsx";
import OutgoingRequests from "../components/Friends/OutgoingRequests.tsx";
import ConversationBody from "../components/Chat/ConversationBody";

interface tabsType {
  title: string;
}

function FriendsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<
    "incoming" | "outgoing"
  >("incoming");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const tabs: Array<tabsType> = [
    { title: "Global" },
    { title: "My Friends" },
    { title: "Friend Requests" },
    // { title: "MyFriends" },
    // { title: "MyFriends" },
  ];

  useEffect(() => {}, []);
  useEffect(() => {
    if (activeTab !== 1) {
      setSelectedChatId(null);
    }
  }, [activeTab]);

  return (
    <ProfileLayout>
      <div className="my-width">
        <PageTitleSection title="Friends" p="Get connected securely." />
        <div className="flex gap-5 flex-col-reverse md:flex-row">
          <div className="w-[220px] ">
            <div className="w-full bg-secondary-bg-color shadow-md p-3 text-primary-text-color rounded-lg">
              {tabs.map((tab: tabsType, index: number) => {
                const isActive = activeTab === index;
                const isRequests = tab.title === "Friend Requests";
                return (
                  <div key={tab.title}>
                    <button
                      className={cn(
                        "p-2 rounded-md text-link-color hover:text-primary-accent-color w-full text-left",
                        {
                          "bg-link-hover text-primary-accent-color": isActive,
                        }
                      )}
                      onClick={() => {
                        setActiveTab(index);
                        setShowRequestOptions(isRequests ? !showRequestOptions : false);
                      }}
                    >
                      {tab.title}
                    </button>

                    {isRequests && isActive && showRequestOptions && (
                      <div className="pl-3 mt-1 flex flex-col gap-1">
                        <button
                          className={cn(
                            "p-2 rounded-md text-sm w-full text-left text-link-color hover:text-primary-accent-color",
                            {
                              "bg-link-hover text-primary-accent-color":
                                activeRequestTab === "incoming",
                            }
                          )}
                          onClick={() => setActiveRequestTab("incoming")}
                        >
                          Incoming
                        </button>
                        <button
                          className={cn(
                            "p-2 rounded-md text-sm w-full text-left text-link-color hover:text-primary-accent-color",
                            {
                              "bg-link-hover text-primary-accent-color":
                                activeRequestTab === "outgoing",
                            }
                          )}
                          onClick={() => setActiveRequestTab("outgoing")}
                        >
                          Outgoing
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className={cn(
              "flex-1 shadow-lg bg-secondary-bg-color p-4 pr-3 text-primary-text-color rounded-lg md:min-h-[60vh] md:max-h-[calc(100vh-120px)] pb-[10px] mb-[10px]",
              {
                "md:overflow-y-auto thin-scrollbar scrollbar-stable-both": !selectedChatId,
                // "flex flex-col min-h-0": !!selectedChatId,
                "flex flex-col min-h-0 overflow-y-auto thin-scrollbar scrollbar-stable-both": !!selectedChatId,
              }
            )}
          >
            {selectedChatId ? (
              <div className="flex flex-1 min-h-0 flex-col">
                <div className="pb-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChatId(null)}
                    className="text-link-color hover:text-primary-accent-color"
                    aria-label="Back to My Friends"
                  >
                    &nbsp; Back to My Friends
                  </button>
                </div>
                <div className="flex flex-1 min-h-0">
                  <ConversationBody peerId={selectedChatId} />
                </div>
              </div>
            ) : (
              <>
                {activeTab === 0 && <SearchFriends />}
                {activeTab === 1 && (
                  <MyFriends onStartChat={(id: string) => setSelectedChatId(id)} />
                )}
                {activeTab === 2 && (
                  <div className="min-h-[260px]">
                    {activeRequestTab === "incoming" ? (
                      <IncomingRequests />
                    ) : (
                      <OutgoingRequests />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default FriendsPage;
