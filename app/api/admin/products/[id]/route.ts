import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// Update a product (partial: stock, price, active toggle, fields)
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};

  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.category !== undefined) patch.category = String(body.category).trim();
  if (body.price !== undefined) patch.price = Number(body.price) || 0;
  if (body.stock_qty !== undefined)
    patch.stock_qty = Math.max(0, Math.floor(Number(body.stock_qty) || 0));
  if (body.weight_variant !== undefined)
    patch.weight_variant = String(body.weight_variant).trim();
  if (body.image_url !== undefined) patch.image_url = String(body.image_url).trim();
  if (body.active !== undefined) patch.active = !!body.active;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
