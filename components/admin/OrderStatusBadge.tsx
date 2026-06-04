import type { OrderStatus } from "@/lib/constants";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-brand-100 text-brand-700",
  delivered: "bg-teal/15 text-teal-dark",
  cancelled: "bg-slate-200 text-slate-600",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
