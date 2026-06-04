"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { formatINR, stockState, stockLabel } from "@/lib/format";

// 1px light-grey blur shown while the photo streams in (smoother perceived load).
const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmMWY1ZjkiLz48L3N2Zz4=";

export default function ProductCard({ product }: { product: Product }) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(product.id);
  const ss = stockState(product.stock_qty);
  const out = ss === "out";

  return (
    <div
      className={`flex flex-col rounded-xl border border-line bg-white p-2.5 ${
        out ? "opacity-60" : ""
      }`}
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          className="object-cover"
          loading="lazy"
          quality={70}
          placeholder="blur"
          blurDataURL={BLUR}
        />
        <span
          className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            ss === "in"
              ? "bg-brand-100 text-brand-700"
              : ss === "low"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-600"
          }`}
        >
          {stockLabel(product.stock_qty)}
        </span>
      </div>

      <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-ink">
        {product.name}
      </h3>
      <p className="mt-0.5 text-[11px] text-muted">{product.weight_variant}</p>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-sm font-bold text-ink">{formatINR(product.price)}</span>

        {out ? (
          <button
            disabled
            className="rounded-md border border-line px-3 py-1 text-xs font-semibold text-muted"
          >
            Sold out
          </button>
        ) : qty === 0 ? (
          <button
            onClick={() => add(product)}
            className="rounded-md border border-brand-600 px-4 py-1 text-xs font-bold text-brand-600 active:scale-95 transition hover:bg-brand-50"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-brand-600 text-white">
            <button
              onClick={() => setQty(product.id, qty - 1)}
              className="px-2.5 py-1 text-sm font-bold active:scale-90"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="min-w-4 text-center text-xs font-bold">{qty}</span>
            <button
              onClick={() => setQty(product.id, qty + 1)}
              disabled={qty >= product.stock_qty}
              className="px-2.5 py-1 text-sm font-bold active:scale-90 disabled:opacity-40"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
