"use client";

import * as React from "react";

import { openChatDb, type ChatDb } from "@/lib/chat/db-client";
import {
  defaultImageModel,
  modelOptions,
  providerSettingsStorageKey,
} from "@/lib/chat/constants";
import type {
  DbStatus,
  LegacyProviderSettings,
  ProviderConfig,
  ProviderSettings,
} from "@/lib/chat/types";

const defaultProviderName = "OpenAI";

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeModels(models: string[]): string[] {
  return Array.from(
    new Set(models.map((model) => model.trim()).filter(Boolean)),
  );
}

function createProvider(input: Partial<ProviderConfig> = {}): ProviderConfig {
  const now = Date.now();
  const models = normalizeModels(
    input.models?.length
      ? input.models
      : modelOptions.map((option) => option.value),
  );
  const defaultModel =
    input.defaultModel?.trim() || models[0] || defaultImageModel;

  return {
    id: input.id || generateId(),
    name: input.name?.trim() || defaultProviderName,
    apiKey: input.apiKey || "",
    baseURL: input.baseURL || "",
    models,
    defaultModel,
    notes: input.notes || "",
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeProvider(provider: ProviderConfig): ProviderConfig {
  const models = normalizeModels(provider.models);
  const defaultModel =
    provider.defaultModel.trim() || models[0] || defaultImageModel;
  const normalizedModels = models.includes(defaultModel)
    ? models
    : normalizeModels([defaultModel, ...models]);

  return {
    ...provider,
    name: provider.name.trim() || defaultProviderName,
    defaultModel,
    models: normalizedModels,
    updatedAt: Date.now(),
  };
}

function readStoredProviderSettings(): ProviderSettings | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(providerSettingsStorageKey);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<ProviderSettings> &
      Partial<LegacyProviderSettings>;

    if (Array.isArray(parsed.providers)) {
      const providers = parsed.providers.map((provider) =>
        createProvider(provider),
      );
      const activeProviderId =
        typeof parsed.activeProviderId === "string" &&
        providers.some((provider) => provider.id === parsed.activeProviderId)
          ? parsed.activeProviderId
          : providers[0]?.id || null;

      return { activeProviderId, providers };
    }

    const legacyDefaultModel = parsed.defaultModel?.trim() || defaultImageModel;
    const legacyProvider = createProvider({
      name: defaultProviderName,
      apiKey: parsed.apiKey || "",
      baseURL: parsed.baseURL || "",
      models: [
        legacyDefaultModel,
        ...modelOptions.map((option) => option.value),
      ],
      defaultModel: legacyDefaultModel,
    });

    return {
      activeProviderId: legacyProvider.id,
      providers: [legacyProvider],
    };
  } catch {
    window.localStorage.removeItem(providerSettingsStorageKey);
    return null;
  }
}

function writeStoredProviderSettings(settings: ProviderSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    providerSettingsStorageKey,
    JSON.stringify(settings),
  );
}

function defaultSettings(): ProviderSettings {
  const provider = createProvider();
  return { activeProviderId: provider.id, providers: [provider] };
}

