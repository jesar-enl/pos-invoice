"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermissionForAction } from "../auth/guards";

const VoidInput = z.object({
  receiptId: z.string().uuid(),
  reason: z
    .string()
    .min(3, "Please give a reason (at least 3 characters)")
    .max(500),
});

export type VoidState = {
  error?: string;
  success?: boolean;
};

export async function voidReceipt(
  _prev: VoidState,
  formData: FormData
): Promise<VoidState> {
  const guard = await requirePermissionForAction("receipts.void");
  if ("error" in guard) return { error: guard.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = VoidInput.safeParse({
    receiptId: formData.get("receiptId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { receiptId, reason } = parsed.data;

  // Fetch current status
  const { data: existing, error: getErr } = await supabase
    .from("receipts")
    .select("status")
    .eq("id", receiptId)
    .maybeSingle();

  if (getErr || !existing) return { error: "Receipt not found" };
  if (existing.status !== "paid") {
    return {
      error: `Cannot void a receipt that is already ${existing.status}`,
    };
  }

  const { error: updErr } = await supabase
    .from("receipts")
    .update({
      status: "voided",
      voided_at: new Date().toISOString(),
      voided_by: user.id,
      voided_reason: reason,
    })
    .eq("id", receiptId);

  if (updErr) return { error: "Failed to void receipt" };

  revalidatePath("/receipts");
  revalidatePath(`/receipts/${receiptId}`);

  return { success: true };
}
