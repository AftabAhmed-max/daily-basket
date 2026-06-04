import Link from "next/link";
import { getActiveProducts } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";
import CategoryStrip from "@/components/CategoryStrip";
import DealsBanner from "@/components/DealsBanner";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getActiveProducts();
  const byCategory = (name: string) =>
    products.filter((p) => p.category === name);

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 pb-16">
      <CategoryStrip />

      <div className="mt-3">
        <DealsBanner />
      </div>

      {products.length === 0 && (
        <div className="mt-10 rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
          No products loaded yet. Run <code>supabase/schema.sql</code> and{" "}
          <code>supabase/seed.sql</code>, and set your Supabase keys in{" "}
          <code>.env.local</code>.
        </div>
      )}

      {CATEGORIES.map((cat) => {
        const items = byCategory(cat.name);
        if (items.length === 0) return null;
        return (
          <section key={cat.slug} className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">
                <span className="mr-1">{cat.emoji}</span>
                {cat.name}
              </h2>
              <Link
                href={`/category/${cat.slug}`}
                className="text-xs font-semibold text-brand-600"
              >
                See all →
              </Link>
            </div>
            <ProductGrid initial={items} category={cat.name} />
          </section>
        );
      })}
    </div>
  );
}
