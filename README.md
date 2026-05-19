# imgen

A browser-first AI image workspace. Bring your own OpenAI-compatible API key, generate images through a chat-style interface, and keep history on-device.

## Features

- **Chat-style workspace** at `/chat`: each prompt produces an independent image, rendered inline as a message thread.
- **Per-request controls**: model, size, and quality are exposed as compact chip selectors above the composer.
- **Local-only persistence**: chat history lives in SQLite (WASM) backed by the browser's Origin Private File System (OPFS). No backend stores your prompts or images.
- **Bring your own credentials**: API key, base URL, and default model are kept in `localStorage` and sent to the server only at generation time.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start creating** to enter the chat workspace. Provide your API key in the **Settings** drawer before generating.

The `postinstall` / `predev` / `prebuild` hooks copy SQLite WASM runtime assets from `node_modules/@sqlite.org/sqlite-wasm/dist` into `public/sqlite-wasm/` so the worker can load them at runtime.

## Architecture notes

### Why COOP / COEP

The chat history database runs in the browser through `@sqlite.org/sqlite-wasm` with the OPFS VFS. OPFS access requires the page to be **cross-origin isolated**, which in turn requires these response headers on every document:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are applied globally in [`next.config.ts`](next.config.ts).

Consequence: any cross-origin resource the page loads must opt into being embedded (`Cross-Origin-Resource-Policy: cross-origin` or matching CORS). Generated images returned as URLs by the upstream model would fail to load under this policy, so `/api/generate` always materializes the image into a `data:` URI server-side before responding.

If `crossOriginIsolated` is false (rare browser extensions can strip COEP), the chat database falls back to an in-memory SQLite instance, history will reset on refresh, and a warning toast is shown.

### Persistence schema

Single `messages` table; one user row and one assistant row share a `turn_id`. Errors are stored as assistant rows with an `error` column, so failed generations remain visible after refresh.

## Future TODOs

- **Multi-turn iteration / image edit API.** Today every prompt is independent — there is no way to say "make the previous image warmer." Wiring OpenAI's image **edit / variations** endpoints would let a user reference a previous assistant message and refine it. This is the largest UX gap and the next major feature.
- **Image export and per-turn delete.** Right now history can only be cleared in bulk via the topbar.
- **Multi-tab safety.** Opening the workspace in two tabs simultaneously will cause the second OPFS open to fail; it currently falls back to `:memory:` silently for that tab.
- **Provider auth presets.** Streamline switching between OpenAI, Azure OpenAI, and other compatible endpoints.
