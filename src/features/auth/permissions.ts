export type Role = "owner" | "admin" | "staff" | "viewer";

export type Permission =
  | "dashboard.view"
  | "reports.view"
  | "receipts.view"
  | "receipts.create"
  | "receipts.void"
  | "products.view"
  | "products.manage"
  | "settings.view"
  | "settings.manage"
  | "users.view"
  | "users.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "dashboard.view",
    "reports.view",
    "receipts.view",
    "receipts.create",
    "receipts.void",
    "products.view",
    "products.manage",
    "settings.view",
    "settings.manage",
    "users.view",
    "users.manage",
  ],
  admin: [
    "dashboard.view",
    "reports.view",
    "receipts.view",
    "receipts.create",
    "receipts.void",
    "products.view",
    "products.manage",
    "settings.view",
    "settings.manage",
    "users.view",
    "users.manage",
  ],
  staff: [
    "dashboard.view",
    "reports.view",
    "receipts.view",
    "receipts.create",
    "receipts.void",
    "products.view",
    "products.manage",
    "settings.view",
  ],
  viewer: [
    "dashboard.view",
    "reports.view",
    "receipts.view",
    "products.view",
    "settings.view",
  ],
};

export function can(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(
  role: Role | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => can(role, p));
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  viewer: "Viewer",
};
