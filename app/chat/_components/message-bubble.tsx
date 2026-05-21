"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Expand,
  Pencil,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  cn,
  estimateBase64Bytes,
  formatBytes,
  formatDuration,
  formatTimestamp,
  imageExtension,
} from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

import { AssistantAvatar, UserAvatar } from "./message-avatar";

type PendingTurn = {
  turnId: string;
  prompt: string;
  model: string;
  size: string;
  quality: string;
};

type UserBubbleProps = {
  message: ChatMessage;
  avatarId?: string | null;
  onEdit: (prompt: string) => void;
  onDeleteTurn: (turnId: string) => void;
  selected: boolean;
  selectionMode: boolean;
  onToggleSelection: (turnId: string) => void;
};

function formatMetaLine(message: ChatMessage): string {
  const parts: string[] = [];
  if (message.model) parts.push(message.model);
  if (message.size && message.size !== "auto") parts.push(message.size);
  if (message.quality && message.quality !== "auto")
    parts.push(message.quality);
  return parts.join(" · ");
}

function formatStatsLine(message: ChatMessage): string {
  const parts: string[] = [formatTimestamp(message.createdAt)];
  if (message.imageData) {
    parts.push(formatBytes(estimateBase64Bytes(message.imageData)));
  }
  if (typeof message.durationMs === "number" && message.durationMs > 0) {
    parts.push(`Elapsed ${formatDuration(message.durationMs)}`);
  }
  return parts.join(" · ");
}

function MessageActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md border border-hairline-soft bg-card/95 text-steel shadow-subtle",
        "opacity-0 transition-all duration-150 ease-out hover:bg-secondary hover:text-ink focus:opacity-100 focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
        "group-focus-within:opacity-100 group-hover:opacity-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function UserBubble({
  message,
  avatarId,
  onEdit,
  onDeleteTurn,
  selected,
  selectionMode,
  onToggleSelection,
}: UserBubbleProps) {
  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void navigator.clipboard?.writeText(message.content);
  };

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit(message.content);
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDeleteTurn(message.turnId);
  };

  const handleToggleSelection = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    onToggleSelection(message.turnId);
  };

  return (
    <div className="group flex justify-end gap-2" data-turn-id={message.turnId}>
      <div className="flex items-center gap-1 self-start pt-1">
        <MessageActionButton
          label={selected ? "Deselect message" : "Select message"}
          onClick={handleToggleSelection}
          className={cn(
            selectionMode && "opacity-100",
            selected &&
              "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          {selected ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <span className="h-3.5 w-3.5 rounded-xs border border-current" />
          )}
        </MessageActionButton>
        <MessageActionButton label="Copy message" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
        </MessageActionButton>
        <MessageActionButton label="Edit message" onClick={handleEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </MessageActionButton>
        <MessageActionButton
          label="Delete message"
          onClick={handleDelete}
          className="hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </MessageActionButton>
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-lg bg-tint-lavender px-3.5 py-2.5 text-[14px] leading-relaxed text-brand-purple-800",
          selected &&
            "ring-2 ring-primary/35 ring-offset-2 ring-offset-background",
        )}
      >
        <p className="wrap-break-word whitespace-pre-wrap">{message.content}</p>
      </div>
      <UserAvatar avatarId={avatarId} className="self-start" />
    </div>
  );
}

export function AssistantBubble({ message }: { message: ChatMessage }) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  if (message.error) {
    return (
      <div className="flex justify-start gap-2">
        <AssistantAvatar className="self-start" />
        <div className="max-w-[75%]">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle />
            <AlertTitle>Generation failed</AlertTitle>
            <AlertDescription className="wrap-break-word">
              {message.error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const metaLine = formatMetaLine(message);
  const statsLine = formatStatsLine(message);
  const imageAlt = message.revisedPrompt ?? "Generated image";

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!message.imageData) return;

    const link = document.createElement("a");
    link.href = message.imageData;
    link.download = `imgen-${message.id}.${imageExtension(message.imageData)}`;
    link.click();
  };

  return (
    <div className="flex justify-start gap-2">
      <AssistantAvatar className="self-start" />
      <div className="max-w-[75%] rounded-lg border border-border bg-card p-3">
        {message.imageData ? (
          <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <div className="group relative overflow-hidden rounded-md bg-surface-soft">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="block w-full cursor-zoom-in focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
                aria-label="Open generated image preview"
              >
                <Image
                  src={message.imageData}
                  alt={imageAlt}
                  width={1024}
                  height={1024}
                  unoptimized
                  className="h-auto w-full"
                />
              </button>
              <div className="absolute top-2 right-2 flex gap-1">
                <MessageActionButton
                  label="Download image"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                </MessageActionButton>
                <MessageActionButton
                  label="Open generated image preview"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPreviewOpen(true);
                  }}
                >
                  <Expand className="h-3.5 w-3.5" />
                </MessageActionButton>
              </div>
            </div>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-modal transition-[opacity,transform] duration-200 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                <Dialog.Title className="sr-only">
                  Generated image preview
                </Dialog.Title>
                <Image
                  src={message.imageData}
                  alt={imageAlt}
                  width={1536}
                  height={1536}
                  unoptimized
                  className="max-h-[86vh] w-full rounded-lg object-contain"
                />
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        ) : null}
        {message.revisedPrompt ? (
          <p className="mt-2.5 text-[12px] leading-relaxed text-steel">
            <span className="font-medium text-charcoal">Revised prompt: </span>
            {message.revisedPrompt}
          </p>
        ) : null}
        {metaLine ? (
          <p className="mt-2 text-[11px] tracking-tight text-stone">
            {metaLine}
          </p>
        ) : null}
        {statsLine ? (
          <p className="mt-1 text-[11px] tabular-nums tracking-tight text-stone">
            {statsLine}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PendingBubble({ turn }: { turn: PendingTurn }) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex justify-start gap-2">
      <AssistantAvatar className="self-start" />
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5",
        )}
      >
        <Spinner className="h-3.5 w-3.5 text-stone" />
        <span className="text-[12px] text-steel">Generating image</span>
        <span className="text-[12px] text-stone tabular-nums">{elapsed}s</span>
      </div>
    </div>
  );
}

export type { PendingTurn };
