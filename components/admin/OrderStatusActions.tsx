"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/constants";

export default function OrderStatusActions({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const update = async (status: OrderStatus) => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not update status");
  };

  const done = current === "delivered" || current === "cancelled";

  return (
    <div className="flex flex-wrap gap-2">
      {current === "pending" && (
        <button
          disabled={busy}
          onClick={() => update("confirmed")}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Mark confirmed
        </button>
      )}
      {!done && (
        <button
          disabled={busy}
          onClick={() => update("delivered")}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Mark delivered
        </button>
      )}
      {!done && (
        <button
          disabled={busy}
          onClick={() => update("cancelled")}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-600 disabled:opacity-50"
        >
          Cancel order
        </button>
      )}
      {done && (
        <p className="text-sm text-muted">
          This order is <span className="font-semibold capitalize">{current}</span>.
        </p>
      )}
    </div>
  );
}
