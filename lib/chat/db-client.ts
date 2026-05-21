import type {
  ChatMessage,
  Conversation,
  NewChatMessage,
  ProviderConfig,
  Tag,
} from "./types";

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT,
    turn_id         TEXT NOT NULL,
    role            TEXT NOT NULL,
    content         TEXT NOT NULL DEFAULT '',
    image_data      TEXT,
    model           TEXT,
    size            TEXT,
    quality         TEXT,
    revised_prompt  TEXT,
    error           TEXT,
    duration_ms     INTEGER,
    created_at      INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_turn ON messages(turn_id);
  -- idx_messages_conversation is created in the v5 migration after ALTER TABLE
  -- so that legacy databases (where the column does not exist yet) don't fail
  -- when this batch runs before the migration.

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

  CREATE TABLE IF NOT EXISTS tags (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name COLLATE NOCASE);

  CREATE TABLE IF NOT EXISTS message_tags (
    message_id TEXT NOT NULL,
    tag_id     TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (message_id, tag_id)
  );
  CREATE INDEX IF NOT EXISTS idx_message_tags_message ON message_tags(message_id);
  CREATE INDEX IF NOT EXISTS idx_message_tags_tag ON message_tags(tag_id);
`;

const WORKER_URL = "/sqlite-wasm/sqlite3-worker1.mjs";
const ACTIVE_PROVIDER_KEY = "active_provider_id";
const DEFAULT_CONVERSATION_ID = "default";

export type StorageInfo = {
  location: string;
  persistent: boolean;
  bytes: number;
  messageCount: number;
  providerCount: number;
  tagCount: number;
  conversationCount: number;
};

export interface ChatDb {
  insert: (msg: NewChatMessage) => Promise<ChatMessage>;
  loadAll: () => Promise<ChatMessage[]>;
  deleteTurn: (turnId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  loadConversations: () => Promise<Conversation[]>;
  createConversation: (input: {
    id?: string;
    title?: string;
  }) => Promise<Conversation>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  touchConversation: (id: string) => Promise<void>;
  loadProviders: () => Promise<ProviderConfig[]>;
  upsertProvider: (provider: ProviderConfig) => Promise<void>;
  deleteProvider: (providerId: string) => Promise<void>;
  clearProviders: () => Promise<void>;
  loadActiveProviderId: () => Promise<string | null>;
  setActiveProviderId: (providerId: string | null) => Promise<void>;
  loadAllTags: () => Promise<Tag[]>;
  addTagToMessage: (messageId: string, tagName: string) => Promise<Tag>;
  removeTagFromMessage: (messageId: string, tagId: string) => Promise<void>;
  getStorageInfo: () => Promise<StorageInfo>;
  close: () => Promise<void>;
  readonly persistent: boolean;
}

type Row = Record<string, string | number | null>;

type WorkerOutbound = {
  type: string;
  messageId?: string;
  result?: unknown;
  dbId?: string;
};

type ExecResult = {
  resultRows?: Row[];
};

type OpenResult = {
  dbId?: string;
  vfs?: string;
  persistent?: boolean;
};

type Pending = {
  resolve: (value: WorkerOutbound) => void;
  reject: (reason: Error) => void;
};

class Promiser {
  private worker: Worker;
  private pending = new Map<string, Pending>();
  private counter = 0;
  private readyResolve!: () => void;
  private readyReject!: (err: Error) => void;
  readonly ready: Promise<void>;

  constructor() {
    this.worker = new Worker(WORKER_URL, { type: "module" });
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });
    this.worker.addEventListener("message", this.handleMessage);
    this.worker.addEventListener("error", (event) => {
      const err = new Error(event.message || "sqlite worker error");
      this.readyReject(err);
      for (const pending of this.pending.values()) {
        pending.reject(err);
      }
      this.pending.clear();
    });
  }

  private handleMessage = (event: MessageEvent) => {
    const data = event.data as WorkerOutbound | undefined;
    if (!data || typeof data !== "object") return;

    if (data.type === "sqlite3-api" && data.result === "worker1-ready") {
      this.readyResolve();
      return;
    }

    const messageId = data.messageId;
    if (!messageId) return;
    const pending = this.pending.get(messageId);
    if (!pending) return;
    this.pending.delete(messageId);

    if (data.type === "error") {
      const result = data.result as { message?: string } | undefined;
      pending.reject(new Error(result?.message || "sqlite worker error"));
      return;
    }
    pending.resolve(data);
  };

  send(type: string, args: Record<string, unknown>): Promise<WorkerOutbound> {
    this.counter += 1;
    const messageId = `${type}#${this.counter}`;
    return new Promise<WorkerOutbound>((resolve, reject) => {
      this.pending.set(messageId, { resolve, reject });
      this.worker.postMessage({ type, args, messageId });
    });
  }

  terminate() {
    this.worker.removeEventListener("message", this.handleMessage);
    this.worker.terminate();
  }
}

