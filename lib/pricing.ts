import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PROMO_DISCOUNT,
} from "./constants";

export type PriceableItem = { price: number; qty: number };

// Single source of truth for totals — used by the cart UI and recomputed
// server-side at checkout so a tampered client payload can't change the price.
export function computeTotals(items: PriceableItem[], promoApplied: boolean) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * PROMO_DISCOUNT) : 0;
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  return { subtotal, discount, deliveryFee, total };
}
