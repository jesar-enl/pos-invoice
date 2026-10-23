export type ReportSummary = {
  receiptCount: number;
  grossTotal: number;
  netTotal: number;
  vatTotal: number;
};

export type DailyRow = {
  day: string; // YYYY-MM-DD
  receiptCount: number;
  grossTotal: number;
  netTotal: number;
  vatTotal: number;
};

export type ProductRow = {
  productId: string | null;
  description: string;
  quantity: number;
  grossTotal: number;
  receiptCount: number;
};

export type CategoryRow = {
  category: string;
  quantity: number;
  grossTotal: number;
  receiptCount: number;
};

export type Period = {
  from: Date;
  to: Date; // exclusive
  label: string;
};
