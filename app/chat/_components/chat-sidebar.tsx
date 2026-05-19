"use client"

import * as React from "react"
import Link from "next/link"
import { ImageIcon, Settings } from "lucide-react";

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
          className="inline-flex items-center gap-2 px-2 py-1 font-serif text-2xl font-semibold italic tracking-tight text-ink"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink shadow-subtle">
            <svg
              viewBox="0 0 180 180"
              className="h-full w-full"
              aria-hidden="true"
            >
              {/* ===== 方案 A（默认）：实心 M + 对角渐变光线 ===== */}
              {/* <defs>
                <linearGradient
                  id="imgen-mark-stroke"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M38 136 L38 52 L56 52 L90 100 L124 52 L142 52 L142 136 L124 136 L124 80 L96 124 L84 124 L56 80 L56 136 Z"
                fill="#FFFFFF"
              />
              <path
                d="M16 60 L164 126"
                stroke="url(#imgen-mark-stroke)"
                strokeWidth="10"
                strokeLinecap="round"
              /> */}

              {/* ===== 方案 B：M 内部从顶亮渐变到底淡 ===== */}
              <defs>
                <linearGradient
                  id="imgen-mark-fade"
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M38 136 L38 52 L56 52 L90 100 L124 52 L142 52 L142 136 L124 136 L124 80 L96 124 L84 124 L56 80 L56 136 Z"
                fill="url(#imgen-mark-fade)"
              />
              {/* ===== 方案 B 结束 ===== */}
            </svg>
          </span>
          <span>
            Imgen<span className="not-italic text-primary">.</span>
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
