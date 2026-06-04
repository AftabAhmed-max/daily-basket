"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import SearchBar from "./SearchBar";

const LOCATION_KEY = "dailybasket_location";

export default function Header() {
  const { count, openCart } = useCart();
  const [location, setLocation] = useState("Mumbai, Maharashtra");

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) setLocation(saved);
  }, []);

  const changeLocation = () => {
    const next = window.prompt("Enter your delivery location", location);
    if (next && next.trim()) {
      setLocation(next.trim());
      localStorage.setItem(LOCATION_KEY, next.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-600 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-3 pt-2.5 pb-2">
        {/* Top row: location + brand + cart */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={changeLocation}
            className="flex min-w-0 items-start gap-1.5 text-left"
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="min-w-0">
              <span className="block text-[11px] leading-none text-brand-100">
                Delivery in 15 mins
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold leading-tight">
                <span className="truncate max-w-[150px]">{location}</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
            </span>
          </button>

          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="text-lg font-extrabold tracking-tight">
              Daily<span className="text-brand-200">Basket</span>
            </span>
            <span className="text-[9px] text-brand-100">Fresh. Fast. Delivered.</span>
          </Link>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 active:scale-95 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
              <path d="M6 6L5 3H2" strokeLinecap="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mt-2.5">
          <Suspense fallback={<div className="h-10 rounded-lg bg-white/90" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
