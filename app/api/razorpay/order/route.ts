import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { buildOrderFromCart, type CartLine } from "@/lib/order-build";

// Creates a Razorpay (TEST) order for the server-computed total.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cart: CartLine[] = body.cart ?? [];
    const promoApplied: boolean = !!body.promoApplied;

    const built = await buildOrderFromCart(cart, promoApplied);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(built.total * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      totals: {
        subtotal: built.subtotal,
        discount: built.discount,
        deliveryFee: built.deliveryFee,
        total: built.total,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
