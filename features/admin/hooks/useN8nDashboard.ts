"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchN8nDashboard, triggerPipeline } from "@/features/admin/api/n8n";

export const N8N_DASHBOARD_KEY = ["admin", "n8n", "dashboard"] as const;

/** Stats for the automation dashboard (`/api/admin/n8n-dashboard`). */
export function useN8nDashboard() {
  return useQuery({
    queryKey: N8N_DASHBOARD_KEY,
    queryFn: fetchN8nDashboard,
    retry: false,
  });
}

/** Trigger a zolai-core pipeline run, then refresh the dashboard. */
export function useTriggerPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerPipeline,
    onSettled: async () => {
      // Give the pipeline a moment to register the run before refetching
      // (the trigger endpoint may still answer with an error body).
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await queryClient.invalidateQueries({ queryKey: N8N_DASHBOARD_KEY });
    },
  });
}
