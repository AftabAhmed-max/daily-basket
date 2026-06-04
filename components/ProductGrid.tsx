"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

// Renders a grid of products and keeps stock/price live via a Supabase
// realtime subscription. Admin edits reflect without a refresh.
export default function ProductGrid({
  initial,
  category,
}: {
  initial: Product[];
  category?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initial);

  useEffect(() => {
    setProducts(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`products-${category ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setProducts((prev) => {
            const row = (payload.new ?? payload.old) as Product;
            if (!row?.id) return prev;

            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== row.id);
            }

            const next = payload.new as Product;
            const belongs =
              !category || next.category === category;
            // Hide inactive products from the storefront live.
            if (!next.active || !belongs) {
              return prev.filter((p) => p.id !== next.id);
            }
            const exists = prev.some((p) => p.id === next.id);
            if (exists) {
              return prev.map((p) => (p.id === next.id ? { ...p, ...next } : p));
            }
            return [...prev, next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  if (products.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted">
        No products here yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
