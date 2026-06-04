"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";
import { DELIVERY_SLOTS } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Delivery = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  day: string;
  window: string;
};

const STEPS = ["Delivery", "Summary", "Payment"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    promoApplied,
    clear,
  } = useCart();

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [d, setD] = useState<Delivery>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Mumbai",
    pincode: "",
    day: DELIVERY_SLOTS[0].day,
    window: DELIVERY_SLOTS[0].windows[0],
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-3 text-lg font-bold">Your cart is empty</h1>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const set = (k: keyof Delivery, v: string) => setD((p) => ({ ...p, [k]: v }));

  const deliveryValid =
    d.name.trim() &&
    /\S+@\S+\.\S+/.test(d.email) &&
    /^\d{10}$/.test(d.phone) &&
    d.address.trim() &&
    d.city.trim() &&
    /^\d{6}$/.test(d.pincode);

  const slotLabel = `${d.day}, ${d.window}`;

  const startPayment = async () => {
    setError("");
    setPaying(true);
    try {
      const cart = items.map((i) => ({ id: i.id, qty: i.qty }));

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, promoApplied }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "DailyBasket",
        description: "Grocery order",
        order_id: data.orderId,
        prefill: { name: d.name, email: d.email, contact: d.phone },
        theme: { color: "#059669" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...resp,
                cart,
                promoApplied,
                delivery: {
                  name: d.name,
                  email: d.email,
                  phone: d.phone,
                  address: d.address,
                  city: d.city,
                  pincode: d.pincode,
                  slot: slotLabel,
                },
              }),
            });
            const vdata = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(vdata.error || "Verification failed");
            clear();
            router.push(
              `/checkout/success?order=${vdata.order_number}&total=${vdata.total}`
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Verification failed");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed to start");
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Stepper */}
      <div className="mb-4 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                i <= step ? "bg-brand-600 text-white" : "bg-surface text-muted"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs font-semibold ${
                i <= step ? "text-ink" : "text-muted"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-line" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {/* STEP 1: Delivery */}
      {step === 0 && (
        <div className="space-y-3">
          <h1 className="text-base font-bold">Delivery details</h1>
          <Field label="Full name">
            <input
              className={inputCls}
              value={d.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Aftab Siddiqui"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone (10 digits)">
              <input
                className={inputCls}
                inputMode="numeric"
                value={d.phone}
                onChange={(e) =>
                  set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
              />
            </Field>
            <Field label="Pincode">
              <input
                className={inputCls}
                inputMode="numeric"
                value={d.pincode}
                onChange={(e) =>
                  set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="400001"
              />
            </Field>
          </div>
          <Field label="Email (for confirmation)">
            <input
              className={inputCls}
              type="email"
              value={d.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Full address">
            <textarea
              className={inputCls}
              rows={2}
              value={d.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Flat / House no, building, street, area"
            />
          </Field>
          <Field label="City">
            <input
              className={inputCls}
              value={d.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">
              Delivery slot
            </p>
            <div className="flex gap-2">
              {DELIVERY_SLOTS.map((s) => (
                <button
                  key={s.day}
                  onClick={() => set("day", s.day)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold ${
                    d.day === s.day
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line text-ink"
                  }`}
                >
                  {s.day}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DELIVERY_SLOTS[0].windows.map((w) => (
                <button
                  key={w}
                  onClick={() => set("window", w)}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-semibold leading-tight ${
                    d.window === w
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line text-ink"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!deliveryValid}
            onClick={() => setStep(1)}
            className="mt-2 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Continue to summary
          </button>
        </div>
      )}

      {/* STEP 2: Summary */}
      {step === 1 && (
        <div className="space-y-3">
          <h1 className="text-base font-bold">Order summary</h1>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 px-3 py-2.5">
                <span className="text-[13px]">
                  {i.name}{" "}
                  <span className="text-muted">
                    ({i.weight_variant}) × {i.qty}
                  </span>
                </span>
                <span className="text-[13px] font-semibold">
                  {formatINR(i.price * i.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-line p-3 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row
              label="Delivery fee"
              value={deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
            />
            {discount > 0 && (
              <Row
                label="Discount (DAILY10)"
                value={`−${formatINR(discount)}`}
                green
              />
            )}
            <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface p-3 text-xs text-muted">
            <p className="font-semibold text-ink">{d.name} · {d.phone}</p>
            <p>{d.address}, {d.city} - {d.pincode}</p>
            <p className="mt-1">🕒 {slotLabel}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(0)}
              className="rounded-xl border border-line px-5 py-3 text-sm font-bold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment */}
      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-base font-bold">Payment</h1>
          <div className="rounded-xl border border-line p-4 text-center">
            <p className="text-xs text-muted">Amount payable</p>
            <p className="text-3xl font-extrabold text-ink">{formatINR(total)}</p>
            <p className="mt-2 text-[11px] text-muted">
              Secure payment via Razorpay · UPI / Card / Netbanking
            </p>
            <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              TEST MODE
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              disabled={paying}
              className="rounded-xl border border-line px-5 py-3 text-sm font-bold disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={startPayment}
              disabled={paying}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {paying ? "Processing…" : `Pay ${formatINR(total)}`}
            </button>
          </div>
          <p className="text-center text-[11px] text-muted">
            Test card: 4111 1111 1111 1111 · any future expiry · any CVV
          </p>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function Row({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-0.5 ${green ? "text-brand-600" : ""}`}
    >
      <span className={green ? "" : "text-muted"}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
