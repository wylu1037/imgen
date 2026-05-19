"use client";

import * as React from "react";
import { toast } from "sonner";

import { defaultImageModel } from "@/lib/chat/constants";
import type { NewChatMessage } from "@/lib/chat/types";

import { ChatTopbar } from "./_components/chat-topbar";
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
    settings,
    updateField,
    clearAll: clearSettings,
  } = useProviderSettings();
  const {
    status: dbStatus,
    persistent,
    messages,
    append,
    clearAll: clearHistory,
  } = useChatHistory();

  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState(
    () => settings.defaultModel || defaultImageModel,
  );
  const [size, setSize] = React.useState("1024x1024");
  const [quality, setQuality] = React.useState("auto");
  const [pendingTurn, setPendingTurn] = React.useState<PendingTurn | null>(
    null,
  );
  const isGenerating = pendingTurn !== null;
  const persistenceWarnedRef = React.useRef(false);

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

  const isReady = dbStatus === "ready" || dbStatus === "error";

  async function handleSubmit() {
    const trimmedPrompt = draft.trim();
    const trimmedApiKey = settings.apiKey.trim();
    const trimmedBaseURL = settings.baseURL.trim();
    const trimmedModel = model.trim();

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

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ChatTopbar
        settings={settings}
        onUpdateField={updateField}
        onClearSettings={clearSettings}
        onClearChat={() => {
          void clearHistory();
        }}
        hasMessages={messages.length > 0}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <MessageList
            messages={messages}
            pendingTurn={pendingTurn}
            isEmpty={messages.length === 0 && !pendingTurn}
            onPickSample={(prompt) => setDraft(prompt)}
          />
        </div>

        <div className="border-hairline-soft bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl">
            <Composer
              draft={draft}
              onDraftChange={setDraft}
              model={model}
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
      </main>
    </div>
  );
}
