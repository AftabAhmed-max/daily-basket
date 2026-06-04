import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildOrderFromCart,
  generateOrderNumber,
  type CartLine,
} from "@/lib/order-build";
import { sendOrderConfirmation } from "@/lib/email";
import type { Order } from "@/lib/types";

type Delivery = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  slot: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      promoApplied,
      delivery,
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      cart: CartLine[];
      promoApplied: boolean;
      delivery: Delivery;
    } = body;

    // 1) Verify the payment signature server-side BEFORE trusting anything.
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }
    const expected = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 2) Basic delivery validation
    const required: (keyof Delivery)[] = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "pincode",
      "slot",
    ];
    for (const f of required) {
      if (!delivery?.[f]?.toString().trim()) {
        return NextResponse.json(
          { error: `Missing delivery field: ${f}` },
          { status: 400 }
        );
      }
    }

    // 3) Rebuild order from authoritative DB prices
    const built = await buildOrderFromCart(cart, !!promoApplied);
    const supabase = createAdminClient();

    // 4) Decrement stock atomically per line (rejects if oversold)
    for (const item of built.items) {
      const { data: newQty, error } = await supabase.rpc("decrement_stock", {
        p_id: item.id,
        p_qty: item.qty,
      });
      if (error || newQty === null) {
        return NextResponse.json(
          { error: `Stock changed for ${item.name}. Please review your cart.` },
          { status: 409 }
        );
      }
    }

    // 5) Persist the order
    const order_number = generateOrderNumber();
    const fullAddress = `${delivery.address}, ${delivery.city} - ${delivery.pincode}`;

    const { data: inserted, error: insertErr } = await supabase
      .from("orders")
      .insert({
        order_number,
        customer_name: delivery.name,
        customer_email: delivery.email,
        customer_phone: delivery.phone,
        delivery_address: fullAddress,
        delivery_slot: delivery.slot,
        items: built.items,
        subtotal: built.subtotal,
        delivery_fee: built.deliveryFee,
        discount: built.discount,
        total: built.total,
        payment_id: razorpay_payment_id,
        status: "confirmed",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("order insert failed", insertErr.message);
      return NextResponse.json(
        { error: "Could not save your order" },
        { status: 500 }
      );
    }

    // 6) Confirmation email (non-blocking failure)
    await sendOrderConfirmation(inserted as Order);

    return NextResponse.json({
      ok: true,
      order_number,
      total: built.total,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Checkout could not be completed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
