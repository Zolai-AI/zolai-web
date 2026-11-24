"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchChatHistory, fetchChatThread } from "@/features/zolai/api/chat";

/** Saved chat threads (`/api/zolai/ai/chats`). */
export function useChatHistory() {
  return useQuery({
    queryKey: ["zolai", "ai", "chats"],
    queryFn: fetchChatHistory,
    staleTime: 10_000,
    retry: false,
  });
}

/** One chat thread with its messages (`/api/zolai/ai/chats/:id`). */
export function useChatMessages(id: string | null) {
  return useQuery({
    queryKey: ["zolai", "ai", "chats", id],
    queryFn: () => fetchChatThread(id as string),
    enabled: !!id,
    retry: false,
  });
}
