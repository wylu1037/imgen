import type { ChatMessage, NewChatMessage, ProviderConfig } from "./types"

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS messages (
    id             TEXT PRIMARY KEY,
    turn_id        TEXT NOT NULL,
    role           TEXT NOT NULL,
    content        TEXT NOT NULL DEFAULT '',
    image_data     TEXT,
    model          TEXT,
    size           TEXT,
    quality        TEXT,
    revised_prompt TEXT,
    error          TEXT,
    created_at     INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_turn ON messages(turn_id);

  CREATE TABLE IF NOT EXISTS providers (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    api_key       TEXT NOT NULL DEFAULT '',
    base_url      TEXT NOT NULL DEFAULT '',
    models_json   TEXT NOT NULL,
    default_model TEXT NOT NULL,
    notes         TEXT NOT NULL DEFAULT '',
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_providers_updated_at ON providers(updated_at);

  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  PRAGMA user_version = 2;
`

const WORKER_URL = "/sqlite-wasm/sqlite3-worker1.mjs"
const ACTIVE_PROVIDER_KEY = "active_provider_id"

export interface ChatDb {
  insert: (msg: NewChatMessage) => Promise<ChatMessage>
  loadAll: () => Promise<ChatMessage[]>
  deleteTurn: (turnId: string) => Promise<void>
  clearAll: () => Promise<void>
  loadProviders: () => Promise<ProviderConfig[]>
  upsertProvider: (provider: ProviderConfig) => Promise<void>
  deleteProvider: (providerId: string) => Promise<void>
  clearProviders: () => Promise<void>
  loadActiveProviderId: () => Promise<string | null>
  setActiveProviderId: (providerId: string | null) => Promise<void>
  close: () => Promise<void>
  readonly persistent: boolean
}

type Row = Record<string, string | number | null>

type WorkerOutbound = {
  type: string
  messageId?: string
  result?: unknown
  dbId?: string
}

type ExecResult = {
  resultRows?: Row[]
}

type OpenResult = {
  dbId?: string
  vfs?: string
  persistent?: boolean
}

type Pending = {
  resolve: (value: WorkerOutbound) => void
  reject: (reason: Error) => void
}

class Promiser {
  private worker: Worker
  private pending = new Map<string, Pending>()
  private counter = 0
  private readyResolve!: () => void
  private readyReject!: (err: Error) => void
  readonly ready: Promise<void>

  constructor() {
    this.worker = new Worker(WORKER_URL, { type: "module" })
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve
      this.readyReject = reject
    })
    this.worker.addEventListener("message", this.handleMessage)
    this.worker.addEventListener("error", (event) => {
      const err = new Error(event.message || "sqlite worker error")
      this.readyReject(err)
      for (const pending of this.pending.values()) {
        pending.reject(err)
      }
      this.pending.clear()
    })
  }

  private handleMessage = (event: MessageEvent) => {
    const data = event.data as WorkerOutbound | undefined
    if (!data || typeof data !== "object") return

    if (data.type === "sqlite3-api" && data.result === "worker1-ready") {
      this.readyResolve()
      return
    }

    const messageId = data.messageId
    if (!messageId) return
    const pending = this.pending.get(messageId)
    if (!pending) return
    this.pending.delete(messageId)

    if (data.type === "error") {
      const result = data.result as { message?: string } | undefined
      pending.reject(new Error(result?.message || "sqlite worker error"))
      return
    }
    pending.resolve(data)
  }

  send(type: string, args: Record<string, unknown>): Promise<WorkerOutbound> {
    this.counter += 1
    const messageId = `${type}#${this.counter}`
    return new Promise<WorkerOutbound>((resolve, reject) => {
      this.pending.set(messageId, { resolve, reject })
      this.worker.postMessage({ type, args, messageId })
    })
  }

  terminate() {
    this.worker.removeEventListener("message", this.handleMessage)
    this.worker.terminate()
  }
}

function rowToMessage(row: Row): ChatMessage {
  return {
    id: String(row.id),
    turnId: String(row.turn_id),
    role: row.role === "assistant" ? "assistant" : "user",
    content: typeof row.content === "string" ? row.content : "",
    imageData: row.image_data == null ? null : String(row.image_data),
    model: row.model == null ? null : String(row.model),
    size: row.size == null ? null : String(row.size),
    quality: row.quality == null ? null : String(row.quality),
    revisedPrompt:
      row.revised_prompt == null ? null : String(row.revised_prompt),
    error: row.error == null ? null : String(row.error),
    createdAt:
      typeof row.created_at === "number"
        ? row.created_at
        : Number(row.created_at) || 0,
  }
}

function rowToProvider(row: Row): ProviderConfig {
  const models = parseModels(row.models_json)
  const defaultModel = String(row.default_model || "").trim() || models[0] || ""

  return {
    id: String(row.id),
    name: String(row.name || ""),
    apiKey: String(row.api_key || ""),
    baseURL: String(row.base_url || ""),
    models,
    defaultModel,
    notes: String(row.notes || ""),
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  }
}

