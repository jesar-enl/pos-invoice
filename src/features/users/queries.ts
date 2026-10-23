import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";
import type { MemberRow, MemberRole, MemberStatus } from "./types";

export async function listMembers(): Promise<MemberRow[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

  // Use admin client to read auth.users emails
  const admin = createAdminClient();

  const { data: memberships, error: mErr } = await admin
    .from("memberships")
    .select("id, user_id, role, status, invited_at, accepted_at, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: true });

  if (mErr || !memberships) {
    console.error("listMembers error", mErr);
    return [];
  }

  const userIds = memberships.map((m) => m.user_id);
  if (userIds.length === 0) return [];

  // Auth users (emails)
  const { data: authList } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const emailById = new Map<string, string>(
    (authList?.users ?? [])
      .filter((u) => userIds.includes(u.id))
      .map((u) => [u.id, u.email ?? ""])
  );

  // Profiles (names)
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  const nameById = new Map<string, string | null>(
    (profiles ?? []).map((p) => [p.id, p.full_name])
  );

  return memberships.map((m) => ({
    userId: m.user_id,
    membershipId: m.id,
    email: emailById.get(m.user_id) ?? "—",
    fullName: nameById.get(m.user_id) ?? null,
    role: m.role as MemberRole,
    status: m.status as MemberStatus,
    createdAt: m.created_at,
    invitedAt: m.invited_at,
    acceptedAt: m.accepted_at,
    isPending: !m.accepted_at,
  }));
}

export async function getCurrentUserRole(): Promise<MemberRole | null> {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  return (data?.role as MemberRole) ?? null;
}
