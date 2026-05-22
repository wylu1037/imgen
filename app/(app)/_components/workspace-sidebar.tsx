"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ImageIcon,
  Images,
  MessagesSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
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
import { groupConversationsByTime } from "@/lib/chat/grouping";
import type { Conversation } from "@/lib/chat/types";

import { useAppData } from "../_context/app-data-context";

import { SettingsDialog } from "./settings-dialog";

export function WorkspaceSidebar() {
  const {
    providerSettings,
    conversations,
    setSelectedTurn,
  } = useAppData();
  const {
    providers,
    activeProviderId,
    setActiveProviderId,
    createProvider,
    saveProvider,
    deleteProvider,
  } = providerSettings;
  const {
    conversations: convList,
    draft,
    activeConversationId,
    setActiveConversationId,
    newConversation,
    rename,
    remove,
  } = conversations;

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<Conversation | null>(
    null,
  );
  const [renameValue, setRenameValue] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Conversation | null>(
    null,
  );
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const groupedConversations = React.useMemo(
    () => groupConversationsByTime(convList),
    [convList],
  );

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    closeOnMobile();
    // sidebar nav: only force chat if we're not on chat/gallery, so picking a
    // conv from gallery just refines the filter without yanking the user away.
    if (
      pathname !== "/chat" &&
      pathname !== "/gallery" &&
      !pathname?.startsWith("/chat/") &&
      !pathname?.startsWith("/gallery/")
    ) {
      router.push("/chat");
    }
  };

  const handleNew = () => {
    newConversation();
    if (pathname !== "/chat") router.push("/chat");
    closeOnMobile();
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      await rename(renameTarget.id, trimmed);
      setRenameTarget(null);
    } catch (err) {
      console.error("[sidebar] rename failed", err);
      toast.error("Failed to rename conversation.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setSelectedTurn(target.id, null);
    try {
      await remove(target.id);
    } catch (err) {
      console.error("[sidebar] delete failed", err);
      toast.error("Failed to delete conversation.");
    }
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

  const isDraftActive = Boolean(
    draft && activeConversationId === draft.id,
  );
  const hasAnyConversation = convList.length > 0 || draft !== null;

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
                      onClick={closeOnMobile}
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-medium tracking-[0.12em] text-stone">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupAction
            onClick={handleNew}
            disabled={isDraftActive}
            aria-label="New conversation"
            className="hover:bg-secondary"
          >
            <Plus className="size-3.5" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {draft ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleSelectConversation(draft.id)}
                    isActive={activeConversationId === draft.id}
                    className={cn(
                      "text-[12px] text-stone italic",
                      "data-[active=true]:bg-tint-lavender data-[active=true]:text-brand-purple-800",
                    )}
                  >
                    <span className="truncate">New conversation</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {!hasAnyConversation ? (
                <div className="px-3 py-2 text-[11px] leading-4 text-steel">
                  Start chatting to create your first conversation.
                </div>
              ) : null}
            </SidebarMenu>

            {groupedConversations.map((group) => (
              <div key={group.key} className="mt-1">
                <div className="px-3 pt-1 pb-0.5 text-[10px] font-medium tracking-[0.12em] text-stone">
                  {group.label}
                </div>
                <SidebarMenu>
                  {group.conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversationId === conv.id}
                      onSelect={() => handleSelectConversation(conv.id)}
                      onRename={() => {
                        setRenameValue(conv.title);
                        setRenameTarget(conv);
                      }}
                      onDelete={() => setDeleteTarget(conv)}
                    />
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {!hasAnyConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-tint-cream text-stone">
              <ImageIcon className="h-4 w-4" />
            </span>
            <p className="text-[11px] leading-4 text-steel">
              Your generated images will appear here, grouped by conversation.
            </p>
          </div>
        ) : null}
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
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-charcoal transition-colors duration-200 ease-out outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[min(420px,calc(100vw-2rem))] max-w-none gap-0 p-5"
        >
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Close"
                className="absolute top-3 right-3 z-10 inline-flex size-7 items-center justify-center rounded-md text-steel transition-colors duration-150 ease-out hover:bg-tint-gray hover:text-ink focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
              >
                <X className="size-4" />
              </button>
            }
          />
          <div className="mb-4">
            <DialogTitle className="text-[12px] font-semibold text-ink">
              Rename conversation
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] leading-4 text-steel">
              Give this conversation a name you can find later.
            </DialogDescription>
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="conversation-rename"
              className="text-[11px] font-medium tracking-wide text-steel"
            >
              Title
            </Label>
            <Input
              id="conversation-rename"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleRenameSubmit();
                }
              }}
              autoFocus
              placeholder="Conversation title"
              autoComplete="off"
              className="h-8 px-3 text-[13px]! md:text-[12px]!"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRenameTarget(null)}
              className="h-8 text-[12px]!"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleRenameSubmit()}
              disabled={!renameValue.trim()}
              className="h-8 text-[12px]!"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove
              {deleteTarget?.title
                ? ` "${deleteTarget.title}"`
                : " this conversation"}{" "}
              and all of its messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
};

const ConversationItem = React.memo(function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onSelect}
        isActive={isActive}
        className={cn(
          "pr-7 text-[12px]! text-charcoal",
          "data-[active=true]:bg-tint-lavender data-[active=true]:text-brand-purple-800",
        )}
      >
        <span className="truncate">{conversation.title || "Untitled"}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${conversation.title || "conversation"}`}
            className="absolute top-1/2 right-1 size-6 -translate-y-1/2 text-stone opacity-0 transition-opacity group-hover/menu-item:opacity-100 data-[state=open]:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem onSelect={onRename}>
            <Pencil className="size-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
});

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
