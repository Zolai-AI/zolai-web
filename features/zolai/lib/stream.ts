/**
 * SSE streaming transport for the zolai-core chat endpoints.
 *
 * Native `fetch` + `ReadableStream` is the only way to consume these streams,
 * so it lives here (transport layer) instead of in components. Components call
 * `streamChat` / `requestChatOnce` from a `useMutation` (see
 * `features/zolai/hooks/useChatSend.ts`).
 */
import { apiJson, type ApiEnvelope } from "@/lib/api/http";
import type { ChatMessage } from "@/features/zolai/api/chat";

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  chat_id?: string;
}

export interface StreamHandlers {
  /** Called for every assistant text delta. */
  onDelta: (delta: string) => void;
  /** Called once with the provider chat id when the stream reports it. */
  onChatId?: (chatId: string) => void;
  /** Optional abort signal for the underlying request. */
  signal?: AbortSignal;
}

function parseSseLines(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  return { events: parts, rest };
}

function extractDataLine(evt: string): string | null {
  // Minimal SSE parsing: find first `data:` line and strip prefix.
  const line = evt
    .split("\n")
    .map((l) => l.trimEnd())
    .find((l) => l.startsWith("data:"));
  if (!line) return null;
  return line.replace(/^data:\s?/, "");
}

/** POST /api/zolai/chat/stream — consume the SSE stream, invoking handlers. */
export async function streamChat(request: ChatRequest, handlers: StreamHandlers): Promise<void> {
  const resp = await fetch("/api/zolai/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(request),
    signal: handlers.signal,
  });

  if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const { events, rest } = parseSseLines(buf);
    buf = rest;

    for (const evt of events) {
      const dataStr = extractDataLine(evt);
      if (!dataStr) continue;

      let payload: unknown;
      try {
        payload = JSON.parse(dataStr);
      } catch {
        continue;
      }

      const p = payload as { delta?: string; done?: boolean; error?: string; chat_id?: unknown };
      if (p.error) throw new Error(String(p.error));
      if (p.chat_id && handlers.onChatId) handlers.onChatId(String(p.chat_id));
      if (p.delta) handlers.onDelta(p.delta);
      if (p.done) return;
    }
  }
}

export interface ChatOnceResult {
  content: string;
  chatId: string | null;
}

/**
 * POST /api/zolai/chat — non-streaming fallback used when the SSE stream
 * fails. Throws on HTTP error (the caller decides whether to surface the
 * original stream error instead).
 */
export async function requestChatOnce(request: ChatRequest): Promise<ChatOnceResult> {
  const payload = await apiJson<
    ApiEnvelope<{ text?: unknown; message?: { content?: unknown }; chat_id?: unknown }> & {
      text?: unknown;
      chat_id?: unknown;
    }
  >("/api/zolai/chat", { method: "POST", json: request });

  const data = (payload.data ?? payload) as Record<string, unknown>;
  const message = data.message as Record<string, unknown> | undefined;
  const content = String(data.text ?? payload.text ?? message?.content ?? "");
  const chatId = data.chat_id ?? payload.chat_id;
  return { content, chatId: chatId != null ? String(chatId) : null };
}
