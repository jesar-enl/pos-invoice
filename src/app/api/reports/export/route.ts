import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePeriod } from "@/features/reports/periods";
import {
  getDaily,
  getTopProducts,
  getSummary,
} from "@/features/reports/queries";
import { format } from "date-fns";
import { requirePermissionForAction } from "@/features/auth/guards";

function escapeCsv(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(escapeCsv).join(",")).join("\r\n");
}

export async function GET(req: Request) {
  const guard = await requirePermissionForAction("reports.view");
  if ("error" in guard) {
    return new NextResponse(guard.error, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const period = resolvePeriod(
    url.searchParams.get("preset") ?? undefined,
    url.searchParams.get("from") ?? undefined,
    url.searchParams.get("to") ?? undefined
  );

  const [summary, daily, products] = await Promise.all([
    getSummary(period),
    getDaily(period),
    getTopProducts(period, 500),
  ]);

  const lines: (string | number | null | undefined)[][] = [];

  // Header
  lines.push(["Sales report"]);
  lines.push(["Period", period.label]);
  lines.push([
    "From",
    format(period.from, "yyyy-MM-dd HH:mm"),
    "To",
    format(new Date(period.to.getTime() - 1), "yyyy-MM-dd HH:mm"),
  ]);
  lines.push([]);

  // Summary
  lines.push(["Summary"]);
  lines.push(["Metric", "Value"]);
  lines.push(["Receipts", summary.receiptCount]);
  lines.push(["Net sales", summary.netTotal.toFixed(2)]);
  lines.push(["VAT collected", summary.vatTotal.toFixed(2)]);
  lines.push(["Gross revenue", summary.grossTotal.toFixed(2)]);
  lines.push([]);

  // Daily
  lines.push(["Daily breakdown"]);
  lines.push(["Date", "Receipts", "Net", "VAT", "Gross"]);
  for (const d of daily) {
    lines.push([
      d.day,
      d.receiptCount,
      d.netTotal.toFixed(2),
      d.vatTotal.toFixed(2),
      d.grossTotal.toFixed(2),
    ]);
  }
  lines.push([]);

  // Products
  lines.push(["Product breakdown"]);
  lines.push(["Product", "Quantity", "Revenue", "Receipts"]);
  for (const p of products) {
    lines.push([
      p.description,
      p.quantity.toFixed(2),
      p.grossTotal.toFixed(2),
      p.receiptCount,
    ]);
  }

  const csv = toCsv(lines);
  const filename = `sales-report-${format(
    period.from,
    "yyyy-MM-dd"
  )}-to-${format(new Date(period.to.getTime() - 1), "yyyy-MM-dd")}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
