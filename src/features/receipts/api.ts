import type { Draft } from "./types";

export type CreatedReceipt = {
  id: string;
  receiptNumber: string;
  total: number;
  createdAt: string;
  amountInWords: string;
};

export async function createReceipt(draft: Draft): Promise<CreatedReceipt> {
  const res = await fetch("/api/receipts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: draft.customerId,
      customerName: draft.customerName,
      lines: draft.lines.map((l) => ({
        productId: l.productId,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
      })),
    }),
  });

  if (!res.ok) {
    let message = "Failed to save receipt";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}
