# Message Delete Confirmation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `AlertDialog` confirmation gate before single-message and selected-message deletion in the chat message list.

**Architecture:** Keep deletion business logic in `app/(app)/chat/page.tsx` unchanged. `MessageList` owns a local `pendingDelete` state, opens a single confirmation dialog for either single or selected deletion, and calls the existing callbacks only after the user confirms.

**Tech Stack:** Next.js App Router, React client components, TypeScript, existing `AlertDialog` UI primitive, Tailwind CSS.

---

## File Structure

- Modify `app/(app)/chat/_components/message-list.tsx`
  - Import existing alert dialog primitives.
  - Add local `PendingDelete` type and state.
  - Change single and selected delete button handlers to open confirmation.
  - Render one `AlertDialog` at the end of the list component.

No other files should change for implementation.

---

### Task 1: Gate MessageList deletes with AlertDialog

**Files:**
- Modify: `app/(app)/chat/_components/message-list.tsx`

- [ ] **Step 1: Import AlertDialog primitives**

Add this import after the existing `Button` import:

```ts
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
```

- [ ] **Step 2: Add local delete state type**

Add this type before `MessageListProps`:

```ts
type PendingDelete =
  | { type: "single"; turnId: string }
  | { type: "selected"; count: number }
  | null;
```

- [ ] **Step 3: Add state and confirm handler**

Inside `MessageList`, after `selectionMode`, add:

```ts
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete>(null);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "single") {
      onDeleteTurn(pendingDelete.turnId);
    } else {
      onDeleteSelectedTurns();
    }
    setPendingDelete(null);
  };
```

- [ ] **Step 4: Open confirmation for single delete**

Replace the `UserBubble` `onDeleteTurn` prop with:

```tsx
              onDeleteTurn={(turnId) =>
                setPendingDelete({ type: "single", turnId })
              }
```

- [ ] **Step 5: Open confirmation for selected delete**

Replace the selection bar Delete button `onClick` with:

```tsx
              onClick={() =>
                setPendingDelete({ type: "selected", count: selectedCount })
              }
```

- [ ] **Step 6: Render the dialog**

Before the outer scroll container closing `</div>`, render:

```tsx
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[12px] font-semibold text-ink">
              {pendingDelete?.type === "selected"
                ? `Delete ${pendingDelete.count} messages?`
                : "Delete message?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-0.5 text-[11px] leading-4 text-steel">
              {pendingDelete?.type === "selected"
                ? "This will permanently remove the selected message turns. This cannot be undone."
                : "This will permanently remove this message turn. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" className="h-7 text-[12px]!">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleConfirmDelete}
              className="h-7 bg-destructive text-[12px]! text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
```

- [ ] **Step 7: Verify**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both commands pass.

- [ ] **Step 8: Commit**

```bash
git add app/(app)/chat/_components/message-list.tsx docs/superpowers/plans/2026-06-02-message-delete-confirmation.md
git commit -m "feat: confirm message deletion"
```

---

## Self-Review

- Spec coverage: single delete confirmation, selected delete confirmation, cancel behavior, existing delete callbacks, and verification are covered.
- Placeholder scan: no unresolved placeholders or deferred work remains.
- Type consistency: `PendingDelete`, `pendingDelete`, and `handleConfirmDelete` are defined before use.
