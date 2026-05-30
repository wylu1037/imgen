# Prompt Template Management Design

## Summary

Add a personal prompt template library to Settings and make it usable from the chat composer through a slash-style picker. Templates are local to the browser and persisted through the app's existing SQLite/OPFS storage path.

## Goals

- Let users create, edit, and delete reusable prompt templates in Settings.
- Store only the required template fields: title and content, plus internal timestamps and id.
- Let users type `/` in the chat composer to search template titles and insert template content.
- Keep the implementation local, dependency-free, and consistent with the existing app data patterns.

## Non-goals

- No tags, folders, descriptions, favorites, sharing, import/export, or prompt variables.
- No global command palette or keyboard shortcut outside the chat composer.
- No changes to the existing sample prompts unless needed to avoid conflicts.

## Data model

Add a `PromptTemplate` type:

```ts
type PromptTemplate = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};
```

Add a `prompt_templates` SQLite table in `lib/chat/db-client.ts`:

- `id TEXT PRIMARY KEY`
- `title TEXT NOT NULL`
- `content TEXT NOT NULL DEFAULT ''`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`

Read templates ordered by `updated_at DESC` so recently edited templates appear first.

## State management

Create a `usePromptTemplates` hook that uses the existing chat database connection from `useChatHistory`, matching the `useConversations` dependency pattern:

- Accept `dbRef` and `dbReady` from `AppDataProvider`.
- Load templates from `ChatDb` when storage is ready.
- Expose `templates`, `status`, `addTemplate`, `saveTemplate`, and `deleteTemplate`.
- Keep updates optimistic in React state and persist them to SQLite.
- If the database is unavailable, expose an error status and keep the composer suggestions disabled rather than adding a separate localStorage fallback.

Add the hook to `AppDataProvider` so Settings and Chat can consume the same template list.

## Settings UI

Extend `SettingsDialog` with a new `Prompts` section in the sidebar.

The section includes:

- A list of saved templates.
- An Add Template button.
- Title input.
- Content textarea.
- Save and Delete actions.
- Empty state when no templates exist.

Templates may be empty in count. A template cannot be saved without a non-empty title; content can be empty while drafting, but empty content templates are not useful in the composer and should still render safely.

## Chat composer slash picker

Extend `Composer` with a prompt template picker:

- Open the picker when the current input fragment starts with `/`.
- Use the text after `/` to filter by template title, case-insensitively.
- Show all templates for a bare `/`.
- Enter or click inserts the selected template content.
- Escape closes the picker without changing the draft.
- Selection replaces only the active `/query` fragment, preserving surrounding text.
- If there are no templates, show a small empty state suggesting Settings.

The picker should live near the composer and reuse existing styling primitives. It should not add a new dependency.

## Error handling

- If template loading fails, Settings shows a small error state and the composer simply disables template suggestions.
- Deleting a selected template clears the local editor selection or selects the next available template.
- Saving trims the title and updates `updatedAt`.

## Testing and verification

Manual verification:

1. Open Settings → Prompts.
2. Create a template with title and content.
3. Edit and save it.
4. Delete it.
5. Refresh the page and confirm templates persist.
6. In chat, type `/`, filter by title, and insert a template.
7. Confirm `Esc` closes the picker and Enter selects an item.
8. Confirm the app behaves safely with zero templates.

Automated checks:

- `pnpm lint`
- `pnpm typecheck`

## Implementation notes

Keep the change surgical:

- Add only the prompt template data path needed by this feature.
- Keep slash picker logic inside the chat composer area.
- Avoid refactoring provider settings or unrelated storage code.
