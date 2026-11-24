import { ApiError, apiJson, type ApiEnvelope } from "@/lib/api/http";

/**
 * Transports for the zolai-core AI chat endpoints under `/api/zolai/ai/*`.
 * These are proxied to the external zolai-core backend at the edge, so they
 * are not part of the Hono AppType; components must consume them through the
 * react-query hooks in `features/zolai/hooks/*`, never via raw `fetch`.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatHistoryItem {
  id: string;
  title?: string;
  updated_at?: string;
  model?: string;
}

export interface ChatThread {
  providerChatId: string | null;
  messages: ChatMessage[];
}

export interface AIStatus {
  ok: boolean;
  message: string | null;
}

export interface CreateChatBody {
  title: string;
  model: string;
  provider: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((x) => asRecord(x).name)
    .filter((n): n is string => typeof n === "string" && n.length > 0);
}

/** GET /api/zolai/ai/models — tolerates both `{data:[…]}` and `{models:[…]}` shapes. */
export async function fetchAIModels(): Promise<string[]> {
  const payload = await apiJson<ApiEnvelope<unknown>>("/api/zolai/ai/models");
  const names = asStringArray(payload.data) ?? asStringArray(asRecord(payload).models) ?? [];
  return names;
}

/** GET /api/zolai/ai/status — normalised readiness of the gemini-server link. */
export async function fetchAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch("/api/zolai/ai/status", { cache: "no-store", credentials: "include" });
    if (!res.ok) {
      return { ok: false, message: `Status check failed (HTTP ${res.status}).` };
    }
    const payload = (await res.json()) as {
      success?: boolean;
      data?: { ok?: boolean; error?: unknown };
      error?: { message?: string };
    };
    if (payload?.success && payload?.data?.ok === true) return { ok: true, message: null };
    const err = payload?.data?.error ?? payload?.error?.message ?? "Gemini server not ready (check cookies/credentials).";
    return { ok: false, message: String(err) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Status check failed." };
  }
}

/** GET /api/zolai/ai/chats — the user's saved chat threads, newest first. */
export async function fetchChatHistory(): Promise<ChatHistoryItem[]> {
  const payload = await apiJson<ApiEnvelope<unknown>>("/api/zolai/ai/chats");
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items
    .map((x) => {
      const obj = asRecord(x);
      return {
        id: String(obj.id ?? ""),
        title: typeof obj.title === "string" ? obj.title : undefined,
        updated_at:
          typeof obj.updatedAt === "string"
            ? obj.updatedAt
            : typeof obj.updated_at === "string"
              ? obj.updated_at
              : undefined,
        model: typeof obj.model === "string" ? obj.model : undefined,
      };
    })
    .filter((x) => x.id.length > 0);
}

/** GET /api/zolai/ai/chats/:id — one thread with its messages. */
export async function fetchChatThread(id: string): Promise<ChatThread> {
  const payload = await apiJson<ApiEnvelope<{ providerChatId?: unknown; messages?: unknown }>>(
    `/api/zolai/ai/chats/${encodeURIComponent(id)}`,
  );
  const thread = asRecord(payload.data);
  const rawMessages = Array.isArray(thread.messages) ? thread.messages : [];
  const messages: ChatMessage[] = rawMessages
    .map((t) => {
      const obj = asRecord(t);
      return {
        role: obj.role === "user" ? ("user" as const) : ("assistant" as const),
        content: String(obj.content ?? ""),
      };
    })
    .filter((m) => m.content.trim().length > 0);
  return {
    providerChatId: typeof thread.providerChatId === "string" ? thread.providerChatId : null,
    messages,
  };
}

/** POST /api/zolai/ai/chats — create a thread; returns its id. */
export async function createChat(body: CreateChatBody): Promise<string> {
  const payload = await apiJson<ApiEnvelope<{ id?: unknown }>>("/api/zolai/ai/chats", {
    method: "POST",
    json: body,
  });
  const id = String(asRecord(payload.data).id ?? "");
  if (!id) throw new Error("Failed to create chat");
  return id;
}

/** PATCH /api/zolai/ai/chats/:id — attach provider metadata to a thread (best-effort). */
export async function patchChat(id: string, fields: { providerChatId?: string; model?: string }): Promise<void> {
  try {
    await apiJson<unknown>(`/api/zolai/ai/chats/${encodeURIComponent(id)}`, {
      method: "PATCH",
      json: fields,
    });
  } catch (e) {
    if (e instanceof ApiError) return; // HTTP failures are non-fatal (matches prior behaviour)
    throw e;
  }
}

/** POST /api/zolai/ai/chats/:id/messages — persist one message on a thread (best-effort). */
export async function saveChatMessage(id: string, role: ChatRole, content: string): Promise<void> {
  if (!content.trim()) return;
  try {
    await apiJson<unknown>(`/api/zolai/ai/chats/${encodeURIComponent(id)}/messages`, {
      method: "POST",
      json: { role, content },
    });
  } catch (e) {
    if (e instanceof ApiError) return; // HTTP failures are non-fatal (matches prior behaviour)
    throw e;
  }
}
