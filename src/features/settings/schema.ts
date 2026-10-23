import { z } from "zod";

export const TenantSettingsInput = z.object({
  name: z.string().min(1, "Business name is required").max(200),
  address: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  phone: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  email: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null))
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email"
    ),
  tin: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  vat_number: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  currency: z.string().min(1).max(8),
  vat_rate: z.coerce.number().min(0).max(1),
  receipt_prefix: z
    .string()
    .min(1, "Prefix is required")
    .max(16)
    .regex(/^[A-Z0-9-]+$/i, "Use letters, numbers, and dashes only")
    .transform((v) => v.toUpperCase()),
  receipt_number_format: z
    .string()
    .min(1)
    .max(64)
    .refine(
      (v) => v.includes("{seq") || v.includes("{year"),
      "Format must include {seq} or {year}"
    ),
  timezone: z.string().min(1).max(64),
});

export type TenantSettingsInput = z.infer<typeof TenantSettingsInput>;
