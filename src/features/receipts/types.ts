export type DraftLine = {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number; // VAT-inclusive price as shown to customer
  taxRate: number; // e.g. 0.18 for 18%
};

export type Draft = {
  customerId: string | null;
  customerName: string;
  lines: DraftLine[];
};

export type Totals = {
  gross: number; // total the customer pays
  net: number; // subtotal (net of VAT)
  vat: number; // VAT portion
  quantity: number; // total qty across all lines
};
