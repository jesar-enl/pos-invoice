import type { DraftLine, Totals } from "./types";

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * VAT-inclusive pricing.
 * Each line's unitPrice is what the customer sees (gross).
 * net = gross / (1 + taxRate)
 * vat = gross - net
 */
export function calculateTotals(lines: DraftLine[]): Totals {
  let gross = 0;
  let net = 0;
  let vat = 0;
  let quantity = 0;

  for (const line of lines) {
    const lineGross = line.quantity * line.unitPrice;
    const divisor = 1 + (line.taxRate ?? 0);
    const lineNet = lineGross / divisor;
    const lineVat = lineGross - lineNet;

    gross += lineGross;
    net += lineNet;
    vat += lineVat;
    quantity += line.quantity;
  }

  return {
    gross: round2(gross),
    net: round2(net),
    vat: round2(vat),
    quantity: round2(quantity),
  };
}
