# Prompt Template Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-local personal prompt template library in Settings and expose it from the chat composer through `/` title search and insertion.

**Architecture:** Extend the existing SQLite-backed `ChatDb` with a focused `prompt_templates` table and CRUD methods. Add a `usePromptTemplates` hook that shares the same `dbRef`/`dbReady` pattern as conversations, expose it through `AppDataProvider`, then wire Settings management and the chat composer slash picker to the shared state.

**Tech Stack:** Next.js App Router, React client components, TypeScript, SQLite WASM/OPFS, Tailwind CSS, existing shadcn-style UI primitives.

---

## File Structure

- Modify `lib/chat/types.ts`
  - Add the `PromptTemplate` type.
- Modify `lib/chat/db-client.ts`
  - Add `prompt_templates` schema.
  - Add row mapper and `ChatDb` CRUD methods for templates.
  - Include template count in storage info so the storage panel can surface it.
- Create `app/(app)/_hooks/use-prompt-templates.ts`
  - Own prompt template state and optimistic CRUD operations.
  - Depend on `dbRef`/`dbReady`, like `useConversations`.
- Modify `app/(app)/_context/app-data-context.tsx`
  - Create and expose the `promptTemplates` hook result.
- Modify `app/(app)/_components/workspace-sidebar.tsx`
  - Pass `promptTemplates` operations into `SettingsDialog`.
- Modify `app/(app)/_components/settings-dialog.tsx`
  - Add `Prompts` sidebar section.
  - Add `PromptsSection` with list, editor, create, save, delete, empty and error states.
  - Add prompt template count to the nav badge.
  - Add template count to Storage details.
- Create `app/(app)/chat/_components/prompt-template-picker.tsx`
  - Render the slash picker list and keyboard-friendly option buttons.
- Modify `app/(app)/chat/_components/composer.tsx`
  - Accept `promptTemplates` prop.
  - Detect active `/query` fragment by caret position.
  - Open/close picker, filter templates by title, insert selected content.
- Modify `app/(app)/chat/page.tsx`
  - Pass templates from `useAppData()` into `Composer`.

No new dependencies.

---

### Task 1: Add PromptTemplate storage support

**Files:**
- Modify: `lib/chat/types.ts`
- Modify: `lib/chat/db-client.ts`

- [ ] **Step 1: Add the `PromptTemplate` type**

In `lib/chat/types.ts`, add this type after `Tag`:

```ts
export type PromptTemplate = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};
```

- [ ] **Step 2: Extend db-client imports and storage info**

In `lib/chat/db-client.ts`, include `PromptTemplate` in the type import:

```ts
import type {
  ChatMessage,
  Conversation,
  NewChatMessage,
  PromptTemplate,
  ProviderConfig,
  Tag,
} from "./types";
```

Extend `StorageInfo` with a template count:

```ts
export type StorageInfo = {
  location: string;
  persistent: boolean;
  bytes: number;
  messageCount: number;
  providerCount: number;
  tagCount: number;
  conversationCount: number;
  promptTemplateCount: number;
};
```

- [ ] **Step 3: Add the SQLite table**

In `SCHEMA_SQL`, after the `providers` table and its index, add:

```sql
  CREATE TABLE IF NOT EXISTS prompt_templates (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_prompt_templates_updated_at ON prompt_templates(updated_at);
```

Keep `TARGET_USER_VERSION` unchanged. This is a new table created by `CREATE TABLE IF NOT EXISTS`, matching the existing v4 tags pattern.

- [ ] **Step 4: Extend `ChatDb` with template methods**

In the `ChatDb` interface, add these methods after provider methods:

```ts
  loadPromptTemplates: () => Promise<PromptTemplate[]>;
  upsertPromptTemplate: (template: PromptTemplate) => Promise<void>;
  deletePromptTemplate: (templateId: string) => Promise<void>;
  clearPromptTemplates: () => Promise<void>;
```

- [ ] **Step 5: Add a row mapper**

After `rowToProvider`, add:

```ts
function rowToPromptTemplate(row: Row): PromptTemplate {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    content: String(row.content || ""),
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  };
}
```

