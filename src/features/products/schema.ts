import { z } from "zod";

export const ProductInput = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z
    .string()
    .max(64)
    .transform((v) => v.trim())
    .optional()
    .transform((v) => (v ? v : null)),
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  category: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  unit: z.string().min(1).max(16).default("pcs"),
  unit_price: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(1),
  is_active: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof ProductInput>;
