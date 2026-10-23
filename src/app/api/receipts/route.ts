import { NextResponse } from "next/server";
import { calculateTotals } from "@/features/receipts/calculateTotals";
import { CreateReceiptInput } from "@/features/receipts/schema";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import { amountInWords } from "@/pdf/numberToWords";
import { requirePermissionForAction } from "@/features/auth/guards";

const round2 = (n: number) => Math.round(n * 100) / 100;
const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const guard = await requirePermissionForAction("receipts.create");
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: 403 });
  }
  
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateReceiptInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { customerId, customerName, lines } = parsed.data;

  // 3. Tenant
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return NextResponse.json(
      {
        error:
          "No tenant is visible to this Supabase session. Check the project URL and SELECT access to public.tenants.",
      },
      { status: 500 },
    );
  }

  // 4. Server-side totals (never trust the client)
  const totals = calculateTotals(
    lines.map((l) => ({
      id: "x",
      productId: l.productId,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
    })),
  );

  const inWords = amountInWords(totals.gross);

  // 5. Reserve atomic receipt number
  const { data: receiptNumber, error: numErr } = await supabase.rpc(
    "next_receipt_number",
    { p_tenant_id: tenant.id },
  );

  if (numErr || !receiptNumber) {
    console.error("receipt number error", numErr);
    return NextResponse.json(
      { error: "Failed to reserve receipt number" },
      { status: 500 },
    );
  }

  // 6. Insert receipt header
  const { data: receipt, error: receiptErr } = await supabase
    .from("receipts")
    .insert({
      tenant_id: tenant.id,
      receipt_number: receiptNumber,
      customer_name: customerName || null,
      customer_id: customerId || null,
      subtotal: totals.net,
      tax_total: totals.vat,
      total: totals.gross,
      currency: tenant.currency,
      amount_in_words: inWords,
      status: "paid",
      created_by: user.id,
    })
    .select("id, receipt_number, total, created_at")
    .single();

  if (receiptErr || !receipt) {
    console.error("receipt insert error", receiptErr);
    return NextResponse.json(
      { error: "Failed to save receipt" },
      { status: 500 },
    );
  }

  // 7. Insert frozen line items
  const itemRows = lines.map((l, i) => {
    const gross = l.quantity * l.unitPrice;
    const net = gross / (1 + l.taxRate);
    return {
      receipt_id: receipt.id,
      product_id:
        l.productId && uuidPattern.test(l.productId) ? l.productId : null,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unit_price: l.unitPrice,
      tax_rate: l.taxRate,
      line_total: round2(net),
      sort_order: i,
    };
  });

  const { error: itemsErr } = await supabase
    .from("receipt_items")
    .insert(itemRows);

  if (itemsErr) {
    // Roll back the header so we don't leave orphans
    await supabase.from("receipts").delete().eq("id", receipt.id);
    console.error("items insert error", itemsErr);
    return NextResponse.json(
      { error: "Failed to save receipt items" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: receipt.id,
    receiptNumber: receipt.receipt_number,
    total: Number(receipt.total),
    createdAt: receipt.created_at,
    amountInWords: inWords,
  });
}
