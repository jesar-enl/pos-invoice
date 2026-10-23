import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import type { Product, ProductListItem } from "./types";

export type ProductFilters = {
  q?: string;
  category?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  rows: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  categories: string[];
};

export async function listProducts(
  filters: ProductFilters = {}
): Promise<ProductListResult> {
  const empty: ProductListResult = {
    rows: [],
    total: 0,
    page: 1,
    pageSize: 20,
    pageCount: 0,
    categories: [],
  };

  const tenant = await getCurrentTenant();
  if (!tenant) return empty;

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, filters.pageSize ?? 20));
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, sku, category, unit, unit_price, is_active", {
      count: "exact",
    })
    .eq("tenant_id", tenant.id)
    .order("name", { ascending: true })
    .range(fromIdx, toIdx);

  if (filters.q) {
    const term = filters.q.trim();
    query = query.or(
      `name.ilike.%${term}%,sku.ilike.%${term}%,category.ilike.%${term}%`
    );
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("listProducts error", error);
    return empty;
  }

  // Distinct categories for the filter dropdown
  const { data: catRows } = await supabase
    .from("products")
    .select("category")
    .eq("tenant_id", tenant.id)
    .not("category", "is", null);

  const categories = Array.from(
    new Set((catRows ?? []).map((r) => r.category as string))
  ).sort();

  const total = count ?? 0;

  return {
    rows: data as ProductListItem[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    categories,
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Product;
}

export async function searchProducts(
  q: string,
  limit = 8
): Promise<ProductListItem[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

  const term = q.trim();
  if (!term) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, category, unit, unit_price, tax_rate, is_active")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data as ProductListItem[];
}
