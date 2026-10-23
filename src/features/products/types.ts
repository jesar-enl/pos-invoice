export type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unit: string;
  unit_price: number;
  tax_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductListItem = Pick<
  Product,
  | "id"
  | "name"
  | "sku"
  | "category"
  | "unit"
  | "unit_price"
  | "tax_rate"
  | "is_active"
>;
