/**
 * Canonical role definitions — re-exports from rbac.ts (single source of truth)
 */
export { ROLES, ALL_ROLES } from "./rbac";
export type { Role as AppRole } from "./rbac";
export { isAdmin as isAdminRole, isSuperAdmin } from "./rbac";
