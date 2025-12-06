import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import dayjs from "dayjs";

type GroupPreviewMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  isViewer?: boolean;
};

type GroupPreviewTeammateOption = {
  id: string;
  name: string;
  initials: string;
  email: string;
  isDefaultMember: boolean;
};

type GroupPreviewMessageSeed = {
  id: string;
  senderId: string;
  text: string;
  minutesAgo: number;
};

type GroupPreviewMessage = {
  id: string;
  senderId: string;
  text: string;
  timestampLabel: string;
};

type GroupPreviewContextValue = {
  isActive: boolean;
  roster: GroupPreviewMember[];
  messages: GroupPreviewMessage[];
  teammateOptions: GroupPreviewTeammateOption[];
  showManager: boolean;
  toggleManager: (state: boolean) => void;
  activatePreview: () => void;
  deactivate: () => void;
};

const GROUP_PREVIEW_NAME = "Test Chat Crew";

const mockRoster: GroupPreviewMember[] = [
  { id: "g-member-ram", name: "Ram", initials: "R", email: "test3@gmail.com" },
  { id: "g-member-1test", name: "1test", initials: "1", email: "test1@gmail.com" },
  { id: "g-member-max", name: "Max", initials: "M", email: "test2@gmail.com" },
  { id: "g-member-7test", name: "7test", initials: "7", email: "test7@gmail.com", isViewer: true },
];

const teammateOptions: GroupPreviewTeammateOption[] = [
  { id: "g-member-ram", name: "Ram", initials: "R", email: "test3@gmail.com", isDefaultMember: true },
  {
    id: "g-member-1test",
    name: "1test",
    initials: "1",
    email: "test1@gmail.com",
    isDefaultMember: true,
  },
  { id: "g-member-max", name: "Max", initials: "M", email: "test2@gmail.com", isDefaultMember: true },
  {
    id: "g-member-hari",
    name: "Hari",
    initials: "H",
    email: "test4@gmail.com",
    isDefaultMember: false,
  },
];

const DEFAULT_ADDED_TEAMMATE_IDS = teammateOptions
  .filter((option) => option.isDefaultMember)
  .map((option) => option.id);

const messageSeeds: GroupPreviewMessageSeed[] = [
  { id: "mock-msg-1", senderId: "g-member-ram", text: "hi", minutesAgo: 20 },
  { id: "mock-msg-2", senderId: "g-member-1test", text: "hello", minutesAgo: 19 },
  { id: "mock-msg-3", senderId: "g-member-max", text: "check", minutesAgo: 18 },
  { id: "mock-msg-4", senderId: "g-member-7test", text: "123", minutesAgo: 17 },
];

const GroupPreviewContext = createContext<GroupPreviewContextValue | undefined>(undefined);

function useProvideGroupPreview(): GroupPreviewContextValue {
  const [isActive, setIsActive] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const activatePreview = useCallback(() => {
    setIsActive(true);
    setShowManager(false);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
    setShowManager(false);
  }, []);

  const toggleManager = useCallback((state: boolean) => {
    setShowManager(state);
  }, []);

  const messages = useMemo(() => {
    return messageSeeds.map((seed) => ({
      id: seed.id,
      senderId: seed.senderId,
      text: seed.text,
      timestampLabel: dayjs()
        .subtract(seed.minutesAgo, "minute")
        .format("h:mm A"),
    }));
  }, []);

  return {
    isActive,
    roster: mockRoster,
    messages,
    teammateOptions,
    showManager,
    toggleManager,
    activatePreview,
    deactivate,
  };
}

export function GroupPreviewProvider({ children }: { children: React.ReactNode }) {
  const value = useProvideGroupPreview();
  return <GroupPreviewContext.Provider value={value}>{children}</GroupPreviewContext.Provider>;
}

export function useGroupPreview() {
  const context = useContext(GroupPreviewContext);
  if (!context) {
    throw new Error("useGroupPreview must be used within GroupPreviewProvider");
  }
  return context;
}

export { GROUP_PREVIEW_NAME, DEFAULT_ADDED_TEAMMATE_IDS };

export type { GroupPreviewMember, GroupPreviewMessage, GroupPreviewTeammateOption };
