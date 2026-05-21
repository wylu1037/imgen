"use client";

import * as React from "react";

import { openChatDb, type ChatDb } from "@/lib/chat/db-client";
import { generateTitleFromPrompt } from "@/lib/chat/title";
import type { Conversation } from "@/lib/chat/types";

export type DraftConversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isDraft: true;
};

export type ActiveConversation =
  | (Conversation & { isDraft: false })
  | DraftConversation
  | null;

type UseConversationsArgs = {
  dbRef: React.MutableRefObject<ChatDb | null>;
  dbReady: boolean;
};

type UseConversations = {
  conversations: Conversation[];
  draft: DraftConversation | null;
  activeConversationId: string | null;
  activeConversation: ActiveConversation;
  isFilterableActive: boolean;
  setActiveConversationId: (id: string | null) => void;
  ensureDraft: () => void;
  newConversation: () => void;
  persistDraft: (firstPrompt: string) => Promise<string>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  touchLocal: (id: string, updatedAt: number) => void;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
    if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
    return a.id.localeCompare(b.id);
  });
}

export function useConversations({
  dbRef,
  dbReady,
}: UseConversationsArgs): UseConversations {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [draft, setDraft] = React.useState<DraftConversation | null>(null);
  const [activeConversationId, setActiveConversationIdState] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (!dbReady) return;
    const db = dbRef.current;
    if (!db) return;
    let cancelled = false;
    db.loadConversations()
      .then((rows) => {
        if (cancelled) return;
        setConversations(sortConversations(rows));
      })
      .catch((err) => {
        console.error("[useConversations] failed to load", err);
      });
    return () => {
      cancelled = true;
    };
  }, [dbRef, dbReady]);

  const setActiveConversationId = React.useCallback((id: string | null) => {
    setActiveConversationIdState(id);
    if (id !== null) {
      // switching to a persisted (or already-drafted) conversation drops any
      // unrelated draft — the draft only makes sense as the active one.
      setDraft((prev) => (prev && prev.id === id ? prev : null));
    }
  }, []);

  const ensureDraft = React.useCallback(() => {
    setDraft((prev) => {
      if (prev) {
        setActiveConversationIdState(prev.id);
        return prev;
      }
      const now = Date.now();
      const next: DraftConversation = {
        id: generateId(),
        title: "",
        createdAt: now,
        updatedAt: now,
        isDraft: true,
      };
      setActiveConversationIdState(next.id);
      return next;
    });
  }, []);

  const newConversation = React.useCallback(() => {
    const now = Date.now();
    const next: DraftConversation = {
      id: generateId(),
      title: "",
      createdAt: now,
      updatedAt: now,
      isDraft: true,
    };
    setDraft(next);
    setActiveConversationIdState(next.id);
  }, []);

  const persistDraft = React.useCallback(
    async (firstPrompt: string): Promise<string> => {
      const currentDraft = draft;
      if (!currentDraft) {
        throw new Error("No draft conversation to persist");
      }
      const db = dbRef.current;
      if (!db) throw new Error("Chat database is not ready");
      const title = generateTitleFromPrompt(firstPrompt);
      const created = await db.createConversation({
        id: currentDraft.id,
        title,
      });
      setConversations((prev) => sortConversations([created, ...prev]));
      setDraft(null);
      setActiveConversationIdState(created.id);
      return created.id;
    },
    [draft, dbRef],
  );

  const rename = React.useCallback(
    async (id: string, title: string) => {
      const db = dbRef.current;
      if (!db) return;
      const trimmed = title.trim();
      if (!trimmed) return;
      await db.renameConversation(id, trimmed);
      setConversations((prev) =>
        sortConversations(
          prev.map((c) =>
            c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c,
          ),
        ),
      );
    },
    [dbRef],
  );

  const remove = React.useCallback(
    async (id: string) => {
      const db = dbRef.current;
      if (!db) return;
      await db.deleteConversation(id);
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        // if the deleted conversation was active, jump to the most recently
        // updated remaining conversation (or trigger a draft if none remain).
        setActiveConversationIdState((currentActive) => {
          if (currentActive !== id) return currentActive;
          if (next.length === 0) {
            // schedule a draft creation in the next tick — setState during
            // setState is unsafe, so we punt via microtask.
            queueMicrotask(() => {
              setDraft((prevDraft) => {
                if (prevDraft) return prevDraft;
                const now = Date.now();
                const draftNext: DraftConversation = {
                  id: generateId(),
                  title: "",
                  createdAt: now,
                  updatedAt: now,
                  isDraft: true,
                };
                setActiveConversationIdState(draftNext.id);
                return draftNext;
              });
            });
            return null;
          }
          return next[0].id;
        });
        return next;
      });
    },
    [dbRef],
  );

  const touchLocal = React.useCallback((id: string, updatedAt: number) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const updated = { ...prev[idx], updatedAt };
      const next = [...prev];
      next.splice(idx, 1);
      next.unshift(updated);
      return next;
    });
  }, []);

  const activeConversation = React.useMemo<ActiveConversation>(() => {
    if (!activeConversationId) return null;
    if (draft && draft.id === activeConversationId) return draft;
    const found = conversations.find((c) => c.id === activeConversationId);
    if (!found) return null;
    return { ...found, isDraft: false };
  }, [activeConversationId, draft, conversations]);

  const isFilterableActive = Boolean(
    activeConversation && activeConversation.isDraft === false,
  );

  return {
    conversations,
    draft,
    activeConversationId,
    activeConversation,
    isFilterableActive,
    setActiveConversationId,
    ensureDraft,
    newConversation,
    persistDraft,
    rename,
    remove,
    touchLocal,
  };
}
