"use client"

import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { samplePrompts } from "@/lib/chat/constants"

type SamplePromptsProps = {
  onPick: (prompt: string) => void
}

export function SamplePrompts({ onPick }: SamplePromptsProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-stone">
        <Sparkles className="h-3.5 w-3.5" />
        Try a sample prompt
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {samplePrompts.slice(0, 6).map((prompt) => (
          <Button
            key={prompt}
            type="button"
            variant="outline"
            onClick={() => onPick(prompt)}
            className={cn(
              "h-auto min-h-0 items-start justify-start whitespace-normal px-3.5 py-3 text-left text-[13px] leading-relaxed text-charcoal",
              "border-hairline-soft bg-surface-soft",
            )}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
