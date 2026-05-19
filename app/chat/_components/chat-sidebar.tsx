"use client"

import * as React from "react"
import { ImageIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { groupUserTurnsByTime, summarizeTurn } from "@/lib/chat/grouping"
import type { ChatMessage } from "@/lib/chat/types"

type ChatSidebarProps = {
  messages: ChatMessage[]
  selectedTurnId: string | null
  onSelectTurn: (turnId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({
  messages,
  selectedTurnId,
  onSelectTurn,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const groups = React.useMemo(
    () => groupUserTurnsByTime(messages),
    [messages],
  )
  const hasHistory = groups.length > 0

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b border-hairline-soft px-4">
        <span className="text-[12px] uppercase tracking-[0.16em] text-stone">
          History
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close sidebar"
          className="h-7 w-7 px-0 md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {hasHistory ? (
        <nav
          aria-label="Chat history"
          className="flex-1 overflow-y-auto px-2 py-3"
        >
          {groups.map((group) => (
            <section key={group.key} className="mb-4 last:mb-0">
              <h2 className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-stone">
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.turns.map((turn) => (
                  <li key={turn.id}>
                    <button
                      type="button"
                      onClick={() => onSelectTurn(turn.turnId)}
                      className={cn(
                        "w-full rounded-md px-2 py-2 text-left text-[13px] leading-snug text-charcoal",
                        "transition-colors duration-150 ease-out",
                        "focus:outline-none focus:ring-[3px] focus:ring-primary/15",
                        selectedTurnId === turn.turnId
                          ? "bg-tint-lavender text-brand-purple-800"
                          : "hover:bg-secondary",
                      )}
                    >
                      <span className="line-clamp-2 break-words">
                        {summarizeTurn(turn)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-tint-cream text-stone">
            <ImageIcon className="h-4 w-4" />
          </span>
          <p className="text-[13px] text-steel">
            Your generated images will appear here, grouped by date.
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 border-r border-hairline-soft bg-surface-soft md:flex md:flex-col">
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 ease-out md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-hairline-soft bg-surface-soft shadow-modal transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Chat history"
        aria-hidden={!isOpen}
      >
        {content}
      </aside>
    </>
  )
}
