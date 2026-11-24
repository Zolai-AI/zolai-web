"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsReport } from "@/features/dashboard/api/analytics";

/** KG + dataset analytics report (zolai-core, proxied at /api/zolai/analytics/report). */
export function useAnalyticsReport() {
  return useQuery({
    queryKey: ["zolai", "analytics", "report"],
    queryFn: fetchAnalyticsReport,
    staleTime: 30_000,
    retry: 1,
  });
}
