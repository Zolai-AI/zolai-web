/**
 * Low-level JSON transport helpers.
 *
 * Typed RPC via `lib/api/client.ts` (hc<AppType>) covers every route mounted in
 * `app/api/[[...route]]/route.ts`. The helpers here exist ONLY for endpoints
 * that are not part of the Hono AppType:
 *  - standalone Next.js route handlers (e.g. `/api/contributions`,
 *    `/api/admin/n8n-dashboard`, `/api/zolai/kg/snapshot`), and
 *  - edge-proxied zolai-core endpoints (e.g. `/api/zolai/ai/*`,
 *    `/api/zolai/analytics/report`).
 *
 * Never call `fetch()` directly from a component — go through a feature
 * transport module, and consume that module from a TanStack Query hook.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiJsonOptions extends Omit<RequestInit, "body"> {
  /** Serialised to JSON as the request body. */
  json?: unknown;
  /** Cache strategy; defaults to "no-store". */
  cache?: RequestCache;
}

/**
 * Fetch a URL and parse the JSON body as `T`. Throws `ApiError` on a
 * non-2xx response.
 */
export async function apiJson<T>(path: string, options: ApiJsonOptions = {}): Promise<T> {
  const { json, cache = "no-store", headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    cache,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });

  if (!res.ok) {
    throw new ApiError(`Request failed with status ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}

/** Standard `{ success, data, error }` envelope returned by Hono handlers. */
export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string };
}
