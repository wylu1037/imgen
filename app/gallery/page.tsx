"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import type { ChatMessage } from "@/lib/chat/types";

import { ChatSidebar } from "../chat/_components/chat-sidebar";
import { useChatHistory } from "../chat/_hooks/use-chat-history";

import { ImageCard } from "./_components/image-card";
import { TagFilter } from "./_components/tag-filter";

const ALL_FILTER = "__all__";
const UNTAGGED_FILTER = "__untagged__";

type GalleryItem = {
  assistant: ChatMessage;
  prompt: string;
};

export default function GalleryPage() {
  const { status, persistent, messages } = useChatHistory();
  const [selectedTag, setSelectedTag] = React.useState<string>(ALL_FILTER);
  const persistenceWarnedRef = React.useRef(false);

  React.useEffect(() => {
    if (status !== "ready" || persistent || persistenceWarnedRef.current)
      return;
    persistenceWarnedRef.current = true;
    toast.warning("Local history unavailable — gallery will reset on refresh.");
  }, [status, persistent]);

  React.useEffect(() => {
    if (status === "error" && !persistenceWarnedRef.current) {
      persistenceWarnedRef.current = true;
      toast.error("Failed to open local chat database.");
    }
  }, [status]);

  const items = React.useMemo<GalleryItem[]>(() => {
    const promptByTurn = new Map<string, string>();
    for (const m of messages) {
      if (m.role === "user" && !promptByTurn.has(m.turnId)) {
        promptByTurn.set(m.turnId, m.content);
      }
    }
    const result: GalleryItem[] = [];
    for (const m of messages) {
      if (m.role !== "assistant" || !m.imageData) continue;
      result.push({
        assistant: m,
        prompt: promptByTurn.get(m.turnId) ?? "",
      });
    }
    return result.reverse();
  }, [messages]);

  const tagOptions = React.useMemo(() => {
    const counts = new Map<string, number>();
    let untagged = 0;
    for (const item of items) {
      if (item.assistant.tags.length === 0) {
        untagged += 1;
        continue;
      }
      for (const tag of item.assistant.tags) {
        counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
      }
    }
    const tagEntries = Array.from(counts.entries())
      .map(([name, count]) => ({ value: name, label: name, count }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
    return [
      { value: ALL_FILTER, label: "All", count: items.length },
      ...tagEntries,
      { value: UNTAGGED_FILTER, label: "Untagged", count: untagged },
    ];
  }, [items]);

  const filteredItems = React.useMemo(() => {
    if (selectedTag === ALL_FILTER) return items;
    if (selectedTag === UNTAGGED_FILTER) {
      return items.filter((item) => item.assistant.tags.length === 0);
    }
    return items.filter((item) =>
      item.assistant.tags.some(
        (tag) => tag.name.toLowerCase() === selectedTag.toLowerCase(),
      ),
    );
  }, [items, selectedTag]);

  const isLoading = status === "loading" || status === "idle";

  return (
    <SidebarProvider className="h-dvh min-h-0">
      <ChatSidebar messages={messages} />

      <SidebarInset className="overflow-hidden">
        <SidebarTrigger className="absolute top-3 left-3 z-10" />

        <div className="flex flex-1 flex-col overflow-hidden pt-12">
          <div className="border-hairline-soft bg-background/95 px-4 py-3 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-6xl">
              <div className="flex flex-col gap-1">
                <h1 className="text-[18px] font-semibold tracking-tight text-ink">
                  Gallery
                </h1>
                <p className="text-[12px] text-steel">
                  Browse and filter your generated images by tag.
                </p>
              </div>
              {tagOptions.length > 1 ? (
                <div className="mt-3">
                  <TagFilter
                    options={tagOptions}
                    selected={selectedTag}
                    onSelect={setSelectedTag}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto w-full max-w-6xl">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center gap-2 text-stone">
                  <Spinner className="h-4 w-4" />
                  <span className="text-[13px]">Loading gallery</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <EmptyState
                  message={
                    items.length === 0
                      ? "No images yet. Generate some in Chat to see them here."
                      : "No images match this filter."
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item) => (
                    <ImageCard
                      key={item.assistant.id}
                      message={item.assistant}
                      prompt={item.prompt}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-tint-cream text-stone">
        <ImageIcon className="h-4 w-4" />
      </span>
      <p className="max-w-sm text-[12px] leading-5 text-steel">{message}</p>
    </div>
  );
}
