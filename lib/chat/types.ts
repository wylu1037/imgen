export type Role = "user" | "assistant";

export type ProviderConfig = {
  id: string;
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  defaultModel: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export type ProviderSettings = {
  activeProviderId: string | null;
  providers: ProviderConfig[];
};

export type LegacyProviderSettings = {
  apiKey: string;
  baseURL: string;
  defaultModel: string;
};

export type ChatMessage = {
  id: string;
  turnId: string;
  role: Role;
  content: string;
  imageData: string | null;
  model: string | null;
  size: string | null;
  quality: string | null;
  revisedPrompt: string | null;
  error: string | null;
  durationMs: number | null;
  createdAt: number;
};

export type NewChatMessage = Omit<ChatMessage, "id" | "createdAt">;

export type DbStatus = "idle" | "loading" | "ready" | "unsupported" | "error";
