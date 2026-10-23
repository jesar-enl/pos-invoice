import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import { can, type Permission, type Role } from "./permissions";

export type Session = {
  userId: string;
  email: string;
  fullName: string | null;
  tenantId: string;
  role: Role;
};

/**
 * Resolve the current user + their role in the current tenant.
 * Redirects to login if not signed in or no membership.
 */
export async function requireSession(): Promise<Session> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/login?error=no_tenant");

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, status")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    await supabase.auth.signOut();
    redirect("/login?error=no_access");
  }

  if (membership.status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    tenantId: tenant.id,
    role: membership.role as Role,
  };
}

/**
 * Require a specific permission. Redirects if not granted.
 * Use in pages. For actions, use requirePermissionForAction instead.
 */
export async function requirePermission(
  permission: Permission
): Promise<Session> {
  const session = await requireSession();
  if (!can(session.role, permission)) {
    redirect("/dashboard?error=forbidden");
  }
  return session;
}

/**
 * Non-redirecting variant for server actions — returns an error instead.
 */
export async function requirePermissionForAction(
  permission: Permission
): Promise<{ session: Session } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "No tenant configured" };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, status")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return { error: "No access" };
  if (membership.status === "suspended") return { error: "Account suspended" };

  const role = membership.role as Role;
  if (!can(role, permission)) {
    return { error: "You do not have permission to do this" };
  }

  return {
    session: {
      userId: user.id,
      email: user.email ?? "",
      fullName: null,
      tenantId: tenant.id,
      role,
    },
  };
}
