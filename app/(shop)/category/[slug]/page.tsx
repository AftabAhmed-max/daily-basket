import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryBySlug } from "@/lib/constants";
import { getProductsByCategory } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.name);

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
        <h1 className="text-lg font-bold">
          <span className="mr-1">{category.emoji}</span>
          {category.name}
        </h1>
        <span className="ml-auto text-xs text-muted">
          {products.length} items
        </span>
      </div>

      <ProductGrid initial={products} category={category.name} />
    </div>
  );
}
