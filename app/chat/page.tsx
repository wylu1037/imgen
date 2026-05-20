"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { defaultImageModel, type OptionItem } from "@/lib/chat/constants";
import type { NewChatMessage } from "@/lib/chat/types";

import { ChatSidebar } from "./_components/chat-sidebar";
import { Composer } from "./_components/composer";
import { MessageList } from "./_components/message-list";
import type { PendingTurn } from "./_components/message-bubble";
import { useChatHistory } from "./_hooks/use-chat-history";
import { useProviderSettings } from "./_hooks/use-provider-settings";

type GenerateResponse = {
  image?: string;
  model?: string;
  revisedPrompt?: string;
  error?: string;
};

function generateTurnId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatPage() {
  const {
    status: providerStatus,
    providers,
    activeProvider,
    activeProviderId,
    setActiveProviderId,
    createProvider,
    saveProvider,
    deleteProvider,
  } = useProviderSettings();
  const {
    status: dbStatus,
    persistent,
    messages,
    append,
    deleteTurn,
  } = useChatHistory();

  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState(defaultImageModel);
  const [size, setSize] = React.useState("1024x1024");
  const [quality, setQuality] = React.useState("auto");
  const [pendingTurn, setPendingTurn] = React.useState<PendingTurn | null>(
    null,
  );
  const [scrollTargetTurnId, setScrollTargetTurnId] = React.useState<
    string | null
  >(null);
  const [selectedTurnIds, setSelectedTurnIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const isGenerating = pendingTurn !== null;
  const persistenceWarnedRef = React.useRef(false);
  const providerModelOptions = React.useMemo<OptionItem[]>(() => {
    const models = activeProvider?.models.length
      ? activeProvider.models
      : [activeProvider?.defaultModel || defaultImageModel];
    return models.map((model) => ({ label: model, value: model }));
  }, [activeProvider]);

  const selectedModel = React.useMemo(() => {
    if (!activeProvider) return model;
    return activeProvider.models.includes(model)
      ? model
      : activeProvider.defaultModel ||
          activeProvider.models[0] ||
          defaultImageModel;
  }, [activeProvider, model]);

  React.useEffect(() => {
    if (dbStatus !== "ready" || persistent || persistenceWarnedRef.current)
      return;
    persistenceWarnedRef.current = true;
    toast.warning("Local history unavailable — chat will reset on refresh.");
  }, [dbStatus, persistent]);

  React.useEffect(() => {
    if (dbStatus === "error" && !persistenceWarnedRef.current) {
      persistenceWarnedRef.current = true;
      toast.error("Failed to open local chat database.");
    }
  }, [dbStatus]);

  const isReady =
    (dbStatus === "ready" || dbStatus === "error") &&
    (providerStatus === "ready" || providerStatus === "error");

  async function handleSubmit() {
    const trimmedPrompt = draft.trim();
    const trimmedApiKey = activeProvider?.apiKey.trim() || "";
    const trimmedBaseURL = activeProvider?.baseURL.trim() || "";
    const trimmedModel = selectedModel.trim();

    if (!trimmedPrompt) return;
    if (!trimmedApiKey) {
      toast.error("Enter your API key in provider settings.");
      return;
    }
    if (!trimmedModel) {
      toast.error("Enter an image model.");
      return;
    }
    if (trimmedBaseURL) {
      try {
        new URL(trimmedBaseURL);
      } catch {
        toast.error("Base URL must be a valid URL.");
        return;
      }
    }

    const turnId = generateTurnId();

    const userMessage: NewChatMessage = {
      turnId,
      role: "user",
      content: trimmedPrompt,
      imageData: null,
      model: trimmedModel,
      size,
      quality,
      revisedPrompt: null,
      error: null,
    };

    try {
      await append(userMessage);
    } catch (err) {
      console.error("[chat] failed to persist user message", err);
    }

    setDraft("");
    setPendingTurn({
      turnId,
      prompt: trimmedPrompt,
      model: trimmedModel,
      size,
      quality,
    });

    let assistant: NewChatMessage;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          model: trimmedModel,
          size,
          quality,
          apiKey: trimmedApiKey,
          baseURL: trimmedBaseURL,
        }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.image) {
        throw new Error(data.error || "Image generation failed.");
      }

      assistant = {
        turnId,
        role: "assistant",
        content: "",
        imageData: data.image,
        model: data.model || trimmedModel,
        size,
        quality,
        revisedPrompt: data.revisedPrompt || null,
        error: null,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image generation failed.";
      toast.error(message);
      assistant = {
        turnId,
        role: "assistant",
        content: "",
        imageData: null,
        model: trimmedModel,
        size,
        quality,
        revisedPrompt: null,
        error: message,
      };
    } finally {
      setPendingTurn(null);
    }

    try {
      await append(assistant);
    } catch (err) {
      console.error("[chat] failed to persist assistant message", err);
    }
  }

  const handleScrollHandled = React.useCallback(() => {
    setScrollTargetTurnId(null);
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedTurnIds(new Set());
  }, []);

  const toggleTurnSelection = React.useCallback((turnId: string) => {
    setSelectedTurnIds((current) => {
      const next = new Set(current);
      if (next.has(turnId)) {
        next.delete(turnId);
      } else {
        next.add(turnId);
      }
      return next;
    });
  }, []);

  const handleDeleteTurn = React.useCallback(
    async (turnId: string) => {
      try {
        await deleteTurn(turnId);
        setScrollTargetTurnId((current) =>
          current === turnId ? null : current,
        );
        setSelectedTurnIds((current) => {
          if (!current.has(turnId)) return current;
          const next = new Set(current);
          next.delete(turnId);
          return next;
        });
      } catch (err) {
        console.error("[chat] failed to delete turn", err);
        toast.error("Failed to delete message.");
      }
    },
    [deleteTurn],
  );

  const handleDeleteSelectedTurns = React.useCallback(async () => {
    const turnIds = Array.from(selectedTurnIds);
    if (turnIds.length === 0) return;

    try {
      await Promise.all(turnIds.map((turnId) => deleteTurn(turnId)));
      setScrollTargetTurnId((current) =>
        current && selectedTurnIds.has(current) ? null : current,
      );
      clearSelection();
    } catch (err) {
      console.error("[chat] failed to delete selected turns", err);
      toast.error("Failed to delete selected messages.");
    }
  }, [clearSelection, deleteTurn, selectedTurnIds]);

  return (
    <SidebarProvider className="h-dvh min-h-0">
      <ChatSidebar
        messages={messages}
        selectedTurnId={scrollTargetTurnId}
        onSelectTurn={(turnId) => setScrollTargetTurnId(turnId)}
        providers={providers}
        activeProviderId={activeProviderId}
        onSelectProvider={setActiveProviderId}
        onCreateProvider={createProvider}
        onSaveProvider={saveProvider}
        onDeleteProvider={deleteProvider}
      />

      <SidebarInset className="overflow-hidden">
        <SidebarTrigger className="absolute top-3 left-3 z-10" />

        <div className="flex flex-1 flex-col overflow-hidden pt-12">
          <MessageList
            messages={messages}
            pendingTurn={pendingTurn}
            isEmpty={messages.length === 0 && !pendingTurn}
            onPickSample={(prompt) => setDraft(prompt)}
            onEditPrompt={(prompt) => setDraft(prompt)}
            onDeleteTurn={(turnId) => {
              void handleDeleteTurn(turnId);
            }}
            selectedTurnIds={selectedTurnIds}
            onToggleTurnSelection={toggleTurnSelection}
            onClearSelection={clearSelection}
            onDeleteSelectedTurns={() => {
              void handleDeleteSelectedTurns();
            }}
            scrollTargetTurnId={scrollTargetTurnId}
            onScrollHandled={handleScrollHandled}
          />
        </div>

        <div className="border-hairline-soft bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl">
            <Composer
              draft={draft}
              onDraftChange={setDraft}
              model={selectedModel}
              modelOptions={providerModelOptions}
              onModelChange={setModel}
              size={size}
              onSizeChange={setSize}
              quality={quality}
              onQualityChange={setQuality}
              onSubmit={() => {
                void handleSubmit();
              }}
              isGenerating={isGenerating}
              isReady={isReady}
            />
            <p className="mt-2 text-center text-[11px] text-stone">
              Each prompt generates an independent image. Multi-turn editing is
              not yet supported.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
