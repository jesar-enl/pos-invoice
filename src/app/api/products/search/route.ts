import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchProducts } from "@/features/products/queries";
import { requirePermissionForAction } from "@/features/auth/guards";

export async function GET(req: Request) {
  const guard = await requirePermissionForAction("products.view");
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Math.min(20, Number(url.searchParams.get("limit")) || 8);

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  const products = await searchProducts(q, limit);
  return NextResponse.json({ products });
}
