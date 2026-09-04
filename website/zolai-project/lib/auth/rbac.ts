/**
 * Unified permission system for client and server
 * Single source of truth for role-based access control
 */

export const PERMISSIONS = {
  // Content permissions
  CONTENT_READ: "content:read",
  CONTENT_CREATE: "content:create",
  CONTENT_EDIT: "content:edit", 
  CONTENT_DELETE: "content:delete",
  CONTENT_PUBLISH: "content:publish",
  
  // User management
  USER_READ: "user:read",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",
  USER_BAN: "user:ban",
  
  // Admin functions
  ADMIN_PANEL: "admin:panel",
  ADMIN_SETTINGS: "admin:settings",
  ADMIN_IMPERSONATE: "admin:impersonate",
  
  // System permissions
  SYSTEM_BACKUP: "system:backup",
  SYSTEM_CONFIG: "system:config",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role definitions — match Prisma UserRole enum values exactly
export const ROLES = {
  USER: "USER",
  VIEWER: "VIEWER",
  CONTRIBUTOR: "CONTRIBUTOR",
  AUTHOR: "AUTHOR",
  EDITOR: "EDITOR",
  MODERATOR: "MODERATOR",
  CONTENT_ADMIN: "CONTENT_ADMIN",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);

// Role-to-permissions mapping (strict)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.USER]: [PERMISSIONS.CONTENT_READ],
  [ROLES.VIEWER]: [PERMISSIONS.CONTENT_READ],
  [ROLES.CONTRIBUTOR]: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_CREATE],
  [ROLES.AUTHOR]: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT],
  [ROLES.EDITOR]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
  ],
  [ROLES.CONTENT_ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.ADMIN_PANEL,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_SETTINGS,
  ],
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_IMPERSONATE,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
};

// Admin roles (for quick checks)
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CONTENT_ADMIN, ROLES.MODERATOR];

// Core permission functions (work on both client and server)
export function hasPermission(userRole: string | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  return (ROLE_PERMISSIONS[userRole as Role] ?? []).includes(permission);
}

export function hasAnyPermission(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function isAdmin(userRole: string | null | undefined): boolean {
  if (!userRole) return false;
  return ADMIN_ROLES.includes(userRole as Role);
}

export function isSuperAdmin(userRole: string | null | undefined): boolean {
  return userRole === ROLES.SUPER_ADMIN;
}
