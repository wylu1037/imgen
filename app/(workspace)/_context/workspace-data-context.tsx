"use client";

import * as React from "react";

import { useChatHistory } from "../_hooks/use-chat-history";
import { useProviderSettings } from "../_hooks/use-provider-settings";

type ChatHistory = ReturnType<typeof useChatHistory>;
type ProviderSettings = ReturnType<typeof useProviderSettings>;

type WorkspaceDataContextValue = {
  chatHistory: ChatHistory;
  providerSettings: ProviderSettings;
  selectedTurnId: string | null;
  setSelectedTurnId: React.Dispatch<React.SetStateAction<string | null>>;
};

const WorkspaceDataContext =
  React.createContext<WorkspaceDataContextValue | null>(null);

export function WorkspaceDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const chatHistory = useChatHistory();
  const providerSettings = useProviderSettings();
  const [selectedTurnId, setSelectedTurnId] = React.useState<string | null>(
    null,
  );

  const value = React.useMemo<WorkspaceDataContextValue>(
    () => ({
      chatHistory,
      providerSettings,
      selectedTurnId,
      setSelectedTurnId,
    }),
    [chatHistory, providerSettings, selectedTurnId],
  );

  return (
    <WorkspaceDataContext.Provider value={value}>
      {children}
    </WorkspaceDataContext.Provider>
  );
}

export function useWorkspaceData(): WorkspaceDataContextValue {
  const ctx = React.useContext(WorkspaceDataContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceData must be used within a WorkspaceDataProvider",
    );
  }
  return ctx;
}
