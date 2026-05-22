"use client";

import * as React from "react";

import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import type { ChatMessage } from "@/lib/chat/types";

import {
  AssistantBubble,
  PendingBubble,
  UserBubble,
  type PendingTurn,
} from "./message-bubble";
import { ChatEmptyState } from "./empty-state";

type MessageListProps = {
  messages: ChatMessage[];
  pendingTurn: PendingTurn | null;
  isEmpty: boolean;
  onPickSample: (prompt: string) => void;
  onEditPrompt: (prompt: string) => void;
  onDeleteTurn: (turnId: string) => void;
  onAddTag: (messageId: string, tagName: string) => Promise<void> | void;
  onRemoveTag: (messageId: string, tagId: string) => Promise<void> | void;
  selectedTurnIds: Set<string>;
  onToggleTurnSelection: (turnId: string) => void;
  onClearSelection: () => void;
  onDeleteSelectedTurns: () => void;
  scrollTargetTurnId: string | null;
  onScrollHandled: () => void;
};

export function MessageList({
  messages,
  pendingTurn,
  isEmpty,
  onPickSample,
  onEditPrompt,
  onDeleteTurn,
  onAddTag,
  onRemoveTag,
  selectedTurnIds,
  onToggleTurnSelection,
  onClearSelection,
  onDeleteSelectedTurns,
  scrollTargetTurnId,
  onScrollHandled,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const { avatarId } = useUserAvatar();
  const selectedCount = selectedTurnIds.size;
  const selectionMode = selectedCount > 0;

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pendingTurn?.turnId]);

  React.useEffect(() => {
    if (!scrollTargetTurnId) return;
    const container = scrollRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(
      `[data-turn-id="${CSS.escape(scrollTargetTurnId)}"]`,
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onScrollHandled();
  }, [scrollTargetTurnId, onScrollHandled]);

  if (isEmpty) {
    return <ChatEmptyState onPickSample={onPickSample} />;
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserBubble
              key={message.id}
              message={message}
              avatarId={avatarId}
              onEdit={onEditPrompt}
              onDeleteTurn={onDeleteTurn}
              selected={selectedTurnIds.has(message.turnId)}
              selectionMode={selectionMode}
              onToggleSelection={onToggleTurnSelection}
            />
          ) : (
            <AssistantBubble
              key={message.id}
              message={message}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          ),
        )}
        {pendingTurn ? <PendingBubble turn={pendingTurn} /> : null}
        <div ref={bottomRef} className="h-px shrink-0" />
      </div>
      {selectionMode ? (
        <div className="pointer-events-none sticky bottom-4 z-10 mt-4 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-border bg-card/95 px-3 py-2 shadow-modal backdrop-blur-sm">
            <span className="px-1 text-xs font-medium text-ink">
              {selectedCount} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 rounded-md text-xs! text-steel"
            >
              <X className="size-3" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteSelectedTurns}
              className="h-8 rounded-md text-xs!"
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
