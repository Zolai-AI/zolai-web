"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchKgSnapshot } from "@/features/zolai/api/kg";

/** Knowledge-graph snapshot used by the 3D mind map. */
export function useKgSnapshot() {
  return useQuery({
    queryKey: ["zolai", "kg", "snapshot"],
    queryFn: fetchKgSnapshot,
    staleTime: 60_000,
    retry: false,
  });
}
