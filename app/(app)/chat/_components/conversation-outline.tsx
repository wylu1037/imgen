"use client";

import * as React from "react";

import { summarizeTurn } from "@/lib/chat/grouping";
import { cn } from "@/lib/utils";

import { useAppData } from "../../_context/app-data-context";

import { ConversationMiniMap } from "./conversation-minimap";

export function ConversationOutline() {
  const { chatHistory, conversations, getSelectedTurn, setSelectedTurn } =
    useAppData();
  const { messages } = chatHistory;
  const { activeConversationId } = conversations;
  const [isHovered, setIsHovered] = React.useState(false);

  const turns = React.useMemo(() => {
    if (!activeConversationId) return [];
    return messages.filter(
      (m) => m.conversationId === activeConversationId && m.role === "user",
    );
  }, [messages, activeConversationId]);

  const selectedTurnId = activeConversationId
    ? getSelectedTurn(activeConversationId)
    : null;

  if (turns.length === 0) return null;

  const handleSelect = (turnId: string) => {
    if (!activeConversationId) return;
    setSelectedTurn(activeConversationId, turnId);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "pointer-events-auto absolute top-1/2 right-0 z-20 hidden -translate-y-1/2",
        "py-4 pr-2 pl-6 md:block",
      )}
      aria-label="Conversation outline"
    >
      <div className="relative">
        <ConversationMiniMap
          turns={turns}
          selectedTurnId={selectedTurnId}
          onSelect={handleSelect}
          hidden={isHovered}
        />

        <div
          className={cn(
            "absolute top-1/2 right-0 w-72 -translate-y-1/2 transition-all duration-200 ease-out",
            "rounded-xl border border-hairline-soft bg-background/95 p-3 shadow-modal backdrop-blur-md",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_16px_48px_-8px_rgba(15,15,15,0.16)]",
            isHovered
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-1 opacity-0",
          )}
          aria-hidden={!isHovered}
        >
          <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
            {turns.map((turn) => {
              const isActive = selectedTurnId === turn.turnId;
              return (
                <li key={turn.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(turn.turnId)}
                    className={cn(
                      "block w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-[12px]! leading-snug text-charcoal/85 transition-colors",
                      "hover:bg-tint-cream hover:text-charcoal",
                      isActive &&
                        "bg-tint-lavender text-brand-purple-800 hover:bg-tint-lavender hover:text-brand-purple-800",
                    )}
                  >
                    <span className="block truncate">
                      {summarizeTurn(turn)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
