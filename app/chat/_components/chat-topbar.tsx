"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Settings, Sparkles, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProviderSettings } from "@/lib/chat/types"

import { SettingsDialog } from "./settings-dialog"

type ChatTopbarProps = {
  settings: ProviderSettings
  onUpdateField: (key: keyof ProviderSettings, value: string) => void
  onClearSettings: () => void
  onClearChat: () => void
  hasMessages: boolean
  onOpenSidebar: () => void
}

export function ChatTopbar({
  settings,
  onUpdateField,
  onClearSettings,
  onClearChat,
  hasMessages,
  onOpenSidebar,
}: ChatTopbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline-soft bg-background/85 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Open history"
          onClick={onOpenSidebar}
          className="h-8 w-8 px-0 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-tint-lavender text-brand-purple-800">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span>
            AI Image Workspace<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {hasMessages ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            aria-label="Clear chat"
            className="text-[13px] text-steel"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        ) : null}
        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          settings={settings}
          onUpdateField={onUpdateField}
          onClear={onClearSettings}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Open provider settings"
            >
              <Settings />
              Settings
            </Button>
          }
        />
      </div>
    </header>
  )
}
