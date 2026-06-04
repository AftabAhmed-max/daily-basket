"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

export default function CartSheet() {
  const {
    items,
    isOpen,
    closeCart,
    setQty,
    remove,
    subtotal,
    deliveryFee,
    discount,
    total,
    promoApplied,
    applyPromo,
    removePromo,
  } = useCart();

  const [code, setCode] = useState("");
  const [promoErr, setPromoErr] = useState("");

  if (!isOpen) return null;

  const handlePromo = () => {
    if (promoApplied) {
      removePromo();
      setCode("");
      setPromoErr("");
      return;
    }
    const ok = applyPromo(code);
    setPromoErr(ok ? "" : "Invalid code");
  };

  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40"
      />

      {/* sheet: bottom on mobile, right side-over on desktop */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[400px] sm:max-h-full sm:rounded-none sm:rounded-l-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-base font-bold">
            Your Cart{" "}
            {items.length > 0 && (
              <span className="text-muted">({items.length})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
            <span className="text-4xl">🛒</span>
            <p className="text-sm font-semibold">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-[11px] font-medium text-brand-700">
                  Add {formatINR(remaining)} more for FREE delivery 🚚
                </p>
              )}

              <ul className="space-y-3">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                      <Image
                        src={i.image_url}
                        alt={i.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-semibold">
                        {i.name}
                      </p>
                      <p className="text-[11px] text-muted">{i.weight_variant}</p>
                      <p className="text-[13px] font-bold">
                        {formatINR(i.price * i.qty)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => remove(i.id)}
                        className="text-[11px] text-muted hover:text-red-500"
                      >
                        Remove
                      </button>
                      <div className="flex items-center gap-2 rounded-md bg-brand-600 text-white">
                        <button
                          onClick={() => setQty(i.id, i.qty - 1)}
                          className="px-2 py-0.5 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="min-w-4 text-center text-xs font-bold">
                          {i.qty}
                        </span>
                        <button
                          onClick={() => setQty(i.id, i.qty + 1)}
                          disabled={i.qty >= i.stock_qty}
                          className="px-2 py-0.5 text-sm font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Promo */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={promoApplied}
                    placeholder="Promo code (DAILY10)"
                    className="flex-1 rounded-lg border border-line px-3 py-2 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:bg-surface"
                  />
                  <button
                    onClick={handlePromo}
                    className="rounded-lg border border-brand-600 px-3 py-2 text-sm font-bold text-brand-600"
                  >
                    {promoApplied ? "Remove" : "Apply"}
                  </button>
                </div>
                {promoErr && (
                  <p className="mt-1 text-[11px] text-red-500">{promoErr}</p>
                )}
                {promoApplied && (
                  <p className="mt-1 text-[11px] font-medium text-brand-600">
                    DAILY10 applied — 10% off 🎉
                  </p>
                )}
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="border-t border-line px-4 py-3">
              <dl className="space-y-1 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-medium">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery fee</dt>
                  <dd className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-brand-600">FREE</span>
                    ) : (
                      formatINR(deliveryFee)
                    )}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-600">
                    <dt>Discount (DAILY10)</dt>
                    <dd className="font-medium">−{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-1 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-brand-600 py-3 text-sm font-bold text-white active:scale-[0.99] transition"
              >
                Proceed to Checkout · {formatINR(total)}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
