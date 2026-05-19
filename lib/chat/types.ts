export type Role = "user" | "assistant"

export type ProviderSettings = {
  apiKey: string
  baseURL: string
  defaultModel: string
}

export type ChatMessage = {
  id: string
  turnId: string
  role: Role
  content: string
  imageData: string | null
  model: string | null
  size: string | null
  quality: string | null
  revisedPrompt: string | null
  error: string | null
  createdAt: number
}

export type NewChatMessage = Omit<ChatMessage, "id" | "createdAt">

export type DbStatus = "idle" | "loading" | "ready" | "unsupported" | "error"
