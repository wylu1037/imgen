"use client"

import * as React from "react"
import Link from "next/link"
import { ImageIcon, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { groupUserTurnsByTime, summarizeTurn } from "@/lib/chat/grouping"
import type { ChatMessage, ProviderConfig } from "@/lib/chat/types"

import { SettingsDialog } from "./settings-dialog"

type ChatSidebarProps = {
  messages: ChatMessage[]
  selectedTurnId: string | null
  onSelectTurn: (turnId: string) => void
  providers: ProviderConfig[]
  activeProviderId: string | null
  onSelectProvider: (providerId: string) => void
  onCreateProvider: () => ProviderConfig
  onSaveProvider: (provider: ProviderConfig) => void
  onDeleteProvider: (providerId: string) => void
  onClearChat: () => void
  hasMessages: boolean
}

export function ChatSidebar({
  messages,
  selectedTurnId,
  onSelectTurn,
  providers,
  activeProviderId,
  onSelectProvider,
  onCreateProvider,
  onSaveProvider,
  onDeleteProvider,
  onClearChat,
  hasMessages,
}: ChatSidebarProps) {
  const groups = React.useMemo(
    () => groupUserTurnsByTime(messages),
    [messages],
  )
  const hasHistory = groups.length > 0
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const { isMobile, setOpenMobile } = useSidebar()

  const handleSelectTurn = (turnId: string) => {
    onSelectTurn(turnId)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-hairline-soft">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-2 py-1 text-[14px] font-semibold text-ink"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink text-[11px] font-semibold tracking-[-0.04em] text-background shadow-subtle">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.42),transparent_34%)]" />
            <span className="relative">IM</span>
          </span>
          <span>
            Imgen<span className="text-primary">.</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {hasHistory ? (
          groups.map((group) => (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel className="text-[11px] font-medium tracking-[0.12em] text-stone">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.turns.map((turn) => (
                    <SidebarMenuItem key={turn.id}>
                      <SidebarMenuButton
                        onClick={() => handleSelectTurn(turn.turnId)}
                        isActive={selectedTurnId === turn.turnId}
                        className={cn(
                          "h-auto items-start py-2 text-[13px] leading-snug text-charcoal",
                          "data-[active=true]:bg-tint-lavender data-[active=true]:text-brand-purple-800",
                        )}
                      >
                        <span className="line-clamp-2 wrap-break-word whitespace-normal">
                          {summarizeTurn(turn)}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
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
      </SidebarContent>

      <SidebarFooter className="gap-1 border-hairline-soft">
        {hasMessages ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            aria-label="Clear chat"
            className="w-full justify-start text-[13px] text-steel"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        ) : null}
        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          providers={providers}
          activeProviderId={activeProviderId}
          onSelectProvider={onSelectProvider}
          onCreateProvider={onCreateProvider}
          onSaveProvider={onSaveProvider}
          onDeleteProvider={onDeleteProvider}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Open provider settings"
              className="w-full justify-start text-[13px] text-charcoal"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Button>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
