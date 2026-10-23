import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";

export type ReceiptStatus = "paid" | "voided" | "refunded";

export type ReceiptListItem = {
  id: string;
  receipt_number: string;
  customer_name: string | null;
  total: number;
  currency: string;
  status: ReceiptStatus;
  created_at: string;
};

export type ReceiptListFilters = {
  q?: string;
  status?: ReceiptStatus | "all";
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number; // 1-based
  pageSize?: number;
};

export type ReceiptListResult = {
  rows: ReceiptListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function listReceipts(
  filters: ReceiptListFilters = {}
): Promise<ReceiptListResult> {
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return { rows: [], total: 0, page: 1, pageSize: 20, pageCount: 0 };
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, filters.pageSize ?? 20));
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  const supabase = await createClient();
  let query = supabase
    .from("receipts")
    .select(
      "id, receipt_number, customer_name, total, currency, status, created_at",
      { count: "exact" }
    )
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  if (filters.q) {
    const term = filters.q.trim();
    // Match receipt_number OR customer_name
    query = query.or(
      `receipt_number.ilike.%${term}%,customer_name.ilike.%${term}%`
    );
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  }
  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("listReceipts error", error);
    return { rows: [], total: 0, page, pageSize, pageCount: 0 };
  }

  const total = count ?? 0;

  return {
    rows: data as ReceiptListItem[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type ReceiptDetail = {
  header: {
    id: string;
    receipt_number: string;
    customer_name: string | null;
    subtotal: number;
    tax_total: number;
    total: number;
    currency: string;
    amount_in_words: string | null;
    status: ReceiptStatus;
    created_at: string;
    voided_at: string | null;
    voided_reason: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string | null;
    unit_price: number;
    tax_rate: number;
    line_total: number;
  }>;
};

export async function getReceipt(id: string): Promise<ReceiptDetail | null> {
  const supabase = await createClient();

  const { data: header, error: hErr } = await supabase
    .from("receipts")
    .select(
      "id, receipt_number, customer_name, subtotal, tax_total, total, currency, amount_in_words, status, created_at, voided_at, voided_reason"
    )
    .eq("id", id)
    .maybeSingle();

  if (hErr || !header) return null;

  const { data: items, error: iErr } = await supabase
    .from("receipt_items")
    .select("id, description, quantity, unit, unit_price, tax_rate, line_total")
    .eq("receipt_id", id)
    .order("sort_order", { ascending: true });

  if (iErr || !items) return null;

  return {
    header: header as ReceiptDetail["header"],
    items: items as ReceiptDetail["items"],
  };
}
