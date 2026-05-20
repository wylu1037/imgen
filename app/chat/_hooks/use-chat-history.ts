"use client";

import * as React from "react";

import { openChatDb, type ChatDb } from "@/lib/chat/db-client";
import type { ChatMessage, DbStatus, NewChatMessage } from "@/lib/chat/types";

type UseChatHistory = {
  status: DbStatus;
  persistent: boolean;
  messages: ChatMessage[];
  append: (msg: NewChatMessage) => Promise<ChatMessage>;
  deleteTurn: (turnId: string) => Promise<void>;
  clearAll: () => Promise<void>;
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

  return { status, persistent, messages, append, deleteTurn, clearAll };
}
