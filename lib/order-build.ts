import "server-only";
import { createAdminClient } from "./supabase/admin";
import { computeTotals } from "./pricing";
import type { OrderItem } from "./types";

export type CartLine = { id: string; qty: number };

export type BuiltOrder = {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

// Rebuilds the order from authoritative DB prices. Throws on bad input so the
// route can reject tampered / stale carts before any payment is created.
export async function buildOrderFromCart(
  cart: CartLine[],
  promoApplied: boolean
): Promise<BuiltOrder> {
  const clean = cart
    .filter((l) => l && typeof l.id === "string" && Number(l.qty) > 0)
    .map((l) => ({ id: l.id, qty: Math.floor(Number(l.qty)) }));

  if (clean.length === 0) throw new Error("Cart is empty");

  const supabase = createAdminClient();
  const ids = clean.map((l) => l.id);
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, weight_variant, stock_qty, active")
    .in("id", ids);

  if (error) throw new Error(error.message);

  const items: OrderItem[] = clean.map((line) => {
    const p = data?.find((row) => row.id === line.id);
    if (!p) throw new Error("A product in your cart no longer exists");
    if (!p.active) throw new Error(`${p.name} is no longer available`);
    if (p.stock_qty < line.qty)
      throw new Error(`Not enough stock for ${p.name}`);
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      weight_variant: p.weight_variant,
      qty: line.qty,
    };
  });

  const totals = computeTotals(items, promoApplied);
  return { items, ...totals };
}

export function generateOrderNumber() {
  const d = new Date();
  const ymd =
    d.getFullYear().toString().slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DB${ymd}${rand}`;
}