export function useProviderSettings() {
  const dbRef = React.useRef<ChatDb | null>(null);
  const [status, setStatus] = React.useState<DbStatus>("idle");
  const [persistent, setPersistent] = React.useState(false);
  const [settings, setSettings] = React.useState<ProviderSettings>(
    () => readStoredProviderSettings() ?? defaultSettings(),
  );

  const syncSettings = React.useCallback(async (next: ProviderSettings) => {
    const db = dbRef.current;
    if (db) {
      await Promise.all(
        next.providers.map((provider) => db.upsertProvider(provider)),
      );
      await db.setActiveProviderId(next.activeProviderId);
    }

    if (!db?.persistent) {
      writeStoredProviderSettings(next);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    let db: ChatDb | null = null;

    async function load() {
      setStatus("loading");

      try {
        db = await openChatDb();
        if (cancelled) {
          await db.close();
          return;
        }

        dbRef.current = db;
        setPersistent(db.persistent);

        const [storedProviders, storedActiveProviderId] = await Promise.all([
          db.loadProviders(),
          db.loadActiveProviderId(),
        ]);

        let next = readStoredProviderSettings() ?? defaultSettings();

        if (db.persistent && storedProviders.length > 0) {
          const activeProviderId = storedProviders.some(
            (provider) => provider.id === storedActiveProviderId,
          )
            ? storedActiveProviderId
            : storedProviders[0]?.id || null;
          next = { activeProviderId, providers: storedProviders };
        } else if (storedProviders.length > 0) {
          const activeProviderId = storedProviders.some(
            (provider) => provider.id === storedActiveProviderId,
          )
            ? storedActiveProviderId
            : storedProviders[0]?.id || null;
          next = { activeProviderId, providers: storedProviders };
        } else {
          await Promise.all(
            next.providers.map((provider) => db!.upsertProvider(provider)),
          );
          await db.setActiveProviderId(next.activeProviderId);
        }

        if (cancelled) return;
        setSettings(next);
        if (!db.persistent) writeStoredProviderSettings(next);
        setStatus("ready");
      } catch (err) {
        console.error("[provider-settings] failed to load", err);
        if (cancelled) return;
        setStatus("error");
        setPersistent(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
      dbRef.current = null;
      if (db) void db.close();
    };
  }, []);

  const replaceSettings = React.useCallback(
    (next: ProviderSettings) => {
      setSettings(next);
      void syncSettings(next);
    },
    [syncSettings],
  );

  const setActiveProviderId = React.useCallback(
    (providerId: string) => {
      const next = settings.providers.some(
        (provider) => provider.id === providerId,
      )
        ? { ...settings, activeProviderId: providerId }
        : settings;
      replaceSettings(next);
    },
    [replaceSettings, settings],
  );

  const addProvider = React.useCallback(() => {
    const provider = createProvider({
      name: `Provider ${settings.providers.length + 1}`,
    });
    const next = {
      activeProviderId: provider.id,
      providers: [...settings.providers, provider],
    };
    replaceSettings(next);
    return provider;
  }, [replaceSettings, settings.providers]);

  const saveProvider = React.useCallback(
    (provider: ProviderConfig) => {
      const normalized = normalizeProvider(provider);
      const exists = settings.providers.some(
        (item) => item.id === normalized.id,
      );
      const providers = exists
        ? settings.providers.map((item) =>
            item.id === normalized.id ? normalized : item,
          )
        : [normalized, ...settings.providers];
      const next = {
        activeProviderId: normalized.id,
        providers,
      };
      replaceSettings(next);
    },
    [replaceSettings, settings.providers],
  );

  const deleteProvider = React.useCallback(
    (providerId: string) => {
      const db = dbRef.current;
      const remaining = settings.providers.filter(
        (provider) => provider.id !== providerId,
      );
      const providers = remaining.length > 0 ? remaining : [createProvider()];
      const activeProviderId =
        settings.activeProviderId === providerId
          ? providers[0]?.id || null
          : settings.activeProviderId;
      const next = { activeProviderId, providers };

      setSettings(next);
      void (async () => {
        if (db) {
          await db.deleteProvider(providerId);
          await Promise.all(
            providers.map((provider) => db.upsertProvider(provider)),
          );
          await db.setActiveProviderId(activeProviderId);
        }
        if (!db?.persistent) writeStoredProviderSettings(next);
      })();
    },
    [settings],
  );

  const clearAll = React.useCallback(() => {
    const next = defaultSettings();
    const db = dbRef.current;
    setSettings(next);
    window.localStorage.removeItem(providerSettingsStorageKey);
    void (async () => {
      if (db) {
        await db.clearProviders();
        await Promise.all(
          next.providers.map((provider) => db.upsertProvider(provider)),
        );
        await db.setActiveProviderId(next.activeProviderId);
      }
      if (!db?.persistent) writeStoredProviderSettings(next);
    })();
  }, []);

  const activeProvider = React.useMemo(
    () =>
      settings.providers.find(
        (provider) => provider.id === settings.activeProviderId,
      ) ||
      settings.providers[0] ||
      null,
    [settings],
  );

  return {
    status,
    persistent,
    providers: settings.providers,
    activeProvider,
    activeProviderId: activeProvider?.id || null,
    setActiveProviderId,
    createProvider: addProvider,
    saveProvider,
    deleteProvider,
    clearAll,
  };
}
