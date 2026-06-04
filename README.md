# DailyBasket — Fresh. Fast. Delivered.

> A Zepto-style online supermarket. Order groceries in minutes, delivered to your door.

🌐 **Live Site:** [daily-basket-pi.vercel.app](https://daily-basket-pi.vercel.app/)

---

## About

DailyBasket is a mobile-first, full stack e-commerce web app built as a
Stackwork portfolio demo for a medium-sized local supermarket chain. Customers
browse groceries by category, search products, add to cart, pick a delivery
slot, and pay via Razorpay. A password-protected admin dashboard manages
products, stock, and orders — with real-time stock updates reflected live on
the storefront. Built and deployed by Stackwork.

---

## Pages

- **Home** — Location bar, search, category strip, Deals of the Day, dense product grids
- **Category** — Per-category product listing with real-time stock badges
- **Cart** — Slide-over / bottom sheet with qty controls, promo codes, delivery fee
- **Checkout** — Delivery details, slot selection, order summary, Razorpay payment
- **Order Success** — Order ID, summary, estimated delivery time
- **Admin Dashboard** — Stats, recent orders, products CMS, order management

---

## Key Features

- Full e-commerce flow from browsing to payment (guest checkout, no login required)
- Razorpay payment integration (test mode) with server-side verification
- Real-time stock sync via Supabase subscriptions — admin edits reflect live on storefront
- Delivery slot selection (Zepto-style steps)
- Promo code support
- Order confirmation emails via Resend
- Password-protected admin dashboard with products CMS and order management
- Mobile-first, fully responsive across mobile, tablet, and desktop
- Deployed on Vercel

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Framework (App Router) |
| Tailwind CSS v4 | Styling |
| Supabase | Database, auth, real-time stock |
| Razorpay | Payment gateway |
| Resend | Order confirmation emails |
| Vercel | Deployment |

---

## Running Locally

```bash
git clone https://github.com/AftabAhmed-max/dailybasket.git
cd dailybasket
npm install
npm run dev
```

Add your environment variables to .env.local:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RESEND_API_KEY=
ADMIN_PASSWORD=
FROM_EMAIL=onboarding@resend.dev
```

---

## Built By

**[Stackwork](https://stackworkhq.com/)** — Digital agency serving
businesses across India and the Gulf.
