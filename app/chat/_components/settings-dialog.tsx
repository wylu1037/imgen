"use client";

import * as React from "react";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Palette,
  Plug,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import { THEMES, type StyleTheme } from "@/lib/themes";
import { userAvatars } from "@/lib/avatars";
import { defaultImageModel } from "@/lib/chat/constants";
import type { ProviderConfig } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: ProviderConfig[];
  activeProviderId: string | null;
  onSelectProvider: (providerId: string) => void;
  onCreateProvider: () => ProviderConfig;
  onSaveProvider: (provider: ProviderConfig) => void;
  onDeleteProvider: (providerId: string) => void;
  trigger: React.ReactNode;
};

type ProviderDraft = {
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  defaultModel: string;
};

type ModelsResponse = {
  models?: string[];
  error?: string;
};

type Section = "profile" | "provider" | "appearance";

const SECTIONS: Array<{
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "provider", label: "Provider", icon: Plug },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function normalizeModels(models: string[]): string[] {
  return Array.from(
    new Set(models.map((model) => model.trim()).filter(Boolean)),
  );
}

function providerToDraft(provider: ProviderConfig): ProviderDraft {
  const models = normalizeModels(provider.models);
  const defaultModel =
    provider.defaultModel.trim() || models[0] || defaultImageModel;

  return {
    name: provider.name,
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    models: models.includes(defaultModel) ? models : [defaultModel, ...models],
    defaultModel,
  };
}