function rowToMessage(row: Row): ChatMessage {
  return {
    id: String(row.id),
    conversationId:
      row.conversation_id == null ? "" : String(row.conversation_id),
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
    durationMs:
      row.duration_ms == null
        ? null
        : typeof row.duration_ms === "number"
          ? row.duration_ms
          : Number(row.duration_ms) || null,
    createdAt:
      typeof row.created_at === "number"
        ? row.created_at
        : Number(row.created_at) || 0,
    tags: [],
  };
}

function rowToConversation(row: Row): Conversation {
  return {
    id: String(row.id),
    title: typeof row.title === "string" ? row.title : "",
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  };
}

function rowToTag(row: Row): Tag {
  return {
    id: String(row.id),
    name: String(row.name),
  };
}

function rowToProvider(row: Row): ProviderConfig {
  const models = parseModels(row.models_json);
  const defaultModel =
    String(row.default_model || "").trim() || models[0] || "";

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
  };
}

function parseModels(value: string | number | null): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((model): model is string => typeof model === "string")
      .map((model) => model.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function toNumber(value: string | number | null): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function getResultRows(response: WorkerOutbound): Row[] {
  const result = response.result as ExecResult | undefined;
  return Array.isArray(result?.resultRows) ? result.resultRows : [];
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
  });
  return getResultRows(response);
}

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function openDb(
  promiser: Promiser,
  filename: string,
): Promise<{ dbId: string; vfs?: string; persistent?: boolean }> {
  const response = await promiser.send("open", { filename });
  const result = response.result as OpenResult | undefined;
  const dbId = result?.dbId ?? response.dbId;
  if (!dbId) {
    throw new Error("sqlite worker did not return a dbId");
  }
  return { dbId, vfs: result?.vfs, persistent: result?.persistent };
}

const TARGET_USER_VERSION = 5;

async function migrate(promiser: Promiser, dbId: string): Promise<void> {
  const rows = await selectRows(promiser, dbId, "PRAGMA user_version");
  const current = toNumber(rows[0]?.user_version ?? 0);

  if (current < 3) {
    const cols = await selectRows(
      promiser,
      dbId,
      "PRAGMA table_info(messages)",
    );
    const hasDuration = cols.some((row) => String(row.name) === "duration_ms");
    if (!hasDuration) {
      await promiser.send("exec", {
        dbId,
        sql: "ALTER TABLE messages ADD COLUMN duration_ms INTEGER",
      });
    }
  }

  // v4: tags + message_tags tables are created by SCHEMA_SQL via
  // CREATE TABLE IF NOT EXISTS, so existing databases automatically pick them
  // up. Only the user_version bump is needed.

  if (current < 5) {
    await promiser.send("exec", { dbId, sql: "BEGIN IMMEDIATE" });
    try {
      // double-check: another tab may have completed the migration while we
      // were waiting for the lock.
      const recheck = await selectRows(
        promiser,
        dbId,
        "PRAGMA user_version",
      );
      if (toNumber(recheck[0]?.user_version ?? 0) < 5) {
        const cols = await selectRows(
          promiser,
          dbId,
          "PRAGMA table_info(messages)",
        );
        const hasConv = cols.some(
          (row) => String(row.name) === "conversation_id",
        );
        if (!hasConv) {
          await promiser.send("exec", {
            dbId,
            sql: "ALTER TABLE messages ADD COLUMN conversation_id TEXT",
          });
        }

        await promiser.send("exec", {
          dbId,
          sql: "CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)",
        });

        const orphanRows = await selectRows(
          promiser,
          dbId,
          "SELECT COUNT(*) AS n FROM messages WHERE conversation_id IS NULL OR conversation_id = ''",
        );
        if (toNumber(orphanRows[0]?.n ?? 0) > 0) {
          const now = Date.now();
          await promiser.send("exec", {
            dbId,
            sql: "INSERT OR IGNORE INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            bind: [DEFAULT_CONVERSATION_ID, "Default", now, now],
          });
          await promiser.send("exec", {
            dbId,
            sql: "UPDATE messages SET conversation_id = ? WHERE conversation_id IS NULL OR conversation_id = ''",
            bind: [DEFAULT_CONVERSATION_ID],
          });
        }

        await promiser.send("exec", {
          dbId,
          sql: "PRAGMA user_version = 5",
        });
      }
      await promiser.send("exec", { dbId, sql: "COMMIT" });
    } catch (err) {
      await promiser
        .send("exec", { dbId, sql: "ROLLBACK" })
        .catch(() => {});
      throw err;
    }
  }

  if (current !== TARGET_USER_VERSION) {
    await promiser.send("exec", {
      dbId,
      sql: `PRAGMA user_version = ${TARGET_USER_VERSION}`,
    });
  }
}

