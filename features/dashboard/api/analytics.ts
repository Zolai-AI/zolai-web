import { ApiError, apiJson, type ApiEnvelope } from "@/lib/api/http";

/** Payload served (via edge proxy) by the zolai-core analytics layer. */
export interface AnalyticsPayload {
  kg: { nodeCount: number; edgeCount: number; chunkCount: number };
  datasetAnalytics: unknown | null;
}

export interface DatasetAnalyticsFile {
  path?: string;
  exists?: boolean;
  sampledRows?: number;
  textStats?: { count?: number; avg_len?: number; forbidden_hits?: Record<string, number> };
}

export interface DatasetAnalyticsReport {
  generatedAt?: string;
  sampleLimit?: number;
  files?: Record<string, DatasetAnalyticsFile>;
}

/**
 * GET /api/zolai/analytics/report — proxied zolai-core endpoint, not part of
 * the Hono AppType, so it goes through the shared JSON transport.
 */
export async function fetchAnalyticsReport(): Promise<AnalyticsPayload | null> {
  try {
    const json = await apiJson<ApiEnvelope<AnalyticsPayload>>("/api/zolai/analytics/report");
    return json.data ?? null;
  } catch (e) {
    // Endpoint may be absent on some deployments — mirror the previous
    // lenient behaviour: an HTTP error just renders "not found" cards.
    if (e instanceof ApiError) return null;
    throw e;
  }
}
