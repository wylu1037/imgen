"use client"

import * as React from "react"
import Image from "next/image"
import { AlertCircle, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/chat/types"

type PendingTurn = {
  turnId: string
  prompt: string
  model: string
  size: string
  quality: string
}

function formatMetaLine(message: ChatMessage): string {
  const parts: string[] = []
  if (message.model) parts.push(message.model)
  if (message.size && message.size !== "auto") parts.push(message.size)
  if (message.quality && message.quality !== "auto") parts.push(message.quality)
  return parts.join(" · ")
}

export function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end" data-turn-id={message.turnId}>
      <div className="max-w-[80%] rounded-lg bg-tint-lavender px-3.5 py-2.5 text-[14px] leading-relaxed text-brand-purple-800">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  )
}

export function AssistantBubble({ message }: { message: ChatMessage }) {
  if (message.error) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%]">
          <Alert variant="destructive" className="border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <AlertTitle>Generation failed</AlertTitle>
                <AlertDescription className="break-words">
                  {message.error}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  const metaLine = formatMetaLine(message)

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg border border-border bg-card p-3">
        {message.imageData ? (
          <div className="overflow-hidden rounded-md bg-surface-soft">
            <Image
              src={message.imageData}
              alt={message.revisedPrompt ?? "Generated image"}
              width={1024}
              height={1024}
              unoptimized
              className="h-auto w-full"
            />
          </div>
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
      </div>
    </div>
  )
}

export function PendingBubble({ turn }: { turn: PendingTurn }) {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5",
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-stone" />
        <span className="text-[12px] text-steel">Generating image</span>
        <span className="flex items-center gap-1">
          {[0, 180, 360].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-stone animate-pulse-soft"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

export type { PendingTurn }
