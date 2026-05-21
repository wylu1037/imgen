"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, Images, MessagesSquare, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { ImgenMark } from "@/app/_components/imgen-mark";
import { cn } from "@/lib/utils";
import { groupUserTurnsByTime, summarizeTurn } from "@/lib/chat/grouping";

import { useWorkspaceData } from "../_context/workspace-data-context";

import { SettingsDialog } from "./settings-dialog";

export function WorkspaceSidebar() {
  const { chatHistory, providerSettings, selectedTurnId, setSelectedTurnId } =
    useWorkspaceData();
  const { messages } = chatHistory;
  const {
    providers,
    activeProviderId,
    setActiveProviderId,
    createProvider,
    saveProvider,
    deleteProvider,
  } = providerSettings;

  const groups = React.useMemo(
    () => groupUserTurnsByTime(messages),
    [messages],
  );
  const hasHistory = groups.length > 0;
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleSelectTurn = (turnId: string) => {
    setSelectedTurnId(turnId);
    if (isMobile) setOpenMobile(false);
  };

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navItems = [
    {
      href: "/chat",
      label: "Chat",
      icon: MessagesSquare,
      match: (path: string) => path === "/chat" || path.startsWith("/chat/"),
    },
    {
      href: "/gallery",
      label: "Gallery",
      icon: Images,
      match: (path: string) =>
        path === "/gallery" || path.startsWith("/gallery/"),
    },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-hairline-soft">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-2 py-1 font-serif text-2xl font-semibold tracking-tight text-ink italic"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink shadow-subtle">
            <ImgenMark />
          </span>
          <span>
            Imgen<span className="text-primary not-italic">.</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(pathname ?? "");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      onClick={handleNavigate}
                      isActive={isActive}
                      className={cn(
                        "text-[13px] text-charcoal",
                        "data-[active=true]:bg-tint-lavender data-[active=true]:text-brand-purple-800",
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                          "h-auto items-start py-2 text-[12px] leading-snug text-charcoal",
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
            <p className="text-[11px] leading-4 text-steel">
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
          onSelectProvider={setActiveProviderId}
          onCreateProvider={createProvider}
          onSaveProvider={saveProvider}
          onDeleteProvider={deleteProvider}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Open provider settings"
              className="w-full justify-center text-[12px] text-charcoal"
            >
              <Settings className="size-4" />
            </Button>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
