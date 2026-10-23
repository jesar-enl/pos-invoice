export type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  taxRate: number;
};

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Basco 4L Dove Grey",
    sku: "BSC-4L-DG",
    unit: "TN",
    unitPrice: 41000,
    taxRate: 0.18,
  },
  {
    id: "p2",
    name: "Basco 4L White",
    sku: "BSC-4L-WH",
    unit: "TN",
    unitPrice: 41000,
    taxRate: 0.18,
  },
  {
    id: "p3",
    name: "Basco 20L Dove Grey",
    sku: "BSC-20L-DG",
    unit: "TN",
    unitPrice: 185000,
    taxRate: 0.18,
  },
  {
    id: "p4",
    name: "Basco 20L White",
    sku: "BSC-20L-WH",
    unit: "TN",
    unitPrice: 185000,
    taxRate: 0.18,
  },
  {
    id: "p5",
    name: "Crown Silk Vinyl 4L",
    sku: "CRN-4L",
    unit: "TN",
    unitPrice: 52000,
    taxRate: 0.18,
  },
  {
    id: "p6",
    name: "Crown Silk Vinyl 20L",
    sku: "CRN-20L",
    unit: "TN",
    unitPrice: 240000,
    taxRate: 0.18,
  },
  {
    id: "p7",
    name: "Paint Brush 4 inch",
    sku: "BR-4",
    unit: "pcs",
    unitPrice: 8500,
    taxRate: 0.18,
  },
  {
    id: "p8",
    name: "Paint Brush 2 inch",
    sku: "BR-2",
    unit: "pcs",
    unitPrice: 4500,
    taxRate: 0.18,
  },
  {
    id: "p9",
    name: "Roller 9 inch",
    sku: "RL-9",
    unit: "pcs",
    unitPrice: 12000,
    taxRate: 0.18,
  },
  {
    id: "p10",
    name: "Masking Tape 1 inch",
    sku: "MT-1",
    unit: "pcs",
    unitPrice: 3500,
    taxRate: 0.18,
  },
];
