import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import type {
  ReportSummary,
  DailyRow,
  ProductRow,
  CategoryRow,
  Period,
} from "./types";

const emptySummary: ReportSummary = {
  receiptCount: 0,
  grossTotal: 0,
  netTotal: 0,
  vatTotal: 0,
};

export async function getSummary(period: Period): Promise<ReportSummary> {
  const tenant = await getCurrentTenant();
  if (!tenant) return emptySummary;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("report_summary", {
    p_tenant_id: tenant.id,
    p_from: period.from.toISOString(),
    p_to: period.to.toISOString(),
  });

  if (error || !data || !data[0]) {
    if (error) console.error("getSummary error", error);
    return emptySummary;
  }

  const row = data[0];
  return {
    receiptCount: Number(row.receipt_count),
    grossTotal: Number(row.gross_total),
    netTotal: Number(row.net_total),
    vatTotal: Number(row.vat_total),
  };
}

export async function getDaily(period: Period): Promise<DailyRow[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("report_daily", {
    p_tenant_id: tenant.id,
    p_from: period.from.toISOString(),
    p_to: period.to.toISOString(),
    p_tz: "Africa/Kampala",
  });

  if (error || !data) {
    if (error) console.error("getDaily error", error);
    return [];
  }

  return data.map(
    (r: {
      day: string;
      receipt_count: number;
      gross_total: number;
      net_total: number;
      vat_total: number;
    }) => ({
      day: r.day,
      receiptCount: Number(r.receipt_count),
      grossTotal: Number(r.gross_total),
      netTotal: Number(r.net_total),
      vatTotal: Number(r.vat_total),
    })
  );
}

export async function getTopProducts(
  period: Period,
  limit = 20
): Promise<ProductRow[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("report_top_products", {
    p_tenant_id: tenant.id,
    p_from: period.from.toISOString(),
    p_to: period.to.toISOString(),
    p_limit: limit,
  });

  if (error || !data) {
    if (error) console.error("getTopProducts error", error);
    return [];
  }

  return data.map(
    (r: {
      product_id: string;
      description: string;
      quantity: number;
      gross_total: number;
      receipt_count: number;
    }) => ({
      productId: r.product_id,
      description: r.description,
      quantity: Number(r.quantity),
      grossTotal: Number(r.gross_total),
      receiptCount: Number(r.receipt_count),
    })
  );
}

export async function getByCategory(period: Period): Promise<CategoryRow[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("report_by_category", {
    p_tenant_id: tenant.id,
    p_from: period.from.toISOString(),
    p_to: period.to.toISOString(),
  });

  if (error || !data) {
    if (error) console.error("getByCategory error", error);
    return [];
  }

  return data.map(
    (r: {
      category: string;
      quantity: number;
      gross_total: number;
      receipt_count: number;
    }) => ({
      category: r.category,
      quantity: Number(r.quantity),
      grossTotal: Number(r.gross_total),
      receiptCount: Number(r.receipt_count),
    })
  );
}
