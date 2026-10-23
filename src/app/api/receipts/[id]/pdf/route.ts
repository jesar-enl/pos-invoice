import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import { generateReceiptPdf } from "@/pdf/generate";
import type { ReceiptPdfItem } from "@/pdf/templates/UgandaReceipt";
import { requirePermissionForAction } from "@/features/auth/guards";

export const runtime = "nodejs"; // react-pdf needs Node runtime

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guard = await requirePermissionForAction("receipts.view");
  if ("error" in guard) {
    return new NextResponse(guard.error, { status: 403 });
  }

  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Load receipt
  const { data: receipt, error: rErr } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (rErr || !receipt) {
    return new NextResponse("Receipt not found", { status: 404 });
  }

  // 3. Load items
  const { data: items, error: iErr } = await supabase
    .from("receipt_items")
    .select("*")
    .eq("receipt_id", id)
    .order("sort_order", { ascending: true });

  if (iErr || !items) {
    return new NextResponse("Failed to load items", { status: 500 });
  }

  // 4. Tenant (business header)
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return new NextResponse("No tenant configured", { status: 500 });
  }

  // 5. Map to PDF data
  const pdfItems: ReceiptPdfItem[] = items.map((it) => ({
    description: it.description,
    quantity: Number(it.quantity),
    unit: it.unit,
    unitPrice: Number(it.unit_price),
    lineTotal: Number(it.line_total),
  }));

  const pdfData = {
    receiptNumber: receipt.receipt_number,
    date: new Date(receipt.created_at),
    business: {
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      tin: tenant.tin,
    },
    buyerName: receipt.customer_name,
    items: pdfItems,
    subtotal: Number(receipt.subtotal),
    vat: Number(receipt.tax_total),
    total: Number(receipt.total),
    currency: receipt.currency || tenant.currency,
    amountInWords: receipt.amount_in_words ?? "",
    duplicate: true,
    logoUrl: tenant.logo_url,
  };

  // 6. Generate
  let pdf: Buffer;
  try {
    pdf = await generateReceiptPdf(pdfData);
  } catch (err) {
    console.error("PDF generation failed", err);
    return new NextResponse("PDF generation failed", { status: 500 });
  }

  // 7. Stream back
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${receipt.receipt_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
