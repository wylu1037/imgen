"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/chat/types";

type MessageTagsProps = {
  tags: Tag[];
  onAddTag: (name: string) => Promise<void> | void;
  onRemoveTag: (tagId: string) => Promise<void> | void;
};

const MAX_TAG_LENGTH = 32;

export function MessageTags({ tags, onAddTag, onRemoveTag }: MessageTagsProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleStartAdding = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setDraft("");
  };

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      handleCancel();
      return;
    }
    if (trimmed.length > MAX_TAG_LENGTH) {
      setDraft(trimmed.slice(0, MAX_TAG_LENGTH));
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTag(trimmed);
      setDraft("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          onRemove={() => onRemoveTag(tag.id)}
        />
      ))}

      {isAdding ? (
        <span className="inline-flex h-6 items-center gap-1 rounded-md border border-hairline-strong bg-card pr-1 pl-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              if (!isSubmitting) void handleSubmit();
            }}
            onKeyDown={handleKeyDown}
            placeholder="&nbsp;&nbsp;Add tag name"
            maxLength={MAX_TAG_LENGTH}
            disabled={isSubmitting}
            className="w-24 bg-transparent font-serif text-xs leading-none text-ink italic outline-none placeholder:font-serif placeholder:text-stone placeholder:italic"
          />
        </span>
      ) : (
        <button
          type="button"
          onClick={handleStartAdding}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-hairline-strong text-stone",
            "transition-colors duration-150 ease-out hover:border-primary/40 hover:text-primary",
            "focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
          )}
          aria-label="Add tag"
          title="Add tag"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function TagChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void onRemove();
  };

  return (
    <span className="group inline-flex h-6 items-center gap-1 rounded-md border border-hairline-soft bg-tint-cream pr-1 pl-2 font-serif text-xs leading-none text-charcoal italic">
      <span className="max-w-35 truncate">{name}</span>
      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-sm text-stone",
          "transition-colors duration-150 ease-out hover:bg-destructive/10 hover:text-destructive",
          "focus:opacity-100 focus:outline-none",
        )}
        aria-label={`Remove tag ${name}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
