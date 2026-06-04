import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrders } from "@/lib/admin-data";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import AdminNav from "@/components/admin/AdminNav";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

const FILTERS = ["all", ...ORDER_STATUSES] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = status && FILTERS.includes(status as never) ? status : "all";
  const orders = await getOrders(active);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-3 py-4">
        <h1 className="mb-3 text-lg font-bold">Orders</h1>

        <div className="mb-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                active === f
                  ? "bg-brand-600 text-white"
                  : "border border-line bg-white text-muted"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted">
                    No orders {active !== "all" ? `with status "${active}"` : "yet"}.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-brand-700"
                      >
                        #{o.order_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-[11px] text-muted">{o.customer_phone}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">
                      {o.items.reduce((n, i) => n + i.qty, 0)} items
                    </td>
                    <td className="px-3 py-2.5 font-medium">{formatINR(o.total)}</td>
                    <td className="px-3 py-2.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
