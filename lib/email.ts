import "server-only";
import { Resend } from "resend";
import type { Order } from "./types";
import { formatINR } from "./format";

// Sends the order confirmation. Never throws into the checkout flow — a failed
// email must not fail a paid order; we log and move on.
export async function sendOrderConfirmation(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const resend = new Resend(apiKey);

  const rows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;color:#0f172a">${i.name} <span style="color:#64748b">(${i.weight_variant})</span> × ${i.qty}</td>
          <td style="padding:6px 0;text-align:right;color:#0f172a">${formatINR(i.price * i.qty)}</td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#059669;color:#fff;padding:18px 20px">
      <h1 style="margin:0;font-size:18px">DailyBasket</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#d1fae5">Fresh. Fast. Delivered.</p>
    </div>
    <div style="padding:20px">
      <h2 style="margin:0 0 4px;font-size:16px;color:#0f172a">Order confirmed 🎉</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#64748b">
        Hi ${order.customer_name}, we've received your order
        <strong>#${order.order_number}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">${rows}</table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0" />
      <table style="width:100%;font-size:13px;color:#0f172a">
        <tr><td>Subtotal</td><td style="text-align:right">${formatINR(order.subtotal)}</td></tr>
        <tr><td>Delivery</td><td style="text-align:right">${order.delivery_fee === 0 ? "FREE" : formatINR(order.delivery_fee)}</td></tr>
        ${order.discount > 0 ? `<tr><td style="color:#059669">Discount</td><td style="text-align:right;color:#059669">-${formatINR(order.discount)}</td></tr>` : ""}
        <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="text-align:right;font-weight:bold;padding-top:6px">${formatINR(order.total)}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0" />
      <p style="margin:0;font-size:13px;color:#64748b">
        <strong style="color:#0f172a">Delivery slot:</strong> ${order.delivery_slot}<br/>
        <strong style="color:#0f172a">Address:</strong> ${order.delivery_address}
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#64748b">Estimated delivery in 15 minutes within your slot.</p>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: `DailyBasket <${from}>`,
      to: order.customer_email,
      subject: `Order confirmed — #${order.order_number}`,
      html,
    });
  } catch (e) {
    console.error("Resend send failed:", e);
  }
}
