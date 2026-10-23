import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tin: string | null;
  vat_number: string | null;
  currency: string;
  vat_rate: number;
  receipt_prefix: string;
  receipt_number_format: string;
  timezone: string | null;
};

/**
 * Single-tenant MVP: return the first tenant.
 * When we go multi-tenant this becomes "tenant from user's membership".
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Tenant lookup failed:", error);
    return null;
  }

  return (data as Tenant | null) ?? null;
}
