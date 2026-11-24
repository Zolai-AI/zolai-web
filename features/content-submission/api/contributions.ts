/**
 * Transports for the community-contribution endpoints
 * (`app/api/contributions/route.ts` and `app/api/contributions/[id]/route.ts`).
 * These are standalone Next.js route handlers returning raw JSON (no
 * `{ success, data }` envelope), so they live outside the Hono AppType and go
 * through the shared JSON transport.
 */
import { apiJson } from "@/lib/api/http";

export interface Contribution {
  id: string;
  type: string;
  zolaiText: string;
  englishText: string;
  notes?: string;
  status: string;
  createdAt: string;
  submitter?: { name: string; email: string } | null;
}

export interface CreateContributionInput {
  type: string;
  zolaiText: string;
  englishText: string;
  notes?: string;
}

export type ContributionAction = "approve" | "reject";

/** GET /api/contributions — latest 50 submissions. */
export function listContributions(): Promise<Contribution[]> {
  return apiJson<Contribution[]>("/api/contributions");
}

/** POST /api/contributions — submit a new contribution. */
export function createContribution(input: CreateContributionInput): Promise<{ id: string; status: string }> {
  return apiJson<{ id: string; status: string }>("/api/contributions", { method: "POST", json: input });
}

/** POST /api/contributions/:id — approve/reject (admin only). */
export function reviewContribution(id: string, action: ContributionAction): Promise<{ id: string; status: string }> {
  return apiJson<{ id: string; status: string }>(`/api/contributions/${encodeURIComponent(id)}`, {
    method: "POST",
    json: { action },
  });
}
