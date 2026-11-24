"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAIModels } from "@/features/zolai/api/chat";

/** Available AI models from the zolai-core backend (`/api/zolai/ai/models`). */
export function useAIModels() {
  return useQuery({
    queryKey: ["zolai", "ai", "models"],
    queryFn: fetchAIModels,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
