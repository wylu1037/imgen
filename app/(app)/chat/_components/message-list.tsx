"use client";

import * as React from "react";

import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import type { ChatMessage } from "@/lib/chat/types";

import {
  AssistantBubble,
  PendingBubble,
  UserBubble,
  type PendingTurn,
} from "./message-bubble";
import { ChatEmptyState } from "./empty-state";

type PendingDelete =
  | { type: "single"; turnId: string }
  | { type: "selected"; count: number }
  | null;

type MessageListProps = {
  messages: ChatMessage[];
  pendingTurn: PendingTurn | null;
  isEmpty: boolean;
  isGenerating: boolean;
  onPickSample: (prompt: string) => void;
  onEditPrompt: (prompt: string) => void;
  onRetryTurn: (message: ChatMessage) => void;
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
  isGenerating,
  onPickSample,
  onEditPrompt,
  onRetryTurn,
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
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete>(null);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "single") {
      onDeleteTurn(pendingDelete.turnId);
    } else {
      onDeleteSelectedTurns();
    }
    setPendingDelete(null);
  };

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
              onRetry={onRetryTurn}
              onDeleteTurn={(turnId) =>
                setPendingDelete({ type: "single", turnId })
              }
              retryDisabled={isGenerating}
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
              onClick={() =>
                setPendingDelete({ type: "selected", count: selectedCount })
              }
              className="h-8 rounded-md text-xs!"
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[12px] font-semibold text-ink">
              {pendingDelete?.type === "selected"
                ? `Delete ${pendingDelete.count} messages?`
                : "Delete message?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-0.5 text-[11px] leading-4 text-steel">
              {pendingDelete?.type === "selected"
                ? "This will permanently remove the selected message turns. This cannot be undone."
                : "This will permanently remove this message turn. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" className="h-7 text-[12px]!">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleConfirmDelete}
              className="h-7 bg-destructive text-[12px]! text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
