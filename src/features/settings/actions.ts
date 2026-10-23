"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import { TenantSettingsInput } from "./schema";
import { requirePermissionForAction } from "../auth/guards";

export type SettingsState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
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

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "No tenant configured" };

  const guard = await requirePermissionForAction("settings.manage");
  if ("error" in guard) return { error: guard.error };
  
  const parsed = TenantSettingsInput.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    tin: formData.get("tin"),
    vat_number: formData.get("vat_number"),
    currency: formData.get("currency") || "UGX",
    vat_rate: formData.get("vat_rate"),
    receipt_prefix: formData.get("receipt_prefix"),
    receipt_number_format: formData.get("receipt_number_format"),
    timezone: formData.get("timezone") || "Africa/Kampala",
  });

  if (!parsed.success) {
    return { fieldErrors: flattenIssues(parsed.error.issues) };
  }

  const { error } = await supabase
    .from("tenants")
    .update(parsed.data)
    .eq("id", tenant.id);

  if (error) {
    console.error("updateSettings error", error);
    return { error: "Failed to save settings" };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/receipts");
  revalidatePath("/new-sale");

  return { success: true };
}

export async function updateLogo(logoUrl: string): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "No tenant configured" };

  const { error } = await supabase
    .from("tenants")
    .update({ logo_url: logoUrl })
    .eq("id", tenant.id);

  if (error) return { error: "Failed to update logo" };

  revalidatePath("/settings");
  revalidatePath("/new-sale");
  return { success: true };
}
