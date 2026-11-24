"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createChat,
  patchChat,
  saveChatMessage,
  type ChatMessage,
} from "@/features/zolai/api/chat";
import { streamChat, requestChatOnce, type ChatRequest } from "@/features/zolai/lib/stream";

export interface ChatSendVariables {
  /** Existing local thread id, or null to create one on first send. */
  chatId: string | null;
  /** Provider-side chat id already attached to this thread, if any. */
  providerChatId: string | null;
  model: string;
  /** Conversation history BEFORE the new user message. */
  history: ChatMessage[];
  /** The new user message. */
  text: string;
  /** Streamed assistant text delta. */
  onDelta: (delta: string) => void;
  /** Fired when the local thread is created. */
  onChatCreated?: (id: string) => void;
  /** Fired when the provider reports its chat id. */
  onProviderChatId?: (id: string) => void;
}

export interface ChatSendResult {
  chatId: string;
  /** Final assistant text (streamed, or the fallback response). */
  content: string;
  /** True when the SSE stream failed and the JSON fallback was used. */
  usedFallback: boolean;
}

/**
 * Send one chat turn: ensure a thread, persist the user message, stream the
 * assistant reply (falling back to the non-streaming endpoint), and persist the
 * assistant message. All network I/O stays in the transport modules.
 */
export function useChatSend() {
  const queryClient = useQueryClient();

  return useMutation<ChatSendResult, Error, ChatSendVariables>({
    mutationFn: async (v) => {
      let chatId = v.chatId;
      if (!chatId) {
        chatId = await createChat({
          title: v.text.trim().slice(0, 60) || "New chat",
          model: v.model,
          provider: "gemini-server",
        });
        v.onChatCreated?.(chatId);
      }

      await saveChatMessage(chatId, "user", v.text);

      const request: ChatRequest = {
        messages: v.history,
        model: v.model,
        ...(v.providerChatId ? { chat_id: v.providerChatId } : {}),
      };

      let streamed = "";
      const appendDelta = (delta: string) => {
        streamed += delta;
        v.onDelta(delta);
      };

      const captureProviderChatId = (providerChatId: string) => {
        if (v.providerChatId) return;
        v.onProviderChatId?.(providerChatId);
        void patchChat(chatId as string, { providerChatId, model: v.model });
      };

      try {
        await streamChat(request, {
          onDelta: appendDelta,
          onChatId: captureProviderChatId,
        });
        await saveChatMessage(chatId, "assistant", streamed);
        return { chatId, content: streamed, usedFallback: false };
      } catch (streamError) {
        // Fallback: try the non-streaming endpoint once, then surface the
        // original stream error.
        try {
          const fallback = await requestChatOnce(request);
          if (fallback.chatId) captureProviderChatId(fallback.chatId);
          return {
            chatId,
            content: fallback.content || streamed,
            usedFallback: true,
          };
        } catch {
          throw streamError;
        }
      }
    },
    onSettled: () => {
      // `exact` so the open thread's ["zolai","ai","chats",id] query is not
      // refetched mid-conversation (matches the original refreshHistory scope).
      void queryClient.invalidateQueries({ queryKey: ["zolai", "ai", "chats"], exact: true });
    },
  });
}