- [ ] **Step 6: Implement template methods in the returned `ChatDb` object**

After `clearProviders`, add:

```ts
    async loadPromptTemplates() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, title, content, created_at, updated_at
          FROM prompt_templates
          ORDER BY updated_at DESC, created_at DESC, id ASC
        `,
      );
      return resultRows.map(rowToPromptTemplate);
    },

    async upsertPromptTemplate(template) {
      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO prompt_templates (id, title, content, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            updated_at = excluded.updated_at
        `,
        bind: [
          template.id,
          template.title,
          template.content,
          template.createdAt,
          template.updatedAt,
        ],
      });
    },

    async deletePromptTemplate(templateId) {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM prompt_templates WHERE id = ?",
        bind: [templateId],
      });
    },

    async clearPromptTemplates() {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM prompt_templates",
      });
    },
```

- [ ] **Step 7: Include templates in storage info**

Inside `getStorageInfo`, after `conversationRows`, add:

```ts
      const promptTemplateRows = await selectRows(
        promiser,
        dbId,
        "SELECT COUNT(*) AS n FROM prompt_templates",
      );
```

Return the new count:

```ts
        promptTemplateCount: toNumber(promptTemplateRows[0]?.n ?? 0),
```

Place it after `conversationCount` in the returned object.

- [ ] **Step 8: Typecheck this storage layer**

Run:

```bash
pnpm typecheck
```

Expected: TypeScript succeeds or reports only errors caused by later tasks not being implemented yet. If it reports missing `promptTemplateCount` consumers, continue to Task 2 and Task 3 before re-running.

- [ ] **Step 9: Commit Task 1**

```bash
git add lib/chat/types.ts lib/chat/db-client.ts
git commit -m "feat: add prompt template storage"
```

---

### Task 2: Add prompt template hook and app context

**Files:**
- Create: `app/(app)/_hooks/use-prompt-templates.ts`
- Modify: `app/(app)/_context/app-data-context.tsx`

- [ ] **Step 1: Create the hook file**

Create `app/(app)/_hooks/use-prompt-templates.ts` with:

```ts
"use client";

import * as React from "react";

import type { ChatDb } from "@/lib/chat/db-client";
import type { DbStatus, PromptTemplate } from "@/lib/chat/types";

export type PromptTemplateDraft = Pick<PromptTemplate, "title" | "content">;

type UsePromptTemplatesArgs = {
  dbRef: React.MutableRefObject<ChatDb | null>;
  dbReady: boolean;
};

type UsePromptTemplates = {
  status: DbStatus;
  templates: PromptTemplate[];
  createTemplate: () => PromptTemplate;
  saveTemplate: (template: PromptTemplate) => Promise<PromptTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortTemplates(list: PromptTemplate[]): PromptTemplate[] {
  return [...list].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
    if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
    return a.id.localeCompare(b.id);
  });
}

export function usePromptTemplates({
  dbRef,
  dbReady,
}: UsePromptTemplatesArgs): UsePromptTemplates {
  const [status, setStatus] = React.useState<DbStatus>("idle");
  const [templates, setTemplates] = React.useState<PromptTemplate[]>([]);

  React.useEffect(() => {
    if (!dbReady) return;
    const db = dbRef.current;
    if (!db) return;
    let cancelled = false;
    setStatus("loading");
    db.loadPromptTemplates()
      .then((rows) => {
        if (cancelled) return;
        setTemplates(sortTemplates(rows));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[usePromptTemplates] failed to load", err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [dbRef, dbReady]);

  const createTemplate = React.useCallback(() => {
    const now = Date.now();
    const template: PromptTemplate = {
      id: generateId(),
      title: "Untitled prompt",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setTemplates((current) => sortTemplates([template, ...current]));
    const db = dbRef.current;
    if (db) {
      void db.upsertPromptTemplate(template).catch((err) => {
        console.error("[usePromptTemplates] failed to create", err);
        setStatus("error");
      });
    }
    return template;
  }, [dbRef]);

  const saveTemplate = React.useCallback(
    async (template: PromptTemplate) => {
      const db = dbRef.current;
      const title = template.title.trim();
      if (!db || !title) return null;
      const next: PromptTemplate = {
        ...template,
        title,
        updatedAt: Date.now(),
      };
      setTemplates((current) =>
        sortTemplates(
          current.some((item) => item.id === next.id)
            ? current.map((item) => (item.id === next.id ? next : item))
            : [next, ...current],
        ),
      );
      await db.upsertPromptTemplate(next);
      setStatus("ready");
      return next;
    },
    [dbRef],
  );

  const deleteTemplate = React.useCallback(
    async (templateId: string) => {
      const db = dbRef.current;
      if (!db) return;
      setTemplates((current) =>
        current.filter((template) => template.id !== templateId),
      );
      await db.deletePromptTemplate(templateId);
    },
    [dbRef],
  );

  const clearAll = React.useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    setTemplates([]);
    await db.clearPromptTemplates();
  }, [dbRef]);

  return {
    status,
    templates,
    createTemplate,
    saveTemplate,
    deleteTemplate,
    clearAll,
  };
}
```

- [ ] **Step 2: Wire the hook into app data context**

In `app/(app)/_context/app-data-context.tsx`, add the import:

```ts
import { usePromptTemplates } from "../_hooks/use-prompt-templates";
```

Add the type alias:

```ts
type PromptTemplates = ReturnType<typeof usePromptTemplates>;
```

Add it to `AppDataContextValue`:

```ts
  promptTemplates: PromptTemplates;
```

Inside `AppDataProvider`, create the hook after `useConversations`:

```ts
  const promptTemplates = usePromptTemplates({
    dbRef: chatHistory.dbRef,
    dbReady: chatHistory.dbReady,
  });
```

Include it in the memoized context value:

```ts
      promptTemplates,
```

Include it in the dependency array:

```ts
      promptTemplates,
```

- [ ] **Step 3: Typecheck app context wiring**

Run:

```bash
pnpm typecheck
```

Expected: TypeScript succeeds or only reports missing UI props from upcoming tasks.

- [ ] **Step 4: Commit Task 2**

```bash
git add "app/(app)/_hooks/use-prompt-templates.ts" "app/(app)/_context/app-data-context.tsx"
git commit -m "feat: add prompt template state"
```

---

### Task 3: Add Settings prompt template management UI

**Files:**
- Modify: `app/(app)/_components/workspace-sidebar.tsx`
- Modify: `app/(app)/_components/settings-dialog.tsx`

- [ ] **Step 1: Pass prompt template state into `SettingsDialog`**

In `app/(app)/_components/workspace-sidebar.tsx`, destructure `promptTemplates` from `useAppData()`:

```ts
  const {
    providerSettings,
    conversations,
    promptTemplates,
    setSelectedTurn,
  } = useAppData();
```

Pass it to `SettingsDialog`:

```tsx
          promptTemplates={promptTemplates}
```

Place this prop near the provider props.

- [ ] **Step 2: Update Settings imports and prop types**

In `app/(app)/_components/settings-dialog.tsx`, add icons and textarea/type imports:

```ts
  FileText,
  Pencil,
  Save,
```

Add:

```ts
import { Textarea } from "@/components/ui/textarea";
import type { DbStatus, PromptTemplate } from "@/lib/chat/types";
```

Replace the existing type-only import:

```ts
import type { ProviderConfig } from "@/lib/chat/types";
```

with:

```ts
import type { DbStatus, PromptTemplate, ProviderConfig } from "@/lib/chat/types";
```

Add this helper type near `SettingsDialogProps`:

```ts
type PromptTemplatesController = {
  status: DbStatus;
  templates: PromptTemplate[];
  createTemplate: () => PromptTemplate;
  saveTemplate: (template: PromptTemplate) => Promise<PromptTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
};
```

Add a prop to `SettingsDialogProps`:

```ts
  promptTemplates: PromptTemplatesController;
```

- [ ] **Step 3: Add the Prompts section**

Change the section union:

```ts
type Section = "profile" | "provider" | "prompts" | "appearance" | "storage";
```

Add to `SECTIONS` after Provider:

```ts
  { id: "prompts", label: "Prompts", icon: FileText },
```

Destructure `promptTemplates` in `SettingsDialog` props:

```ts
  promptTemplates,
```

Change the nav count expression:

```ts
              const count =
                id === "provider"
                  ? providers.length
                  : id === "prompts"
                    ? promptTemplates.templates.length
                    : null;
```

Change the content switch to include Prompts:

```tsx
              {section === "provider" ? (
                <ProviderSection ... />
              ) : section === "prompts" ? (
                <PromptsSection controller={promptTemplates} />
              ) : section === "appearance" ? (
```

Keep the existing `ProviderSection` props unchanged inside the `ProviderSection` block.

- [ ] **Step 4: Add `PromptsSection`**

Add this component before `AppearanceSection`:

```tsx
type PromptDraft = Pick<PromptTemplate, "id" | "title" | "content" | "createdAt" | "updatedAt">;

function PromptsSection({
  controller,
}: {
  controller: PromptTemplatesController;
}) {
  const { status, templates, createTemplate, saveTemplate, deleteTemplate } =
    controller;
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selectedTemplate =
    templates.find((template) => template.id === selectedId) ?? templates[0] ?? null;
  const [draft, setDraft] = React.useState<PromptDraft | null>(selectedTemplate);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!selectedTemplate) {
      setDraft(null);
      setSelectedId(null);
      return;
    }
    setSelectedId(selectedTemplate.id);
    setDraft(selectedTemplate);
  }, [selectedTemplate?.id, selectedTemplate]);

  const handleCreate = () => {
    const next = createTemplate();
    setSelectedId(next.id);
    setDraft(next);
  };

  const handleSave = async () => {
    if (!draft || !draft.title.trim()) return;
    setSaving(true);
    try {
      const saved = await saveTemplate(draft);
      if (saved) {
        setSelectedId(saved.id);
        setDraft(saved);
        toast.success("Prompt template saved.");
      }
    } catch (err) {
      console.error("[settings] failed to save prompt template", err);
      toast.error("Failed to save prompt template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft) return;
    setDeleting(true);
    try {
      await deleteTemplate(draft.id);
      const next = templates.find((template) => template.id !== draft.id) ?? null;
      setSelectedId(next?.id ?? null);
      setDraft(next);
      toast.success("Prompt template deleted.");
    } catch (err) {
      console.error("[settings] failed to delete prompt template", err);
      toast.error("Failed to delete prompt template.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[12px] font-semibold text-ink">Prompts</h3>
          <p className="mt-0.5 text-[11px] leading-4 text-steel">
            Manage reusable prompt templates for the chat composer.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCreate}
          disabled={status === "loading"}
          className="h-7 shrink-0 px-2 text-[11px] [&_svg]:size-3.5"
        >
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>

      {status === "error" ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/3 p-3 text-[11px] leading-4 text-destructive">
          Failed to load prompt templates.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="grid max-h-80 gap-1 overflow-y-auto rounded-lg border border-hairline-soft bg-card p-1.5">
          {templates.length === 0 ? (
            <div className="px-2 py-8 text-center text-[11px] leading-4 text-steel">
              No prompt templates yet.
            </div>
          ) : (
            templates.map((template) => {
              const active = template.id === draft?.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(template.id);
                    setDraft(template);
                  }}
                  className={cn(
                    "rounded-md px-2 py-2 text-left transition-colors duration-150 ease-out focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                    active
                      ? "bg-tint-lavender text-brand-purple-800"
                      : "text-charcoal hover:bg-tint-gray",
                  )}
                >
                  <span className="block truncate text-[12px] font-medium">
                    {template.title || "Untitled prompt"}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-steel">
                    {template.content || "Empty template"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="grid gap-3 rounded-lg border border-hairline-soft bg-card p-3">
          {draft ? (
            <>
              <div className="grid gap-1.5">
                <Label
                  htmlFor="prompt-template-title"
                  className="text-[11px] font-medium tracking-wide text-steel"
                >
                  Title
                </Label>
                <Input
                  id="prompt-template-title"
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  placeholder="Product photo"
                  autoComplete="off"
                  className="h-9 px-3 text-[13px] md:text-[12px]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="prompt-template-content"
                  className="text-[11px] font-medium tracking-wide text-steel"
                >
                  Content
                </Label>
                <Textarea
                  id="prompt-template-content"
                  value={draft.content}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, content: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Describe the reusable prompt..."
                  className="min-h-32 resize-y px-3 py-2 text-[13px] leading-relaxed md:text-[12px]"
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleDelete()}
                  disabled={deleting || saving}
                  className="h-7 text-[12px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={!draft.title.trim() || saving || deleting}
                  className="h-7 text-[12px]"
                >
                  {saving ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Save data-icon="inline-start" />
                  )}
                  Save
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center text-center text-[11px] leading-4 text-steel">
              <Pencil className="mb-2 size-4" />
              Add a prompt template to start building your library.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Add prompt template count to Storage**

In `StorageSection`, add a row after Tags:

```tsx
        <StorageRow
          label="Prompt templates"
          value={info ? info.promptTemplateCount.toLocaleString() : "—"}
        />
```

Change the reset description to mention prompt templates:

```tsx
            description="Wipe chat history, prompt templates, AND remove all providers/API keys. Settings revert to defaults."
```

Update `handleReset` to clear prompt templates. First destructure in `StorageSection`:

```ts
  const { chatHistory, providerSettings, promptTemplates } = useAppData();
```

Then add inside the reset try block:

```ts
      await promptTemplates.clearAll();
```

Place it after `await clearChat();` and before `clearProviders();`.

- [ ] **Step 6: Typecheck Settings UI**

Run:

```bash
pnpm typecheck
```

Expected: TypeScript succeeds or only reports missing composer prompt template props from upcoming Task 4.

- [ ] **Step 7: Commit Task 3**

```bash
git add "app/(app)/_components/workspace-sidebar.tsx" "app/(app)/_components/settings-dialog.tsx"
git commit -m "feat: manage prompt templates in settings"
```

---

### Task 4: Add slash picker to chat composer

**Files:**
- Create: `app/(app)/chat/_components/prompt-template-picker.tsx`
- Modify: `app/(app)/chat/_components/composer.tsx`
- Modify: `app/(app)/chat/page.tsx`

- [ ] **Step 1: Create the picker component**

Create `app/(app)/chat/_components/prompt-template-picker.tsx`:

```tsx
"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { motion } from "motion/react";

import type { PromptTemplate } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type PromptTemplatePickerProps = {
  templates: PromptTemplate[];
  query: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onPick: (template: PromptTemplate) => void;
};

export function filterPromptTemplates(
  templates: PromptTemplate[],
  query: string,
): PromptTemplate[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return templates;
  return templates.filter((template) =>
    template.title.toLocaleLowerCase().includes(normalized),
  );
}

export function PromptTemplatePicker({
  templates,
  query,
  activeIndex,
  onActiveIndexChange,
  onPick,
}: PromptTemplatePickerProps) {
  const filtered = React.useMemo(
    () => filterPromptTemplates(templates, query),
    [templates, query],
  );

  React.useEffect(() => {
    if (filtered.length === 0) return;
    if (activeIndex >= filtered.length) onActiveIndexChange(0);
  }, [activeIndex, filtered.length, onActiveIndexChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute right-3 bottom-[calc(100%-0.5rem)] left-3 z-20 overflow-hidden rounded-xl border border-hairline-soft bg-card shadow-[0_18px_44px_-18px_rgba(15,15,15,0.24),0_8px_20px_-12px_rgba(15,15,15,0.16)]"
    >
      <div className="border-b border-hairline-soft px-3 py-2 text-[11px] text-steel">
        {query.trim() ? `Prompt templates matching “${query.trim()}”` : "Prompt templates"}
      </div>

      {templates.length === 0 ? (
        <div className="px-3 py-5 text-center text-[11px] leading-4 text-steel">
          Add prompt templates in Settings to use `/` insertion.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-3 py-5 text-center text-[11px] leading-4 text-steel">
          No prompt template matches this title.
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto p-1.5">
          {filtered.map((template, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={template.id}
                type="button"
                onMouseEnter={() => onActiveIndexChange(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onPick(template);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ease-out",
                  active ? "bg-tint-lavender" : "hover:bg-tint-gray",
                )}
              >
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-tint-cream text-stone">
                  <FileText className="size-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink">
                    {template.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-steel">
                    {template.content || "Empty template"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Add slash fragment helpers to composer**

In `app/(app)/chat/_components/composer.tsx`, import the picker and type:

```ts
import type { PromptTemplate } from "@/lib/chat/types";
```

```ts
import {
  filterPromptTemplates,
  PromptTemplatePicker,
} from "./prompt-template-picker";
```

Add this helper above `ComposerProps`:

```ts
type SlashFragment = {
  start: number;
  end: number;
  query: string;
};

function getSlashFragment(value: string, caret: number): SlashFragment | null {
  const beforeCaret = value.slice(0, caret);
  const lineStart = Math.max(
    beforeCaret.lastIndexOf("\n") + 1,
    beforeCaret.lastIndexOf(" ") + 1,
  );
  const fragment = value.slice(lineStart, caret);
  if (!fragment.startsWith("/")) return null;
  if (fragment.slice(1).includes("/")) return null;
  return { start: lineStart, end: caret, query: fragment.slice(1) };
}
```

- [ ] **Step 3: Extend composer props**

Add to `ComposerProps`:

```ts
  promptTemplates: PromptTemplate[];
```

Destructure in `Composer`:

```ts
  promptTemplates,
```

- [ ] **Step 4: Track picker state and insertion**

Inside `Composer`, after `canSubmit`, add:

```ts
  const [slashFragment, setSlashFragment] = React.useState<SlashFragment | null>(
    null,
  );
  const [activeTemplateIndex, setActiveTemplateIndex] = React.useState(0);
  const filteredTemplates = React.useMemo(
    () =>
      slashFragment
        ? filterPromptTemplates(promptTemplates, slashFragment.query)
        : [],
    [promptTemplates, slashFragment],
  );
  const pickerOpen = slashFragment !== null;

  const refreshSlashFragment = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const fragment = getSlashFragment(draft, textarea.selectionStart);
    setSlashFragment(fragment);
    setActiveTemplateIndex(0);
  }, [draft, textareaRef]);

  const insertTemplate = React.useCallback(
    (template: PromptTemplate) => {
      if (!slashFragment) return;
      const next =
        draft.slice(0, slashFragment.start) +
        template.content +
        draft.slice(slashFragment.end);
      const caret = slashFragment.start + template.content.length;
      onDraftChange(next);
      setSlashFragment(null);
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(caret, caret);
      });
    },
    [draft, onDraftChange, slashFragment, textareaRef],
  );
```

- [ ] **Step 5: Update key handling**

Replace `handleKeyDown` with:

```ts
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSlashFragment(null);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveTemplateIndex((current) =>
          filteredTemplates.length === 0
            ? 0
            : (current + 1) % filteredTemplates.length,
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveTemplateIndex((current) =>
          filteredTemplates.length === 0
            ? 0
            : (current - 1 + filteredTemplates.length) % filteredTemplates.length,
        );
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        const template = filteredTemplates[activeTemplateIndex];
        if (template) {
          event.preventDefault();
          insertTemplate(template);
          return;
        }
      }
    }

    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    if (canSubmit) onSubmit();
  };
```

- [ ] **Step 6: Update textarea events**

Change the textarea `onChange` to:

```tsx
          onChange={(event) => {
            onDraftChange(event.target.value);
            queueMicrotask(refreshSlashFragment);
          }}
```

Add `onClick` and `onKeyUp`:

```tsx
          onClick={refreshSlashFragment}
          onKeyUp={(event) => {
            if (
              event.key === "ArrowDown" ||
              event.key === "ArrowUp" ||
              event.key === "Enter" ||
              event.key === "Escape"
            ) {
              return;
            }
            refreshSlashFragment();
          }}
```

- [ ] **Step 7: Render the picker**

Inside `InputGroup`, after `<GeneratingStripe active={isGenerating} />`, add:

```tsx
        <AnimatePresence>
          {pickerOpen ? (
            <PromptTemplatePicker
              templates={promptTemplates}
              query={slashFragment.query}
              activeIndex={activeTemplateIndex}
              onActiveIndexChange={setActiveTemplateIndex}
              onPick={insertTemplate}
            />
          ) : null}
        </AnimatePresence>
```

- [ ] **Step 8: Pass templates from chat page**

In `app/(app)/chat/page.tsx`, destructure `promptTemplates` from `useAppData()`:

```ts
  const {
    chatHistory,
    providerSettings,
    conversations,
    promptTemplates,
    getSelectedTurn,
    setSelectedTurn,
  } = useAppData();
```

Pass templates to `Composer`:

```tsx
            promptTemplates={promptTemplates.templates}
```

- [ ] **Step 9: Typecheck and lint slash picker**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both commands pass.

- [ ] **Step 10: Commit Task 4**

```bash
git add "app/(app)/chat/_components/prompt-template-picker.tsx" "app/(app)/chat/_components/composer.tsx" "app/(app)/chat/page.tsx"
git commit -m "feat: insert prompt templates from composer"
```

---

### Task 5: Manual verification in the running app

**Files:**
- No source changes expected unless verification finds a bug.

- [ ] **Step 1: Start the app**

Run:

```bash
pnpm dev
```

Expected: Next.js starts locally without compile errors.

- [ ] **Step 2: Verify Settings → Prompts empty state**

Open the app in a browser and open Settings.

Expected:

- Sidebar includes `Prompts`.
- Prompts section shows `No prompt templates yet.` when empty.
- Add button is enabled after storage loads.

- [ ] **Step 3: Verify create and save**

In Settings → Prompts:

1. Click `Add`.
2. Set title to `Studio photo`.
3. Set content to `Studio photograph of a ceramic coffee cup on linen, soft morning light`.
4. Click `Save`.

Expected:

- Success toast appears.
- Template appears in list with title and content preview.
- Prompts nav count increments.

- [ ] **Step 4: Verify persistence**

Refresh the page, reopen Settings → Prompts.

Expected:

- `Studio photo` is still listed.
- Title and content are unchanged.

- [ ] **Step 5: Verify slash insertion**

In chat composer:

1. Type `/stu`.
2. Confirm picker shows `Studio photo`.
3. Press Enter.

Expected:

- `/stu` is replaced by `Studio photograph of a ceramic coffee cup on linen, soft morning light`.
- Textarea remains focused.

- [ ] **Step 6: Verify picker keyboard behavior**

In chat composer:

1. Type `/`.
2. Use ArrowDown and ArrowUp.
3. Press Escape.

Expected:

- Active item moves with arrow keys.
- Escape closes the picker.
- Draft text remains unchanged after Escape.

- [ ] **Step 7: Verify delete**

In Settings → Prompts:

1. Select `Studio photo`.
2. Click `Delete`.

Expected:

- Success toast appears.
- Template disappears.
- Slash picker shows empty state or no longer shows that template.

- [ ] **Step 8: Run final checks**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both commands pass.

- [ ] **Step 9: Commit verification fixes if any**

If source changes were needed during verification:

```bash
git add <changed-files>
git commit -m "fix: polish prompt template management"
```

If no source changes were needed, do not create an empty commit.

---

## Self-Review

- Spec coverage:
  - SQLite `prompt_templates` table and CRUD are covered by Task 1.
  - Shared React state through `AppDataProvider` is covered by Task 2.
  - Settings create/edit/delete UI is covered by Task 3.
  - Composer `/` picker, title filtering, Enter/Escape, and fragment replacement are covered by Task 4.
  - Manual persistence and UI verification are covered by Task 5.
- Placeholder scan:
  - No unresolved placeholders or vague deferred work remains.
- Type consistency:
  - `PromptTemplate`, `promptTemplates`, `loadPromptTemplates`, `upsertPromptTemplate`, `deletePromptTemplate`, and `clearPromptTemplates` are defined before later tasks use them.
