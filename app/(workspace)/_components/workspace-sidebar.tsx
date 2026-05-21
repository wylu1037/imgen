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
import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

      <SidebarFooter className="flex-row items-center justify-center gap-1 border-hairline-soft">
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
              size="icon-sm"
              aria-label="Open provider settings"
              className="text-charcoal"
            >
              <Settings className="size-5" />
            </Button>
          }
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href="https://github.com/wylu1037/imgen"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Star Imgen on GitHub"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-charcoal outline-none transition-colors duration-200 ease-out hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GithubIcon className="size-5" />
              </a>
            }
          />
          <TooltipPositioner side="top">
            <TooltipContent>Give me a star ⭐</TooltipContent>
          </TooltipPositioner>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}
