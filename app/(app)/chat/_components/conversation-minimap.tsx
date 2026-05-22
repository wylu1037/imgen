"use client";

import * as React from "react";

import { summarizeTurn } from "@/lib/chat/grouping";
import type { ChatMessage } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type LineBucket = "short" | "medium" | "long";

const LINE_WIDTH: Record<LineBucket, string> = {
  short: "w-3",
  medium: "w-4",
  long: "w-5",
};

function bucketize(content: string): LineBucket {
  const len = content.trim().length;
  if (len < 24) return "short";
  if (len < 80) return "medium";
  return "long";
}

type ConversationMiniMapProps = {
  turns: ChatMessage[];
  selectedTurnId: string | null;
  onSelect: (turnId: string) => void;
  hidden?: boolean;
};

export const ConversationMiniMap = React.memo(function ConversationMiniMap({
  turns,
  selectedTurnId,
  onSelect,
  hidden = false,
}: ConversationMiniMapProps) {
  return (
    <ul
      className={cn(
        "flex flex-col items-end gap-1 transition-opacity duration-150",
        hidden
          ? "pointer-events-none opacity-0"
          : "pointer-events-auto opacity-100",
      )}
      aria-hidden={hidden}
    >
      {turns.map((turn) => {
        const isActive = selectedTurnId === turn.turnId;
        const bucket = bucketize(turn.content);
        return (
          <li key={turn.id}>
            <button
              type="button"
              onClick={() => onSelect(turn.turnId)}
              aria-label={summarizeTurn(turn, 40)}
              className="group flex cursor-pointer items-center justify-end py-1.5"
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-200 ease-out",
                  isActive
                    ? "h-0.75 w-16 bg-brand-purple-800"
                    : cn(
                        "h-0.75 bg-stone/40 group-hover:bg-stone/70",
                        LINE_WIDTH[bucket],
                      ),
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
});
