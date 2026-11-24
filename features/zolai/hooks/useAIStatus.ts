"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAIStatus } from "@/features/zolai/api/chat";

/** Readiness of the gemini-server link (`/api/zolai/ai/status`). */
export function useAIStatus() {
  return useQuery({
    queryKey: ["zolai", "ai", "status"],
    queryFn: fetchAIStatus,
    staleTime: 15_000,
    retry: false,
  });
}
