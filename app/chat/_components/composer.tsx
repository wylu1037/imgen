"use client"

import * as React from "react"
import { ArrowUp, Dices, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  modelOptions,
  pickRandomPrompt,
  qualityOptions,
  sizeOptions,
} from "@/lib/chat/constants"

import { ParamChip } from "./param-chip"
import { useAutosizeTextarea } from "../_hooks/use-autosize-textarea"

type ComposerProps = {
  draft: string
  onDraftChange: (next: string) => void
  model: string
  onModelChange: (next: string) => void
  size: string
  onSizeChange: (next: string) => void
  quality: string
  onQualityChange: (next: string) => void
  onSubmit: () => void
  isGenerating: boolean
  isReady: boolean
}

export function Composer({
  draft,
  onDraftChange,
  model,
  onModelChange,
  size,
  onSizeChange,
  quality,
  onQualityChange,
  onSubmit,
  isGenerating,
  isReady,
}: ComposerProps) {
  const textareaRef = useAutosizeTextarea(draft)
  const canSubmit = !isGenerating && draft.trim().length > 0 && isReady

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return
    if (event.shiftKey) return
    event.preventDefault()
    if (canSubmit) onSubmit()
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline-strong bg-card",
        "shadow-subtle",
        "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15",
        "transition-all duration-150 ease-out",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
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
      </div>

      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the image you want to generate…"
        rows={1}
        className={cn(
          "min-h-11 max-h-48 resize-none border-0 bg-transparent shadow-none",
          "focus-visible:ring-0 focus-visible:border-0",
          "px-4 py-3 text-[13px] md:text-[13px] leading-relaxed",
          "font-serif tracking-[0.005em]",
          "placeholder:italic placeholder:font-serif placeholder:text-stone/90",
        )}
        disabled={isGenerating}
      />

      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDraftChange(pickRandomPrompt(draft))}
          disabled={isGenerating}
          aria-label="Surprise me with a sample prompt"
          className="text-[12px] text-steel"
        >
          <Dices className="size-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Generate image"
          className="h-9 w-9 rounded-full"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