function parseModels(value: string | number | null): string[] {
  if (typeof value !== "string") return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((model): model is string => typeof model === "string")
      .map((model) => model.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function toNumber(value: string | number | null): number {
  return typeof value === "number" ? value : Number(value) || 0
}

function getResultRows(response: WorkerOutbound): Row[] {
  const result = response.result as ExecResult | undefined
  return Array.isArray(result?.resultRows) ? result.resultRows : []
}

async function selectRows(
  promiser: Promiser,
  dbId: string,
  sql: string,
  bind?: unknown[],
): Promise<Row[]> {
  const response = await promiser.send("exec", {
    dbId,
    sql,
    bind,
    rowMode: "object",
    resultRows: [],
  })
  return getResultRows(response)
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

async function openDb(
  promiser: Promiser,
  filename: string,
): Promise<{ dbId: string; vfs?: string; persistent?: boolean }> {
  const response = await promiser.send("open", { filename })
  const result = response.result as OpenResult | undefined
  const dbId = result?.dbId ?? response.dbId
  if (!dbId) {
    throw new Error("sqlite worker did not return a dbId")
  }
  return { dbId, vfs: result?.vfs, persistent: result?.persistent }
}

export async function openChatDb(): Promise<ChatDb> {
  if (typeof window === "undefined") {
    throw new Error("openChatDb must be called in the browser")
  }

  const isolated =
    typeof self !== "undefined" &&
    (self as { crossOriginIsolated?: boolean }).crossOriginIsolated === true

  const promiser = new Promiser()
  await promiser.ready

  let dbId: string
  let persistent = false

  if (isolated) {
    try {
      const opened = await openDb(promiser, "file:imgen.sqlite?vfs=opfs")
      dbId = opened.dbId
      persistent = opened.persistent === true
    } catch (err) {
      console.warn("[chat-db] OPFS open failed, falling back to :memory:", err)
      const opened = await openDb(promiser, ":memory:")
      dbId = opened.dbId
    }
  } else {
    console.warn(
      "[chat-db] crossOriginIsolated is false, falling back to :memory:",
    )
    const opened = await openDb(promiser, ":memory:")
    dbId = opened.dbId
  }

  await promiser.send("exec", { dbId, sql: SCHEMA_SQL })

  return {
    persistent,

    async insert(msg) {
      const id = generateId()
      const createdAt = Date.now()
      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO messages (
            id, turn_id, role, content, image_data,
            model, size, quality, revised_prompt, error, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        bind: [
          id,
          msg.turnId,
          msg.role,
          msg.content,
          msg.imageData,
          msg.model,
          msg.size,
          msg.quality,
          msg.revisedPrompt,
          msg.error,
          createdAt,
        ],
      })
      return { id, createdAt, ...msg }
    },

    async loadAll() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, turn_id, role, content, image_data,
                 model, size, quality, revised_prompt, error, created_at
          FROM messages
          ORDER BY created_at ASC, id ASC
        `,
      )
      return resultRows.map(rowToMessage)
    },

    async deleteTurn(turnId) {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM messages WHERE turn_id = ?",
        bind: [turnId],
      })
    },

    async clearAll() {
      await promiser.send("exec", { dbId, sql: "DELETE FROM messages" })
    },

    async loadProviders() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, name, api_key, base_url, models_json,
                 default_model, notes, created_at, updated_at
          FROM providers
          ORDER BY updated_at DESC, created_at DESC, id ASC
        `,
      )
      return resultRows.map(rowToProvider)
    },

    async upsertProvider(provider) {
      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO providers (
            id, name, api_key, base_url, models_json,
            default_model, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            api_key = excluded.api_key,
            base_url = excluded.base_url,
            models_json = excluded.models_json,
            default_model = excluded.default_model,
            notes = excluded.notes,
            updated_at = excluded.updated_at
        `,
        bind: [
          provider.id,
          provider.name,
          provider.apiKey,
          provider.baseURL,
          JSON.stringify(provider.models),
          provider.defaultModel,
          provider.notes,
          provider.createdAt,
          provider.updatedAt,
        ],
      })
    },

    async deleteProvider(providerId) {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM providers WHERE id = ?",
        bind: [providerId],
      })
    },

    async clearProviders() {
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM providers;
          DELETE FROM app_settings WHERE key = '${ACTIVE_PROVIDER_KEY}';
        `,
      })
    },

    async loadActiveProviderId() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        "SELECT value FROM app_settings WHERE key = ? LIMIT 1",
        [ACTIVE_PROVIDER_KEY],
      )
      const value = resultRows[0]?.value
      return typeof value === "string" && value.trim() ? value : null
    },

    async setActiveProviderId(providerId) {
      if (!providerId) {
        await promiser.send("exec", {
          dbId,
          sql: "DELETE FROM app_settings WHERE key = ?",
          bind: [ACTIVE_PROVIDER_KEY],
        })
        return
      }

      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO app_settings (key, value)
          VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
        bind: [ACTIVE_PROVIDER_KEY, providerId],
      })
    },

    async close() {
      try {
        await promiser.send("close", { dbId })
      } finally {
        promiser.terminate()
      }
    },
  }
}
