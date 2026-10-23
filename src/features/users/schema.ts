import { z } from "zod";

export const InviteInput = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .transform((v) => v.trim().toLowerCase()),
  full_name: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  role: z.enum(["admin", "staff", "viewer"]),
});

export const UpdateRoleInput = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "staff", "viewer"]),
});