export function SettingsDialog({
  open,
  onOpenChange,
  providers,
  activeProviderId,
  onSelectProvider,
  onCreateProvider,
  onSaveProvider,
  onDeleteProvider,
  trigger,
}: SettingsDialogProps) {
  const activeProvider =
    providers.find((provider) => provider.id === activeProviderId) ||
    providers[0] ||
    null;
  const [section, setSection] = React.useState<Section>("provider");
  const [draftState, setDraftState] = React.useState(() => ({
    providerId: activeProvider?.id ?? null,
    draft: activeProvider ? providerToDraft(activeProvider) : null,
  }));
  const [modelsStatus, setModelsStatus] = React.useState<
    "idle" | "loading" | "error"
  >("idle");
  const [modelsError, setModelsError] = React.useState("");
  const activeProviderDraftId = activeProvider?.id ?? null;

  if (draftState.providerId !== activeProviderDraftId) {
    setDraftState({
      providerId: activeProviderDraftId,
      draft: activeProvider ? providerToDraft(activeProvider) : null,
    });
    if (modelsStatus !== "idle") setModelsStatus("idle");
    if (modelsError) setModelsError("");
  }

  const draft = draftState.draft;

  const updateDraft = (key: keyof ProviderDraft, value: string | string[]) => {
    setDraftState((current) =>
      current.draft
        ? { ...current, draft: { ...current.draft, [key]: value } }
        : current,
    );
  };

  const handleCreateProvider = () => {
    onCreateProvider();
  };

  const handleLoadModels = async () => {
    if (!draft) return;

    const apiKey = draft.apiKey.trim();
    const baseURL = draft.baseURL.trim();

    if (!apiKey) {
      setModelsStatus("error");
      setModelsError("Enter your API key before loading models.");
      return;
    }

    if (baseURL) {
      try {
        new URL(baseURL);
      } catch {
        setModelsStatus("error");
        setModelsError("Base URL must be a valid URL.");
        return;
      }
    }

    setModelsStatus("loading");
    setModelsError("");

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL }),
      });
      const data = (await response.json()) as ModelsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to load models.");
      }

      const models = normalizeModels(data.models || []);
      if (models.length === 0) {
        throw new Error("The provider did not return any models.");
      }

      const defaultModel = models.includes(draft.defaultModel)
        ? draft.defaultModel
        : models[0];
      setDraftState((current) =>
        current.draft
          ? { ...current, draft: { ...current.draft, models, defaultModel } }
          : current,
      );
      setModelsStatus("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load models.";
      setModelsStatus("error");
      setModelsError(message);
    }
  };

  const handleSave = () => {
    if (!activeProvider || !draft) return;

    const models = normalizeModels(draft.models);
    const defaultModel =
      draft.defaultModel.trim() || models[0] || defaultImageModel;

    onSaveProvider({
      ...activeProvider,
      name: draft.name,
      apiKey: draft.apiKey,
      baseURL: draft.baseURL,
      models: models.includes(defaultModel)
        ? models
        : [defaultModel, ...models],
      defaultModel,
      notes: activeProvider.notes,
    });
  };

  const canDelete = providers.length > 1;
  const modelOptions = draft
    ? normalizeModels(
        draft.models.includes(draft.defaultModel)
          ? draft.models
          : [draft.defaultModel, ...draft.models],
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent
        showCloseButton={false}
        className="grid h-[min(620px,calc(100vh-4rem))] w-[min(820px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden p-0 text-[12px] sm:max-w-none md:grid-cols-[200px_1fr]"
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
        <aside className="border-b border-hairline-soft bg-surface-soft/80 p-2.5 md:border-r md:border-b-0">
          <div className="px-2 pt-1 pb-3">
            <DialogTitle className="text-[12px] font-semibold text-ink">
              Settings
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] leading-4 text-steel">
              Manage chat configuration.
            </DialogDescription>
          </div>

          <nav aria-label="Settings sections" className="flex flex-col gap-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = section === id;
              const count = id === "provider" ? providers.length : null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors duration-150 ease-out focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                    isActive
                      ? "bg-tint-lavender text-brand-purple-800"
                      : "text-charcoal hover:bg-tint-gray",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {count !== null ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        isActive
                          ? "bg-card text-steel"
                          : "bg-tint-gray text-steel",
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-5">
              {section === "provider" ? (
                <ProviderSection
                  providers={providers}
                  activeProvider={activeProvider}
                  activeProviderId={activeProviderId}
                  canDelete={canDelete}
                  draft={draft}
                  modelOptions={modelOptions}
                  modelsStatus={modelsStatus}
                  modelsError={modelsError}
                  onSelectProvider={onSelectProvider}
                  onCreateProvider={handleCreateProvider}
                  onDeleteProvider={onDeleteProvider}
                  onUpdateDraft={updateDraft}
                  onLoadModels={handleLoadModels}
                  onSave={handleSave}
                />
              ) : section === "appearance" ? (
                <AppearanceSection />
              ) : (
                <ProfileSection />
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ProviderSectionProps = {
  providers: ProviderConfig[];
  activeProvider: ProviderConfig | null;
  activeProviderId: string | null;
  canDelete: boolean;
  draft: ProviderDraft | null;
  modelOptions: string[];
  modelsStatus: "idle" | "loading" | "error";
  modelsError: string;
  onSelectProvider: (providerId: string) => void;
  onCreateProvider: () => void;
  onDeleteProvider: (providerId: string) => void;
  onUpdateDraft: (key: keyof ProviderDraft, value: string | string[]) => void;
  onLoadModels: () => void;
  onSave: () => void;
};

function ProviderSection({
  providers,
  activeProvider,
  activeProviderId,
  canDelete,
  draft,
  modelOptions,
  modelsStatus,
  modelsError,
  onSelectProvider,
  onCreateProvider,
  onDeleteProvider,
  onUpdateDraft,
  onLoadModels,
  onSave,
}: ProviderSectionProps) {
  const [showApiKey, setShowApiKey] = React.useState(false);
  return (
    <>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const isActive = provider.id === activeProviderId;
          const isSelected = provider.id === activeProvider?.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelectProvider(provider.id)}
              className={cn(
                "group relative min-h-18 rounded-lg border p-2.5 text-left transition-colors duration-150 ease-out",
                "hover:bg-tint-gray focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                isSelected
                  ? "border-primary/35 bg-tint-lavender"
                  : "border-hairline-soft bg-card",
              )}
            >
              {isActive ? (
                <span
                  aria-label="Active"
                  className="absolute top-2 right-2 flex size-1.5"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
              ) : null}
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-ink">
                    {provider.name || "Untitled provider"}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-steel">
                    {provider.defaultModel || defaultImageModel}
                  </span>
                </span>
                {canDelete ? (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete ${provider.name || "provider"}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteProvider(provider.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      event.stopPropagation();
                      onDeleteProvider(provider.id);
                    }}
                    className={cn(
                      "pointer-events-none inline-flex h-6 w-0 shrink-0 items-center justify-center overflow-hidden rounded-md text-steel opacity-0",
                      "transition-[width,opacity,margin] duration-200 ease-out",
                      "group-hover:pointer-events-auto group-hover:w-6 group-hover:opacity-100",
                      "group-focus-within:pointer-events-auto group-focus-within:w-6 group-focus-within:opacity-100",
                      "hover:bg-destructive/10 hover:text-destructive focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                    )}
                  >
                    <Trash2 className="size-3 shrink-0" />
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCreateProvider}
          className={cn(
            "flex min-h-18 items-center justify-center rounded-lg border border-dashed border-hairline-soft bg-card transition-colors duration-150 ease-out",
            "text-steel hover:bg-tint-gray focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
          )}
          aria-label="Add provider"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="mb-4 flex items-start justify-between gap-4 border-hairline-soft pt-4">
        <div>
          <h3 className="text-[12px] font-semibold text-ink">
            Provider details
          </h3>
          <p className="mt-0.5 text-[11px] leading-4 text-steel">
            Credentials stay in this browser. SQLite storage is local, not
            encrypted.
          </p>
        </div>
      </div>

      {activeProvider && draft ? (
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label
              htmlFor="provider-name"
              className="text-[11px] font-medium tracking-wide text-steel"
            >
              Name
            </Label>
            <Input
              id="provider-name"
              value={draft.name}
              onChange={(event) => onUpdateDraft("name", event.target.value)}
              placeholder="OpenAI"
              autoComplete="off"
              className="h-9 px-3 text-[13px] md:text-[12px]"
            />
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="api-key"
              className="text-[11px] font-medium tracking-wide text-steel"
            >
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={draft.apiKey}
                onChange={(event) =>
                  onUpdateDraft("apiKey", event.target.value)
                }
                placeholder="sk-..."
                autoComplete="off"
                className="h-9 pr-9 pl-3 text-[13px] md:text-[12px]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                aria-pressed={showApiKey}
                className="absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-steel transition-colors duration-150 ease-out hover:bg-tint-gray hover:text-ink focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
              >
                {showApiKey ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="base-url"
              className="text-[11px] font-medium tracking-wide text-steel"
            >
              Base URL
            </Label>
            <Input
              id="base-url"
              value={draft.baseURL}
              onChange={(event) => onUpdateDraft("baseURL", event.target.value)}
              placeholder="Leave blank for OpenAI default"
              autoComplete="off"
              className="h-9 px-3 text-[13px] md:text-[12px]"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="default-model"
                className="text-[11px] font-medium tracking-wide text-steel"
              >
                Model
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void onLoadModels();
                }}
                disabled={modelsStatus === "loading"}
                className="h-7 px-2 text-[11px] text-steel [&_svg]:size-3.5"
              >
                {modelsStatus === "loading" ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                Load models
              </Button>
            </div>

            <Select
              value={draft.defaultModel}
              onValueChange={(next) => {
                if (next) onUpdateDraft("defaultModel", next);
              }}
            >
              <SelectTrigger
                id="default-model"
                aria-label="Model"
                className="h-9 w-full text-[12px]"
              >
                <SelectValue placeholder="Load models first" />
              </SelectTrigger>
              <SelectPositioner>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem
                      key={model}
                      value={model}
                      className="text-[12px]"
                    >
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>

            <p className="text-[11px] leading-4 text-destructive">
              {modelsError}
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              className="h-8 text-[12px]"
            >
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="mb-4">
        <h3 className="text-[12px] font-semibold text-ink">Style</h3>
        <p className="mt-0.5 text-[11px] leading-4 text-steel">
          Pick a visual identity for the workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {THEMES.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-label={t.name}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-lg border text-left transition-all duration-150 ease-out",
                "focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                isActive
                  ? "border-primary/45 ring-2 ring-primary/25"
                  : "border-hairline-soft hover:border-hairline-strong",
              )}
            >
              {/* Mini preview */}
              <div
                className="flex flex-col gap-1.5 p-2.5 pb-2"
                style={{ backgroundColor: t.preview.bg }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-3 w-8 rounded-[3px]"
                    style={{ backgroundColor: t.preview.card }}
                  />
                  <div
                    className="h-3 rounded-[3px] px-1.5"
                    style={{
                      backgroundColor: t.preview.primary,
                      color: "#fff",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div
                    className="h-1 w-10 rounded-full"
                    style={{ backgroundColor: t.preview.foreground, opacity: 0.8 }}
                  />
                  <div
                    className="h-1 w-7 rounded-full"
                    style={{ backgroundColor: t.preview.mutedForeground, opacity: 0.5 }}
                  />
                </div>
              </div>

              {/* Label row */}
              <div
                className="flex items-center justify-between px-2.5 py-2"
                style={{ backgroundColor: t.preview.card }}
              >
                <span className="flex flex-col">
                  <span
                    className="text-[12px] font-medium leading-tight"
                    style={{ color: t.preview.foreground }}
                  >
                    {t.name}
                  </span>
                  <span
                    className="mt-0.5 text-[10px] leading-3"
                    style={{ color: t.preview.mutedForeground }}
                  >
                    {t.description}
                  </span>
                </span>
                {isActive ? (
                  <span
                    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: t.preview.primary }}
                  >
                    <Check
                      className="size-2.5"
                      style={{ color: t.preview.card }}
                    />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ProfileSection() {
  const { avatarId, setAvatarId } = useUserAvatar();

  return (
    <>
      <div className="mb-4">
        <h3 className="text-[12px] font-semibold text-ink">Avatar</h3>
        <p className="mt-0.5 text-[11px] leading-4 text-steel">
          Pick the avatar shown beside your messages. Saved to this browser.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="User avatar"
        className="grid grid-cols-3 gap-3 sm:grid-cols-6"
      >
        {userAvatars.map((avatar) => {
          const isSelected = avatar.id === avatarId;
          return (
            <button
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={avatar.label}
              onClick={() => setAvatarId(avatar.id)}
              className={cn(
                "group relative flex aspect-square w-full items-center justify-center rounded-full border bg-card transition-colors duration-150 ease-out",
                "hover:border-primary/35 focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                isSelected
                  ? "border-primary/45 ring-2 ring-primary/35 ring-offset-2 ring-offset-background"
                  : "border-hairline-soft",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar.src}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
              {isSelected ? (
                <span className="absolute -top-1 -right-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-card shadow-subtle ring-2 ring-background">
                  <Check className="size-2.5" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
