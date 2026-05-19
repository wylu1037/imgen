"use client"

import * as React from "react"

import {
  defaultImageModel,
  providerSettingsStorageKey,
} from "@/lib/chat/constants"
import type { ProviderSettings } from "@/lib/chat/types"

function readProviderSettings(): ProviderSettings {
  if (typeof window === "undefined") {
    return { apiKey: "", baseURL: "", defaultModel: defaultImageModel }
  }
  const stored = window.localStorage.getItem(providerSettingsStorageKey)
  if (!stored) {
    return { apiKey: "", baseURL: "", defaultModel: defaultImageModel }
  }
  try {
    const parsed = JSON.parse(stored) as Partial<ProviderSettings>
    return {
      apiKey: parsed.apiKey || "",
      baseURL: parsed.baseURL || "",
      defaultModel: parsed.defaultModel?.trim() || defaultImageModel,
    }
  } catch {
    window.localStorage.removeItem(providerSettingsStorageKey)
    return { apiKey: "", baseURL: "", defaultModel: defaultImageModel }
  }
}

export function useProviderSettings() {
  const [settings, setSettings] = React.useState<ProviderSettings>(readProviderSettings)

  React.useEffect(() => {
    window.localStorage.setItem(
      providerSettingsStorageKey,
      JSON.stringify(settings),
    )
  }, [settings])

  const updateField = React.useCallback(
    (key: keyof ProviderSettings, value: string) => {
      setSettings((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const clearAll = React.useCallback(() => {
    window.localStorage.removeItem(providerSettingsStorageKey)
    setSettings({ apiKey: "", baseURL: "", defaultModel: defaultImageModel })
  }, [])

  return { settings, setSettings, updateField, clearAll }
}
