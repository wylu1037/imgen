"use client";

import * as React from "react";

import { openChatDb, type ChatDb, type StorageInfo } from "@/lib/chat/db-client";
import type {
  ChatMessage,
  DbStatus,
  NewChatMessage,
  Tag,
} from "@/lib/chat/types";

type UseChatHistory = {
  status: DbStatus;
  persistent: boolean;
  messages: ChatMessage[];
  append: (msg: NewChatMessage) => Promise<ChatMessage>;
  deleteTurn: (turnId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addTag: (messageId: string, tagName: string) => Promise<Tag | null>;
  removeTag: (messageId: string, tagId: string) => Promise<void>;
  getStorageInfo: () => Promise<StorageInfo | null>;
};

export function useChatHistory(): UseChatHistory {
  const [status, setStatus] = React.useState<DbStatus>("loading");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [persistent, setPersistent] = React.useState(false);
  const dbRef = React.useRef<ChatDb | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    openChatDb()
      .then(async (db) => {
        if (cancelled) {
          await db.close().catch(() => {});
          return;
        }
        dbRef.current = db;
        setPersistent(db.persistent);
        const loaded = await db.loadAll();
        if (cancelled) return;
        setMessages(loaded);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("[useChatHistory] failed to open chat db", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      const db = dbRef.current;
      dbRef.current = null;
      db?.close().catch(() => {});
    };
  }, []);

  const append = React.useCallback(async (msg: NewChatMessage) => {
    const db = dbRef.current;
    if (!db) throw new Error("Chat database is not ready");
    const inserted = await db.insert(msg);
    setMessages((current) => [...current, inserted]);
    return inserted;
  }, []);

  const deleteTurn = React.useCallback(async (turnId: string) => {
    const db = dbRef.current;
    if (!db) return;
    await db.deleteTurn(turnId);
    setMessages((current) => current.filter((m) => m.turnId !== turnId));
  }, []);

  const clearAll = React.useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    await db.clearAll();
    setMessages([]);
  }, []);

  const addTag = React.useCallback(
    async (messageId: string, tagName: string) => {
      const db = dbRef.current;
      if (!db) return null;
      const trimmed = tagName.trim();
      if (!trimmed) return null;

      const tag = await db.addTagToMessage(messageId, trimmed);
      setMessages((current) =>
        current.map((m) => {
          if (m.id !== messageId) return m;
          if (m.tags.some((t) => t.id === tag.id)) return m;
          const nextTags = [...m.tags, tag].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
          );
          return { ...m, tags: nextTags };
        }),
      );
      return tag;
    },
    [],
  );

  const removeTag = React.useCallback(
    async (messageId: string, tagId: string) => {
      const db = dbRef.current;
      if (!db) return;
      await db.removeTagFromMessage(messageId, tagId);
      setMessages((current) =>
        current.map((m) =>
          m.id === messageId
            ? { ...m, tags: m.tags.filter((t) => t.id !== tagId) }
            : m,
        ),
      );
    },
    [],
  );

  const getStorageInfo = React.useCallback(async () => {
    const db = dbRef.current;
    if (!db) return null;
    return db.getStorageInfo();
  }, []);

  return {
    status,
    persistent,
    messages,
    append,
    deleteTurn,
    clearAll,
    addTag,
    removeTag,
    getStorageInfo,
  };
}
