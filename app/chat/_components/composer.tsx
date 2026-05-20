"use client";

import * as React from "react";
import { ArrowUp, Dices } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  pickRandomPrompt,
  qualityOptions,
  sizeOptions,
  type OptionItem,
} from "@/lib/chat/constants";

import { ParamChip } from "./param-chip";
import { useAutosizeTextarea } from "../_hooks/use-autosize-textarea";

type ComposerProps = {
  draft: string;
  onDraftChange: (next: string) => void;
  model: string;
  modelOptions: OptionItem[];
  onModelChange: (next: string) => void;
  size: string;
  onSizeChange: (next: string) => void;
  quality: string;
  onQualityChange: (next: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  isReady: boolean;
};

export function Composer({
  draft,
  onDraftChange,
  model,
  modelOptions,
  onModelChange,
  size,
  onSizeChange,
  quality,
  onQualityChange,
  onSubmit,
  isGenerating,
  isReady,
}: ComposerProps) {
  const textareaRef = useAutosizeTextarea(draft);
  const canSubmit = !isGenerating && draft.trim().length > 0 && isReady;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <InputGroup
      className={cn(
        "rounded-2xl border-hairline-strong bg-card shadow-subtle",
        "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15",
        "transition-all duration-150 ease-out",
      )}
    >
      <InputGroupAddon align="block-start" className="gap-2 pt-3">
        <ParamChip
          ariaLabel="Model"
          value={model}
          onValueChange={onModelChange}
          options={modelOptions}
          disabled={isGenerating}
        />
        <ParamChip
          ariaLabel="Size"
          value={size}
          onValueChange={onSizeChange}
          options={sizeOptions}
          disabled={isGenerating}
        />
        <ParamChip
          ariaLabel="Quality"
          value={quality}
          onValueChange={onQualityChange}
          options={qualityOptions}
          disabled={isGenerating}
        />
      </InputGroupAddon>

      <InputGroupTextarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the image you want to generate…"
        rows={1}
        disabled={isGenerating}
        className={cn(
          "max-h-48 min-h-11 px-4 py-3 text-[13px] leading-relaxed",
          "font-serif tracking-[0.005em]",
          "placeholder:font-serif placeholder:text-stone/90 placeholder:italic",
        )}
      />

      <InputGroupAddon align="block-end" className="justify-between pb-3">
        <InputGroupButton
          size="icon-sm"
          variant="ghost"
          onClick={() => onDraftChange(pickRandomPrompt(draft))}
          disabled={isGenerating}
          aria-label="Surprise me with a sample prompt"
          className="text-steel"
        >
          <Dices />
        </InputGroupButton>
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Generate image"
          className="h-9 w-9 rounded-full"
        >
          {isGenerating ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
