export default function DealsBanner() {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-teal p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-100">
            Deals of the Day
          </p>
          <h2 className="mt-0.5 text-xl font-extrabold leading-tight">
            Flat 10% OFF
          </h2>
          <p className="mt-1 text-xs text-brand-50">
            Use code{" "}
            <span className="rounded bg-white/20 px-1.5 py-0.5 font-bold tracking-wider">
              DAILY10
            </span>{" "}
            at checkout
          </p>
        </div>
        <div className="text-5xl">🛒</div>
      </div>
      <p className="mt-3 text-[11px] text-brand-50">
        🚚 FREE delivery on orders above ₹500 · Delivered in 15 minutes
      </p>
    </div>
  );
}
