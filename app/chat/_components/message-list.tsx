"use client"

import * as React from "react"

import type { ChatMessage } from "@/lib/chat/types"

import {
  AssistantBubble,
  PendingBubble,
  UserBubble,
  type PendingTurn,
} from "./message-bubble"
import { SamplePrompts } from "./sample-prompts"

type MessageListProps = {
  messages: ChatMessage[]
  pendingTurn: PendingTurn | null
  isEmpty: boolean
  onPickSample: (prompt: string) => void
  scrollTargetTurnId: string | null
  onScrollHandled: () => void
}

export function MessageList({
  messages,
  pendingTurn,
  isEmpty,
  onPickSample,
  scrollTargetTurnId,
  onScrollHandled,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const bottomRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, pendingTurn?.turnId])

  React.useEffect(() => {
    if (!scrollTargetTurnId) return
    const container = scrollRef.current
    if (!container) return
    const el = container.querySelector<HTMLElement>(
      `[data-turn-id="${CSS.escape(scrollTargetTurnId)}"]`,
    )
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    onScrollHandled()
  }, [scrollTargetTurnId, onScrollHandled])

  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-[28px] font-semibold tracking-tight text-ink">
              What would you like to generate?
            </h1>
            <p className="mt-2 text-[14px] text-steel">
              Describe a scene, mood, or subject. Each prompt generates an
              independent image.
            </p>
          </div>
          <SamplePrompts onPick={onPickSample} />
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserBubble key={message.id} message={message} />
          ) : (
            <AssistantBubble key={message.id} message={message} />
          ),
        )}
        {pendingTurn ? <PendingBubble turn={pendingTurn} /> : null}
        <div ref={bottomRef} className="h-px shrink-0" />
      </div>
    </div>
  )
}
