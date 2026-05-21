"use client";

import * as React from "react";

import { useChatHistory } from "../_hooks/use-chat-history";
import { useConversations } from "../_hooks/use-conversations";
import { useProviderSettings } from "../_hooks/use-provider-settings";

type ChatHistory = ReturnType<typeof useChatHistory>;
type ProviderSettings = ReturnType<typeof useProviderSettings>;
type Conversations = ReturnType<typeof useConversations>;

type AppDataContextValue = {
  chatHistory: ChatHistory;
  providerSettings: ProviderSettings;
  conversations: Conversations;
  getSelectedTurn: (conversationId: string) => string | null;
  setSelectedTurn: (conversationId: string, turnId: string | null) => void;
};

const AppDataContext = React.createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const chatHistory = useChatHistory();
  const providerSettings = useProviderSettings();
  const conversations = useConversations({
    dbRef: chatHistory.dbRef,
    dbReady: chatHistory.dbReady,
  });
  const [selectedTurnByConv, setSelectedTurnByConv] = React.useState<
    Record<string, string>
  >({});

  const getSelectedTurn = React.useCallback(
    (conversationId: string) => selectedTurnByConv[conversationId] ?? null,
    [selectedTurnByConv],
  );

  const setSelectedTurn = React.useCallback(
    (conversationId: string, turnId: string | null) => {
      setSelectedTurnByConv((prev) => {
        if (turnId === null) {
          if (!(conversationId in prev)) return prev;
          const next = { ...prev };
          delete next[conversationId];
          return next;
        }
        if (prev[conversationId] === turnId) return prev;
        return { ...prev, [conversationId]: turnId };
      });
    },
    [],
  );

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      chatHistory,
      providerSettings,
      conversations,
      getSelectedTurn,
      setSelectedTurn,
    }),
    [
      chatHistory,
      providerSettings,
      conversations,
      getSelectedTurn,
      setSelectedTurn,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
