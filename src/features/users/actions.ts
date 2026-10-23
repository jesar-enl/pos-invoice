"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";
import { InviteInput, UpdateRoleInput } from "./schema";
import { requirePermissionForAction } from "../auth/guards";

export type UsersActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

function flattenIssues(
  issues: { path: (string | number)[]; message: string }[]
) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Ensure the caller is an owner or admin of the current tenant.
 */
async function requireManager() {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "No tenant configured" as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, status")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !membership ||
    membership.status !== "active" ||
    (membership.role !== "owner" && membership.role !== "admin")
  ) {
    return { error: "You do not have permission to manage users" as const };
  }

  const guard = await requirePermissionForAction("users.manage");
  if ("error" in guard) return { error: guard.error };

  if (!tenant) return { error: "No tenant configured" };

  return {
    tenant,
    caller: { id: guard.session.userId },
    role: guard.session.role,
  };
}

// ============================================================
// INVITE
// ============================================================
export async function inviteUser(
  _prev: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const guard = await requireManager();
  if ("error" in guard) return { error: guard.error };
  const { tenant, caller } = guard;

  const parsed = InviteInput.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenIssues(parsed.error.issues) };
  }

  const { email, full_name, role } = parsed.data;

  const admin = createAdminClient();

  // Check if already a member of this tenant
  const { data: existingUsers } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const existing = existingUsers?.users.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (existing) {
    const { data: existingMembership } = await admin
      .from("memberships")
      .select("id, status")
      .eq("tenant_id", tenant.id)
      .eq("user_id", existing.id)
      .maybeSingle();

    if (existingMembership) {
      return {
        error:
          existingMembership.status === "suspended"
            ? "This user was suspended. Reactivate them instead of re-inviting."
            : "This user is already a member of your team.",
      };
    }

    // Existing auth user, just add membership
    const { error: memErr } = await admin.from("memberships").insert({
      tenant_id: tenant.id,
      user_id: existing.id,
      role,
      status: "active",
      invited_by: caller.id,
      invited_at: new Date().toISOString(),
      accepted_at: new Date().toISOString(),
    });

    if (memErr) {
      console.error("inviteUser membership insert error", memErr);
      return { error: "Failed to add user to team" };
    }

    if (full_name) {
      await admin.from("profiles").update({ full_name }).eq("id", existing.id);
    }

    revalidatePath("/users");
    return {
      success: true,
      message: `${email} added to your team (existing account)`,
    };
  }

  // New user: send Supabase invite email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
      data: { full_name },
    });

  if (inviteErr || !invited.user) {
    console.error("inviteUser invite error", inviteErr);
    return { error: inviteErr?.message ?? "Failed to send invitation" };
  }

  // Create membership
  const { error: memErr } = await admin.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: invited.user.id,
    role,
    status: "active",
    invited_by: caller.id,
    invited_at: new Date().toISOString(),
    accepted_at: null,
  });

  if (memErr) {
    console.error("inviteUser membership insert error", memErr);
    return { error: "Invitation sent, but failed to record membership" };
  }

  // Set full name on profile
  if (full_name) {
    await admin
      .from("profiles")
      .update({ full_name })
      .eq("id", invited.user.id);
  }

  revalidatePath("/users");
  return { success: true, message: `Invitation sent to ${email}` };
}

// ============================================================
// CHANGE ROLE
// ============================================================
export async function changeRole(
  _prev: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const guard = await requireManager();
  if ("error" in guard) return { error: guard.error };
  const { tenant, caller, role: callerRole } = guard;

  const parsed = UpdateRoleInput.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const { userId, role } = parsed.data;

  // Can't demote yourself
  if (userId === caller.id && role !== callerRole) {
    return { error: "You can't change your own role" };
  }

  // Only owners can create/remove owners
  if ((role === "owner" || callerRole !== "owner") && role === "owner") {
    return { error: "Only the owner can assign the owner role" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("memberships")
    .update({ role })
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId);

  if (error) return { error: "Failed to update role" };

  revalidatePath("/users");
  return { success: true, message: "Role updated" };
}

// ============================================================
// TOGGLE SUSPEND
// ============================================================
export async function toggleSuspend(
  _prev: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const guard = await requireManager();
  if ("error" in guard) return { error: guard.error };
  const { tenant, caller } = guard;

  const userId = String(formData.get("userId") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (!userId || !["active", "suspended"].includes(nextStatus)) {
    return { error: "Invalid input" };
  }

  if (userId === caller.id) {
    return { error: "You can't suspend yourself" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("memberships")
    .update({ status: nextStatus })
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId);

  if (error) return { error: "Failed to update status" };

  revalidatePath("/users");
  return {
    success: true,
    message: nextStatus === "suspended" ? "User suspended" : "User reactivated",
  };
}

// ============================================================
// RESEND INVITE
// ============================================================
export async function resendInvite(
  _prev: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const guard = await requireManager();
  if ("error" in guard) return { error: guard.error };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Missing email" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
  });

  if (error) return { error: error.message };

  return { success: true, message: `Invitation resent to ${email}` };
}

// ============================================================
// REMOVE MEMBER
// ============================================================
export async function removeMember(
  _prev: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const guard = await requireManager();
  if ("error" in guard) return { error: guard.error };
  const { tenant, caller } = guard;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Missing user" };
  if (userId === caller.id) return { error: "You can't remove yourself" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("memberships")
    .delete()
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId);

  if (error) return { error: "Failed to remove member" };

  revalidatePath("/users");
  return { success: true, message: "Member removed from team" };
}
