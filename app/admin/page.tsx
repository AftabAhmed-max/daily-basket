import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardStats } from "@/lib/admin-data";
import { formatINR } from "@/lib/format";
import AdminNav from "@/components/admin/AdminNav";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getDashboardStats();

  const cards = [
    { label: "Orders today", value: stats.ordersToday, tint: "bg-brand-50 text-brand-700" },
    { label: "Revenue today", value: formatINR(stats.revenueToday), tint: "bg-teal/10 text-teal-dark" },
    { label: "Low-stock alerts", value: stats.lowStock, tint: "bg-amber-50 text-amber-700" },
    { label: "Total products", value: stats.totalProducts, tint: "bg-slate-100 text-slate-700" },
  ];

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-3 py-4">
        <h1 className="mb-3 text-lg font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-muted">{c.label}</p>
              <p className={`mt-1 inline-block rounded px-1 text-2xl font-extrabold ${c.tint}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-600">
              View all →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-line">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700">
                          #{o.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">{o.customer_name}</td>
                      <td className="px-4 py-2.5 font-medium">{formatINR(o.total)}</td>
                      <td className="px-4 py-2.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">
                        {new Date(o.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
