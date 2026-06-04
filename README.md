# 🧺 DailyBasket

**Fresh. Fast. Delivered.** — a mobile-first, Zepto-style online supermarket.

Built with Next.js (App Router) · Tailwind v4 · Supabase · Razorpay (test) · Resend.

---

## 1. Install

```bash
npm install
```

## 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run `supabase/schema.sql` (tables, RLS, realtime, stock RPC).
3. Then run `supabase/seed.sql` (≈48 demo products across 8 categories).
4. From **Project Settings → API**, copy the URL, the `anon` key, and the `service_role` key.

## 3. Environment

Fill `.env.local` (already gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon public key
SUPABASE_SERVICE_ROLE_KEY=       # service_role secret (server only)
NEXT_PUBLIC_RAZORPAY_KEY_ID=     # Razorpay TEST key id (rzp_test_...)
RAZORPAY_KEY_SECRET=             # Razorpay TEST secret
RESEND_API_KEY=                  # Resend API key
FROM_EMAIL=onboarding@resend.dev # verified sender
ADMIN_PASSWORD=                  # password for /admin
```

- **Razorpay**: dashboard → *Test Mode* → API Keys. Test card `4111 1111 1111 1111`, any future expiry, any CVV.
- **Resend**: `onboarding@resend.dev` works out of the box for the sender; emails go to the address entered at checkout.

## 4. Run

```bash
npm run dev
```

Dev server binds to `0.0.0.0`, so you can test on your phone at **http://192.168.0.113:3000** (same Wi-Fi). `allowedDevOrigins` is set in `next.config.ts`.

---

## Routes

| Path | What |
|------|------|
| `/` | Homepage — location bar, search, categories, deals, product grids |
| `/category/[slug]` | Category listing (real-time stock) |
| `/search?q=` | Search results |
| `/checkout` | 3-step guest checkout → Razorpay → success |
| `/checkout/success` | Order confirmation |
| `/admin` | Dashboard (password-gated) |
| `/admin/products` | Products CMS — add/edit/delete, stock, active toggle |
| `/admin/orders` | Orders list + detail + status updates |

## How it fits together

- **Guest checkout**: cart lives in `localStorage`. At payment, the server **recomputes the total from DB prices**, creates a Razorpay order, and after payment **verifies the signature server-side** before creating the order, decrementing stock atomically (`decrement_stock` RPC), and emailing confirmation.
- **Security**: products are publicly readable (RLS); orders are insert-only from the client and never readable by the browser — all order reads/writes go through server routes using the `service_role` key. The admin gate is an env-password → httpOnly cookie.
- **Real-time stock**: the storefront grid subscribes to Supabase realtime on `products`; admin stock/price/active edits reflect live without a refresh.

## Product images

Demo images use keyword-matched `loremflickr.com` URLs (stable via `?lock=`) so nothing 404s. Swap any `image_url` to a specific Unsplash/Pexels URL from **/admin → Products → Edit**.

## Deploy (Vercel)

1. Push to GitHub.
2. Import into Vercel, add all env vars from `.env.local`.
3. Deploy. (Supabase + Razorpay test keys work in production too.)
