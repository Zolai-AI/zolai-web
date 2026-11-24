import { apiJson } from "@/lib/api/http";

export interface PipelineRun {
  jobId: string;
  stage: string;
  status: string;
  recordsAdded: number;
  createdAt: string;
  error?: string;
}

export interface N8nDashboardStats {
  pendingContributions: number;
  subscriberCount: number;
  lastPublish?: string | null;
  recentRuns: PipelineRun[];
}

const ZOLAI_API_BASE = process.env.NEXT_PUBLIC_ZOLAI_API_URL ?? "http://localhost:8000";

/** GET /api/admin/n8n-dashboard — standalone Next route handler (raw JSON body). */
export function fetchN8nDashboard(): Promise<N8nDashboardStats> {
  return apiJson<N8nDashboardStats>("/api/admin/n8n-dashboard");
}

/**
 * POST {zolai-core}/api/pipeline/trigger — external backend, no cookies and no
 * response body handling (fire-and-forget, as before).
 */
export async function triggerPipeline(): Promise<void> {
  await fetch(`${ZOLAI_API_BASE}/api/pipeline/trigger`, { method: "POST" });
}
