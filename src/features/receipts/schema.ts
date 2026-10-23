import { z } from "zod";

export const ReceiptLineInput = z.object({
  productId: z.string().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(1),
});

export const CreateReceiptInput = z.object({
  customerId: z.string().nullable().optional(),
  customerName: z.string().max(200).optional().default(""),
  lines: z.array(ReceiptLineInput).min(1, "At least one item is required"),
});

export type CreateReceiptInput = z.infer<typeof CreateReceiptInput>;
