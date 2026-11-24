/**
 * Additive adapter: Better Auth/web roles -> canonical core RBAC contract.
 *
 * Zolai Core remains the enforcement authority for core-backed APIs. This file
 * is for UI/BFF gating and contract mapping only; do not duplicate API enforcement.
 *
 * Contract reference: docs/governance/rbac-capabilities.contract.json
 * Core endpoint: GET /api/v1/auth/capabilities (public-safe, never 401)
 */

import { ROLES, type Role as WebRole } from "./rbac";

export const CORE_ROLES = ["anonymous", "member", "admin", "superadmin"] as const;
export type CoreRole = (typeof CORE_ROLES)[number];

export const CORE_ROLE_RANK: Record<CoreRole, number> = {
  anonymous: 0,
  member: 1,
  admin: 2,
  superadmin: 3,
};

export type CoreAuthSource = "anonymous" | "api_key" | "session" | "oauth";

export interface CoreAuthCapabilities {
  can_read_public: boolean;
  can_chat_assistant: boolean;
  can_run_agent: boolean;
  can_read_agent: boolean;
  can_read_cost: boolean;
  can_read_observer: boolean;
  can_read_learning: boolean;
  can_manage_users: boolean;
  can_manage_api_keys: boolean;
  can_manage_settings: boolean;
  can_manage_roles: boolean;
  can_view_audit: boolean;
  [key: string]: boolean;
}

export interface CoreAuthFeatureFlags {
  public_assistant?: boolean;
  public_contributions?: boolean;
  session_auth_enabled?: boolean;
  [key: string]: boolean | undefined;
}

export interface CoreCapabilitiesResponse {
  role: CoreRole;
  canonical_role?: CoreRole;
  scopes: string[];
  capabilities: Partial<CoreAuthCapabilities>;
  feature_flags: CoreAuthFeatureFlags;
  auth_source: CoreAuthSource;
  mode: string;
  contract_version: string;
}

/**
 * Draft mapping (Stage 1): web 9-role model -> core 4-role model.
 * Server-side core scope enforcement still applies for core API calls.
 */
export const WEB_ROLE_TO_CORE_ROLE: Record<WebRole, CoreRole> = {
  [ROLES.USER]: "member",
  [ROLES.VIEWER]: "member",
  [ROLES.CONTRIBUTOR]: "member",
  [ROLES.AUTHOR]: "member",
  [ROLES.EDITOR]: "member",
  [ROLES.MODERATOR]: "admin",
  [ROLES.CONTENT_ADMIN]: "admin",
  [ROLES.ADMIN]: "admin",
  [ROLES.SUPER_ADMIN]: "superadmin",
};

export const CORE_ROLE_SCOPE_BUNDLES_DRAFT: Record<CoreRole, string[]> = {
  anonymous: [],
  member: ["agent:read", "agent:run", "rag:read", "catalog:read", "dashboard:read"],
  admin: ["*"],
  superadmin: ["*", "role:manage"],
};

export function toCoreRole(webRole: string | null | undefined): CoreRole {
  if (!webRole) return "anonymous";
  return WEB_ROLE_TO_CORE_ROLE[webRole as WebRole] ?? "anonymous";
}

export function hasCoreRole(
  webRole: string | null | undefined,
  minimum: CoreRole,
): boolean {
  return CORE_ROLE_RANK[toCoreRole(webRole)] >= CORE_ROLE_RANK[minimum];
}

export function coreScopesForWebRole(webRole: string | null | undefined): string[] {
  return [...CORE_ROLE_SCOPE_BUNDLES_DRAFT[toCoreRole(webRole)]];
}

export function isCoreCapabilitiesResponse(value: unknown): value is CoreCapabilitiesResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.role === "string" &&
    Array.isArray(v.scopes) &&
    typeof v.capabilities === "object" &&
    v.capabilities !== null &&
    typeof v.feature_flags === "object" &&
    v.feature_flags !== null &&
    typeof v.auth_source === "string" &&
    typeof v.mode === "string" &&
    typeof v.contract_version === "string"
  );
}
