import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts } from "@/lib/admin-data";
import AdminNav from "@/components/admin/AdminNav";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAllProducts();

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-3 py-4">
        <ProductsManager initial={products} />
      </div>
    </>
  );
}
