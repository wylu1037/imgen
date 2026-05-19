"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Select } from "@base-ui/react/select"
import { Check, ChevronDown, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { defaultImageModel } from "@/lib/chat/constants"
import type { ProviderConfig } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: ProviderConfig[]
  activeProviderId: string | null
  onSelectProvider: (providerId: string) => void
  onCreateProvider: () => ProviderConfig
  onSaveProvider: (provider: ProviderConfig) => void
  onDeleteProvider: (providerId: string) => void
  trigger: React.ReactNode
}

type ProviderDraft = {
  name: string
  apiKey: string
  baseURL: string
  models: string[]
  defaultModel: string
}

type ModelsResponse = {
  models?: string[]
  error?: string
}

function normalizeModels(models: string[]): string[] {
  return Array.from(new Set(models.map((model) => model.trim()).filter(Boolean)))
}

function providerToDraft(provider: ProviderConfig): ProviderDraft {
  const models = normalizeModels(provider.models)
  const defaultModel = provider.defaultModel.trim() || models[0] || defaultImageModel

  return {
    name: provider.name,
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    models: models.includes(defaultModel) ? models : [defaultModel, ...models],
    defaultModel,
  }
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
    null
  const [draftState, setDraftState] = React.useState(() => ({
    providerId: activeProvider?.id ?? null,
    draft: activeProvider ? providerToDraft(activeProvider) : null,
  }))
  const [modelsStatus, setModelsStatus] = React.useState<"idle" | "loading" | "error">("idle")
  const [modelsError, setModelsError] = React.useState("")
  const activeProviderDraftId = activeProvider?.id ?? null

  if (draftState.providerId !== activeProviderDraftId) {
    setDraftState({
      providerId: activeProviderDraftId,
      draft: activeProvider ? providerToDraft(activeProvider) : null,
    })
    if (modelsStatus !== "idle") setModelsStatus("idle")
    if (modelsError) setModelsError("")
  }

  const draft = draftState.draft

  const updateDraft = (key: keyof ProviderDraft, value: string | string[]) => {
    setDraftState((current) =>
      current.draft
        ? { ...current, draft: { ...current.draft, [key]: value } }
        : current,
    )
  }

  const handleCreateProvider = () => {
    onCreateProvider()
  }

  const handleLoadModels = async () => {
    if (!draft) return

    const apiKey = draft.apiKey.trim()
    const baseURL = draft.baseURL.trim()

    if (!apiKey) {
      setModelsStatus("error")
      setModelsError("Enter your API key before loading models.")
      return
    }

    if (baseURL) {
      try {
        new URL(baseURL)
      } catch {
        setModelsStatus("error")
        setModelsError("Base URL must be a valid URL.")
        return
      }
    }

    setModelsStatus("loading")
    setModelsError("")

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL }),
      })
      const data = (await response.json()) as ModelsResponse

      if (!response.ok) {
        throw new Error(data.error || "Failed to load models.")
      }

      const models = normalizeModels(data.models || [])
      if (models.length === 0) {
        throw new Error("The provider did not return any models.")
      }

      console.log("[settings-dialog] loaded model ids", models)

      const defaultModel = models.includes(draft.defaultModel)
        ? draft.defaultModel
        : models[0]
      setDraftState((current) =>
        current.draft
          ? { ...current, draft: { ...current.draft, models, defaultModel } }
          : current,
      )
      setModelsStatus("idle")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load models."
      setModelsStatus("error")
      setModelsError(message)
    }
  }

  const handleSave = () => {
    if (!activeProvider || !draft) return

    const models = normalizeModels(draft.models)
    const defaultModel = draft.defaultModel.trim() || models[0] || defaultImageModel

    onSaveProvider({
      ...activeProvider,
      name: draft.name,
      apiKey: draft.apiKey,
      baseURL: draft.baseURL,
      models: models.includes(defaultModel) ? models : [defaultModel, ...models],
      defaultModel,
      notes: activeProvider.notes,
    })
  }

  const canDelete = providers.length > 1
  const modelOptions = draft
    ? normalizeModels(
        draft.models.includes(draft.defaultModel)
          ? draft.models
          : [draft.defaultModel, ...draft.models],
      )
    : []

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger render={trigger as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 grid w-[min(860px,calc(100vw-2rem))] max-h-[86vh] -translate-x-1/2 -translate-y-1/2 grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-modal outline-none transition-[opacity,transform] duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 md:grid-cols-[240px_1fr]">
          <aside className="border-b border-hairline-soft bg-surface-soft/80 p-3 md:border-b-0 md:border-r">
            <div className="px-2 pb-4 pt-1">
              <Dialog.Title className="text-[13px] font-semibold text-ink">
                Settings
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[12px] leading-4 text-steel">
                Manage local chat configuration.
              </Dialog.Description>
            </div>

            <nav aria-label="Settings sections" className="space-y-1">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-tint-lavender px-3 py-2 text-left text-[13px] font-medium text-brand-purple-800 focus:outline-none focus:ring-[3px] focus:ring-primary/15"
              >
                <span>Provider</span>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] text-steel">
                  {providers.length}
                </span>
              </button>
            </nav>
          </aside>

          <div className="flex min-h-0 flex-col overflow-y-auto p-6">
            <ScrollArea className="mb-5 max-h-46 pr-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {providers.map((provider) => {
                  const isActive = provider.id === activeProviderId;
                  const isSelected = provider.id === activeProvider?.id;

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => onSelectProvider(provider.id)}
                      className={cn(
                        "group rounded-lg border p-3 text-left transition-colors duration-150 ease-out",
                        "hover:bg-tint-gray focus:outline-none focus:ring-[3px] focus:ring-primary/15",
                        isSelected
                          ? "border-primary/35 bg-tint-lavender"
                          : "border-hairline-soft bg-card",
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {provider.name || "Untitled provider"}
                          </span>
                          <span className="mt-1 block truncate text-[12px] text-steel">
                            {provider.defaultModel || defaultImageModel}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          ) : null}
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
                              "inline-flex h-7 w-7 items-center justify-center rounded-md text-steel opacity-0 transition-all duration-150 ease-out",
                              "hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-[3px] focus:ring-primary/15",
                              "group-hover:opacity-100 group-focus-within:opacity-100",
                              !canDelete && "pointer-events-none opacity-0",
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleCreateProvider}
                  className={cn(
                    "flex min-h-21 items-center justify-center rounded-lg border border-dashed border-hairline-soft bg-card transition-colors duration-150 ease-out",
                    "text-steel hover:bg-tint-gray focus:outline-none focus:ring-[3px] focus:ring-primary/15",
                  )}
                  aria-label="Add provider"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </ScrollArea>

            <div className="mb-5 flex items-start justify-between gap-4 border-hairline-soft pt-5">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  Provider details
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-steel">
                  Credentials stay in this browser. SQLite storage is local, not
                  encrypted.
                </p>
              </div>
            </div>

            {activeProvider && draft ? (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="provider-name"
                    className="text-micro-uppercase text-steel"
                  >
                    Name
                  </Label>
                  <Input
                    id="provider-name"
                    value={draft.name}
                    onChange={(event) =>
                      updateDraft("name", event.target.value)
                    }
                    placeholder="OpenAI"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="api-key"
                    className="text-micro-uppercase text-steel"
                  >
                    API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={draft.apiKey}
                    onChange={(event) =>
                      updateDraft("apiKey", event.target.value)
                    }
                    placeholder="sk-..."
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="base-url"
                    className="text-micro-uppercase text-steel"
                  >
                    Base URL
                  </Label>
                  <Input
                    id="base-url"
                    value={draft.baseURL}
                    onChange={(event) =>
                      updateDraft("baseURL", event.target.value)
                    }
                    placeholder="Leave blank for OpenAI default"
                    autoComplete="off"
                  />
                  <p className="text-[13px] leading-5 text-steel">
                    Optional. Only use a trusted provider endpoint.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="default-model"
                      className="text-micro-uppercase text-steel"
                    >
                      Model
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleLoadModels();
                      }}
                      disabled={modelsStatus === "loading"}
                      className="h-8 text-[12px] text-steel"
                    >
                      {modelsStatus === "loading" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Load models
                    </Button>
                  </div>

                  <Select.Root
                    value={draft.defaultModel}
                    onValueChange={(next) => {
                      if (next) updateDraft("defaultModel", next);
                    }}
                  >
                    <Select.Trigger
                      id="default-model"
                      aria-label="Model"
                      className={cn(
                        "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-hairline-strong bg-card px-3 text-left text-sm text-ink",
                        "transition-all duration-150 ease-out focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15 data-disabled:cursor-not-allowed data-disabled:opacity-50",
                      )}
                    >
                      <Select.Value>
                        <span className="truncate font-medium">
                          {draft.defaultModel || "Load models first"}
                        </span>
                      </Select.Value>
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 shrink-0 text-stone" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        sideOffset={6}
                        className="z-50 outline-none"
                      >
                        <Select.Popup className="max-h-72 min-w-(--anchor-width) overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-modal outline-none">
                          {modelOptions.map((model) => (
                            <Select.Item
                              key={model}
                              value={model}
                              className={cn(
                                "grid cursor-default select-none grid-cols-[0.875rem_1fr] items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none",
                                "data-highlighted:bg-secondary data-highlighted:text-ink",
                              )}
                            >
                              <span className="flex h-3.5 w-3.5 items-center justify-center text-primary">
                                <Select.ItemIndicator>
                                  <Check className="h-3.5 w-3.5" />
                                </Select.ItemIndicator>
                              </span>
                              <Select.ItemText>
                                <span className="font-medium text-ink">
                                  {model}
                                </span>
                              </Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>

                  {modelsError ? (
                    <p className="text-[13px] leading-5 text-destructive">
                      {modelsError}
                    </p>
                  ) : (
                    <p className="text-[13px] leading-5 text-steel">
                      Load models from the provider endpoint, then choose the
                      image model.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2 border-hairline-soft pt-4">
                  <Dialog.Close
                    render={<Button type="button" variant="ghost" size="sm" />}
                  >
                    Cancel
                  </Dialog.Close>
              <Button type="button" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
