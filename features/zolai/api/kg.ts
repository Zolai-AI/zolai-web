import { apiJson } from "@/lib/api/http";
import type { GraphData } from "@/features/zolai/types";

/**
 * GET /api/zolai/kg/snapshot — a standalone Next.js route handler
 * (`app/api/zolai/kg/snapshot/route.ts`), not part of the Hono AppType.
 * Returns `{ data: { nodes, links } }` and silently falls back to an empty
 * brain upstream when the external snapshot source is unavailable.
 */
export async function fetchKgSnapshot(): Promise<GraphData | null> {
  const payload = await apiJson<{ data?: GraphData }>("/api/zolai/kg/snapshot");
  const next = payload?.data;
  if (!next || !Array.isArray(next.nodes) || !Array.isArray(next.links)) return null;
  return next;
}
