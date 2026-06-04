import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Create a product
export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: String(body.name ?? "").trim(),
      category: String(body.category ?? "").trim(),
      price: Number(body.price) || 0,
      stock_qty: Math.max(0, Math.floor(Number(body.stock_qty) || 0)),
      weight_variant: String(body.weight_variant ?? "").trim(),
      image_url: String(body.image_url ?? "").trim(),
      active: body.active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data });
}
