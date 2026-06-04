"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-3 py-2.5">
        <Link href="/admin" className="mr-3 text-base font-extrabold">
          Daily<span className="text-brand-600">Basket</span>
          <span className="ml-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
            ADMIN
          </span>
        </Link>
        <nav className="flex gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="ml-auto rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
