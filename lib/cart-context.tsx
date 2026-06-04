"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { CartItem, Product } from "./types";
import { PROMO_CODE } from "./constants";
import { computeTotals } from "./pricing";

const STORAGE_KEY = "dailybasket_cart_v1";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  promoApplied: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  qtyOf: (id: string) => number;
  count: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items ?? []);
        setPromoApplied(parsed.promoApplied ?? false);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, promoApplied }));
  }, [items, promoApplied, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const maxQty = product.stock_qty;
      if (existing) {
        const nextQty = Math.min(existing.qty + 1, maxQty);
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: nextQty, stock_qty: maxQty } : i
        );
      }
      if (maxQty <= 0) return prev;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          weight_variant: product.weight_variant,
          qty: 1,
          stock_qty: maxQty,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) =>
        i.id === id ? { ...i, qty: Math.min(qty, i.stock_qty) } : i
      );
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setPromoApplied(false);
  }, []);

  const applyPromo = useCallback((code: string) => {
    if (code.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      return true;
    }
    return false;
  }, []);

  const removePromo = useCallback(() => setPromoApplied(false), []);

  const qtyOf = useCallback(
    (id: string) => items.find((i) => i.id === id)?.qty ?? 0,
    [items]
  );

  const { count, subtotal, deliveryFee, discount, total } = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    return { count, ...computeTotals(items, promoApplied) };
  }, [items, promoApplied]);

  const value: CartContextValue = {
    items,
    isOpen,
    promoApplied,
    openCart,
    closeCart,
    add,
    setQty,
    remove,
    clear,
    applyPromo,
    removePromo,
    qtyOf,
    count,
    subtotal,
    deliveryFee,
    discount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
