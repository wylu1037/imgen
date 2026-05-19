"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { defaultImageModel } from "@/lib/chat/constants"
import type { ProviderSettings } from "@/lib/chat/types"

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ProviderSettings
  onUpdateField: (key: keyof ProviderSettings, value: string) => void
  onClear: () => void
  trigger: React.ReactNode
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateField,
  onClear,
  trigger,
}: SettingsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger render={trigger as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed right-0 top-0 z-50 flex h-dvh w-[min(420px,100vw)] flex-col gap-5 border-l border-border bg-card p-6 shadow-modal outline-none transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full">
          <div className="space-y-1">
            <Dialog.Title className="text-base font-semibold text-ink">
              Provider settings
            </Dialog.Title>
            <Dialog.Description className="text-[13px] leading-5 text-steel">
              Provider credentials are saved locally in this browser.
            </Dialog.Description>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-micro-uppercase text-steel">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={settings.apiKey}
                onChange={(event) =>
                  onUpdateField("apiKey", event.target.value)
                }
                placeholder="sk-..."
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url" className="text-micro-uppercase text-steel">
                Base URL
              </Label>
              <Input
                id="base-url"
                value={settings.baseURL}
                onChange={(event) =>
                  onUpdateField("baseURL", event.target.value)
                }
                placeholder="Leave blank for OpenAI default"
                autoComplete="off"
              />
              <p className="text-[13px] leading-5 text-steel">
                Optional. Only use a trusted provider endpoint.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="default-model"
                className="text-micro-uppercase text-steel"
              >
                Default model
              </Label>
              <Input
                id="default-model"
                value={settings.defaultModel}
                onChange={(event) =>
                  onUpdateField("defaultModel", event.target.value)
                }
                placeholder={defaultImageModel}
              />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Dialog.Close render={<Button type="button" size="sm" />}>
              Done
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
