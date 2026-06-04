import Link from "next/link";
import { formatINR } from "@/lib/format";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string }>;
}) {
  const { order, total } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">
        ✅
      </div>
      <h1 className="mt-4 text-xl font-extrabold">Order placed!</h1>
      <p className="mt-1 text-sm text-muted">
        Thank you for shopping with DailyBasket.
      </p>

      <div className="mt-5 rounded-2xl border border-line p-4 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Order number</span>
          <span className="font-bold">#{order ?? "—"}</span>
        </div>
        {total && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Amount paid</span>
            <span className="font-bold">{formatINR(Number(total))}</span>
          </div>
        )}
        <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-center text-sm font-semibold text-brand-700">
          🚚 Arriving in ~15 minutes
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        A confirmation email is on its way. Save your order number for reference.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
      >
        Continue shopping
      </Link>
    </div>
  );
}