export async function openChatDb(): Promise<ChatDb> {
  if (typeof window === "undefined") {
    throw new Error("openChatDb must be called in the browser");
  }

  const isolated =
    typeof self !== "undefined" &&
    (self as { crossOriginIsolated?: boolean }).crossOriginIsolated === true;

  const promiser = new Promiser();
  await promiser.ready;

  let dbId: string;
  let persistent = false;

  if (isolated) {
    try {
      const opened = await openDb(promiser, "file:imgen.sqlite?vfs=opfs");
      dbId = opened.dbId;
      persistent = opened.persistent === true;
    } catch (err) {
      console.warn("[chat-db] OPFS open failed, falling back to :memory:", err);
      const opened = await openDb(promiser, ":memory:");
      dbId = opened.dbId;
    }
  } else {
    console.warn(
      "[chat-db] crossOriginIsolated is false, falling back to :memory:",
    );
    const opened = await openDb(promiser, ":memory:");
    dbId = opened.dbId;
  }

  await promiser.send("exec", { dbId, sql: SCHEMA_SQL });
  await migrate(promiser, dbId);

  return {
    persistent,

    async insert(msg) {
      const id = generateId();
      const createdAt = Date.now();
      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO messages (
            id, conversation_id, turn_id, role, content, image_data,
            model, size, quality, revised_prompt, error, duration_ms, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        bind: [
          id,
          msg.conversationId,
          msg.turnId,
          msg.role,
          msg.content,
          msg.imageData,
          msg.model,
          msg.size,
          msg.quality,
          msg.revisedPrompt,
          msg.error,
          msg.durationMs,
          createdAt,
        ],
      });
      if (msg.conversationId) {
        await promiser.send("exec", {
          dbId,
          sql: "UPDATE conversations SET updated_at = ? WHERE id = ?",
          bind: [createdAt, msg.conversationId],
        });
      }
      return { id, createdAt, tags: [], ...msg };
    },

    async loadAll() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, conversation_id, turn_id, role, content, image_data,
                 model, size, quality, revised_prompt, error,
                 duration_ms, created_at
          FROM messages
          ORDER BY created_at ASC, id ASC
        `,
      );
      const messages = resultRows.map(rowToMessage);

      const tagRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT mt.message_id AS message_id, t.id AS id, t.name AS name
          FROM message_tags mt
          JOIN tags t ON t.id = mt.tag_id
          ORDER BY t.name COLLATE NOCASE ASC
        `,
      );

      const tagsByMessage = new Map<string, Tag[]>();
      for (const row of tagRows) {
        const messageId = String(row.message_id);
        const list = tagsByMessage.get(messageId);
        const tag = rowToTag(row);
        if (list) {
          list.push(tag);
        } else {
          tagsByMessage.set(messageId, [tag]);
        }
      }

      for (const message of messages) {
        const list = tagsByMessage.get(message.id);
        if (list) message.tags = list;
      }

      return messages;
    },

    async deleteTurn(turnId) {
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM message_tags
          WHERE message_id IN (SELECT id FROM messages WHERE turn_id = ?)
        `,
        bind: [turnId],
      });
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM messages WHERE turn_id = ?",
        bind: [turnId],
      });
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM tags
          WHERE id NOT IN (SELECT DISTINCT tag_id FROM message_tags)
        `,
      });
    },

    async clearAll() {
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM message_tags;
          DELETE FROM tags;
          DELETE FROM messages;
          DELETE FROM conversations;
        `,
      });
    },

    async loadConversations() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, title, created_at, updated_at
          FROM conversations
          ORDER BY updated_at DESC, created_at DESC, id ASC
        `,
      );
      return resultRows.map(rowToConversation);
    },

    async createConversation(input) {
      const id = input.id ?? generateId();
      const title = input.title ?? "";
      const now = Date.now();
      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO conversations (id, title, created_at, updated_at)
          VALUES (?, ?, ?, ?)
        `,
        bind: [id, title, now, now],
      });
      return { id, title, createdAt: now, updatedAt: now };
    },

    async renameConversation(id, title) {
      const now = Date.now();
      await promiser.send("exec", {
        dbId,
        sql: "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
        bind: [title, now, id],
      });
    },

    async deleteConversation(id) {
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM message_tags
          WHERE message_id IN (SELECT id FROM messages WHERE conversation_id = ?)
        `,
        bind: [id],
      });
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM messages WHERE conversation_id = ?",
        bind: [id],
      });
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM tags
          WHERE id NOT IN (SELECT DISTINCT tag_id FROM message_tags)
        `,
      });
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM conversations WHERE id = ?",
        bind: [id],
      });
    },

    async touchConversation(id) {
      const now = Date.now();
      await promiser.send("exec", {
        dbId,
        sql: "UPDATE conversations SET updated_at = ? WHERE id = ?",
        bind: [now, id],
      });
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
      );
      return resultRows.map(rowToProvider);
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
      });
    },

    async deleteProvider(providerId) {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM providers WHERE id = ?",
        bind: [providerId],
      });
    },

    async clearProviders() {
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM providers;
          DELETE FROM app_settings WHERE key = '${ACTIVE_PROVIDER_KEY}';
        `,
      });
    },

    async loadActiveProviderId() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        "SELECT value FROM app_settings WHERE key = ? LIMIT 1",
        [ACTIVE_PROVIDER_KEY],
      );
      const value = resultRows[0]?.value;
      return typeof value === "string" && value.trim() ? value : null;
    },

    async setActiveProviderId(providerId) {
      if (!providerId) {
        await promiser.send("exec", {
          dbId,
          sql: "DELETE FROM app_settings WHERE key = ?",
          bind: [ACTIVE_PROVIDER_KEY],
        });
        return;
      }

      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO app_settings (key, value)
          VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
        bind: [ACTIVE_PROVIDER_KEY, providerId],
      });
    },

    async loadAllTags() {
      const resultRows = await selectRows(
        promiser,
        dbId,
        `
          SELECT id, name
          FROM tags
          ORDER BY name COLLATE NOCASE ASC
        `,
      );
      return resultRows.map(rowToTag);
    },

    async addTagToMessage(messageId, tagName) {
      const normalized = tagName.trim();
      if (!normalized) {
        throw new Error("Tag name cannot be empty");
      }

      const existing = await selectRows(
        promiser,
        dbId,
        "SELECT id, name FROM tags WHERE name = ? COLLATE NOCASE LIMIT 1",
        [normalized],
      );

      let tag: Tag;
      if (existing.length > 0) {
        tag = rowToTag(existing[0]);
      } else {
        const id = generateId();
        await promiser.send("exec", {
          dbId,
          sql: "INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)",
          bind: [id, normalized, Date.now()],
        });
        tag = { id, name: normalized };
      }

      await promiser.send("exec", {
        dbId,
        sql: `
          INSERT INTO message_tags (message_id, tag_id, created_at)
          VALUES (?, ?, ?)
          ON CONFLICT(message_id, tag_id) DO NOTHING
        `,
        bind: [messageId, tag.id, Date.now()],
      });

      return tag;
    },

    async removeTagFromMessage(messageId, tagId) {
      await promiser.send("exec", {
        dbId,
        sql: "DELETE FROM message_tags WHERE message_id = ? AND tag_id = ?",
        bind: [messageId, tagId],
      });
      await promiser.send("exec", {
        dbId,
        sql: `
          DELETE FROM tags
          WHERE id = ?
            AND NOT EXISTS (
              SELECT 1 FROM message_tags WHERE tag_id = ?
            )
        `,
        bind: [tagId, tagId],
      });
    },

    async getStorageInfo() {
      const sizeRows = await selectRows(
        promiser,
        dbId,
        "SELECT (SELECT page_count FROM pragma_page_count()) * (SELECT page_size FROM pragma_page_size()) AS bytes",
      );
      const messageRows = await selectRows(
        promiser,
        dbId,
        "SELECT COUNT(*) AS n FROM messages",
      );
      const providerRows = await selectRows(
        promiser,
        dbId,
        "SELECT COUNT(*) AS n FROM providers",
      );
      const tagRows = await selectRows(
        promiser,
        dbId,
        "SELECT COUNT(*) AS n FROM tags",
      );
      const conversationRows = await selectRows(
        promiser,
        dbId,
        "SELECT COUNT(*) AS n FROM conversations",
      );

      return {
        location: persistent
          ? "OPFS://imgen.sqlite"
          : "In-memory (this tab only)",
        persistent,
        bytes: toNumber(sizeRows[0]?.bytes ?? 0),
        messageCount: toNumber(messageRows[0]?.n ?? 0),
        providerCount: toNumber(providerRows[0]?.n ?? 0),
        tagCount: toNumber(tagRows[0]?.n ?? 0),
        conversationCount: toNumber(conversationRows[0]?.n ?? 0),
      };
    },

    async close() {
      try {
        await promiser.send("close", { dbId });
      } finally {
        promiser.terminate();
      }
    },
  };
}
