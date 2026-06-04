import Link from "next/link";
import { searchProducts } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const products = term ? await searchProducts(term) : [];

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 pb-16">
      <div className="mb-3 flex items-center gap-2">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-lg"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-base font-bold">
          {term ? (
            <>
              Results for &ldquo;{term}&rdquo;{" "}
              <span className="text-muted">({products.length})</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
      </div>

      {term && products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          No products match &ldquo;{term}&rdquo;. Try another search.
        </p>
      ) : (
        <ProductGrid initial={products} />
      )}
    </div>
  );
}
