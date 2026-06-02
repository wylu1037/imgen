# Message Delete Confirmation Design

## Summary

Add a confirmation dialog before deleting messages from the chat message list. Both single-message deletion and selected-message batch deletion should require confirmation before calling the existing delete callbacks.

## Goals

- Prevent accidental deletion from the message list.
- Confirm both single user-message deletion and selected-turn batch deletion.
- Keep deletion business logic unchanged in the chat page.
- Keep the change localized to the message list UI.

## Non-goals

- No database changes.
- No undo flow.
- No changes to retry, edit, copy, tag, or conversation deletion behavior.
- No changes to which messages can be selected or deleted.

## Component boundary

Modify `app/(app)/chat/_components/message-list.tsx` only.

`MessageList` will own a local `pendingDelete` state:

```ts
type PendingDelete =
  | { type: "single"; turnId: string }
  | { type: "selected"; count: number }
  | null;
```

`UserBubble` and `ChatPage` keep their existing props and delete callbacks. `MessageList` intercepts delete button clicks before forwarding to those callbacks.

## Interaction design

Single delete:

1. User clicks a user message trash button.
2. `MessageList` stores `{ type: "single", turnId }`.
3. `AlertDialog` opens.
4. Cancel closes the dialog without deleting.
5. Delete calls `onDeleteTurn(turnId)` and closes the dialog.

Batch delete:

1. User selects one or more turns.
2. User clicks the sticky selection bar Delete button.
3. `MessageList` stores `{ type: "selected", count: selectedTurnIds.size }`.
4. `AlertDialog` opens.
5. Cancel closes the dialog and keeps selection unchanged.
6. Delete calls `onDeleteSelectedTurns()` and closes the dialog.

## Dialog copy

Single title:

- `Delete message?`

Batch title:

- `Delete {count} messages?`

Description:

- Single: `This will permanently remove this message turn. This cannot be undone.`
- Batch: `This will permanently remove the selected message turns. This cannot be undone.`

Actions:

- Cancel
- Delete

## Error handling

The dialog only gates the existing delete callbacks. Existing error handling in `ChatPage` remains responsible for showing delete failure toasts.

If the selected count changes while a batch confirmation dialog is open, the dialog keeps the count captured at click time. Confirming still calls `onDeleteSelectedTurns()`, which deletes the current selected set. This is acceptable because the selection UI remains visible and cancellation preserves state.

## Verification

Manual checks:

1. Click one user message delete button.
2. Confirm the dialog appears.
3. Click Cancel and verify the message remains.
4. Click the same delete button, confirm Delete, and verify the turn is removed.
5. Select multiple turns.
6. Click the selection bar Delete button.
7. Confirm the batch dialog appears with the selected count.
8. Click Cancel and verify selection remains.
9. Click Delete and verify selected turns are removed and selection clears.

Automated checks:

- `pnpm typecheck`
- `pnpm lint`
