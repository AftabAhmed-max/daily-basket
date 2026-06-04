import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/admin-data";
import { formatINR } from "@/lib/format";
import AdminNav from "@/components/admin/AdminNav";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusActions from "@/components/admin/OrderStatusActions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-3xl px-3 py-4">
        <Link href="/admin/orders" className="text-xs font-semibold text-brand-600">
          ← All orders
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-bold">Order #{order.order_number}</h1>
          <OrderStatusBadge status={order.status} />
          <span className="ml-auto text-xs text-muted">
            {new Date(order.created_at).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="mb-2 text-sm font-bold">Customer</h2>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="text-sm text-muted">{order.customer_phone}</p>
            <p className="text-sm text-muted">{order.customer_email}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="mb-2 text-sm font-bold">Delivery</h2>
            <p className="text-sm">{order.delivery_address}</p>
            <p className="mt-1 text-sm text-muted">🕒 {order.delivery_slot}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-white">
          <h2 className="border-b border-line px-4 py-3 text-sm font-bold">Items</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between px-4 py-2.5 text-sm">
                <span>
                  {i.name}{" "}
                  <span className="text-muted">({i.weight_variant}) × {i.qty}</span>
                </span>
                <span className="font-medium">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-line px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span>{order.delivery_fee === 0 ? "FREE" : formatINR(order.delivery_fee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-600">
                <span>Discount</span>
                <span>−{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1 text-base font-bold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-white p-4">
          <h2 className="mb-1 text-sm font-bold">Payment</h2>
          <p className="text-xs text-muted">
            Razorpay payment ID:{" "}
            <span className="font-mono text-ink">{order.payment_id ?? "—"}</span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-white p-4">
          <h2 className="mb-3 text-sm font-bold">Update status</h2>
          <OrderStatusActions orderId={order.id} current={order.status} />
        </div>
      </div>
    </>
  );
}
