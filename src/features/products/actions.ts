"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import { ProductInput } from "./schema";
import { requirePermissionForAction } from "../auth/guards";

export type ProductFormState = {
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

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // createProduct
  const guard = await requirePermissionForAction("products.manage");
  if ("error" in guard) return { error: guard.error };
  const tenant = await getCurrentTenant();

  if (!tenant) return { error: "No tenant configured" };

  const parsed = ProductInput.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    category: formData.get("category"),
    unit: formData.get("unit") || "pcs",
    unit_price: formData.get("unit_price"),
    tax_rate: formData.get("tax_rate"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: flattenIssues(parsed.error.issues) };
  }

  const { error } = await supabase.from("products").insert({
    tenant_id: tenant.id,
    ...parsed.data,
  });

  if (error) {
    // Unique violation on SKU
    if (error.code === "23505") {
      return { fieldErrors: { sku: "This SKU is already in use" } };
    }
    console.error("createProduct error", error);
    return { error: "Failed to create product" };
  }

  revalidatePath("/products");
  return { success: true };
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id" };

  const parsed = ProductInput.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    category: formData.get("category"),
    unit: formData.get("unit") || "pcs",
    unit_price: formData.get("unit_price"),
    tax_rate: formData.get("tax_rate"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: flattenIssues(parsed.error.issues) };
  }

  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { sku: "This SKU is already in use" } };
    }
    console.error("updateProduct error", error);
    return { error: "Failed to update product" };
  }

  revalidatePath("/products");
  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: active }).eq("id", id);
  revalidatePath("/products");
}
