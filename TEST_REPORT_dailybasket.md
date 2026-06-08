# DailyBasket — Playwright Test Report

## Run information
| | |
|---|---|
| **Date** | 2026-06-09 (run executed 2026-06-08 20:56 UTC) |
| **Target URL** | https://daily-basket-pi.vercel.app (live Vercel deployment — never localhost) |
| **Playwright version** | 1.60.0 |
| **Browser** | Chromium (Desktop Chrome device profile) + 375×812 mobile viewport project |
| **Test files** | `tests/functional.spec.ts`, `tests/crash.spec.ts` |
| **Total wall time** | ~31s (4 parallel workers) |

## Summary
| Metric | Count |
|---|---|
| **Total** | 42 |
| **Passed** | 42 |
| **Failed** | 0 |
| **Skipped** | 0 |

✅ **All tests passed.** No real payment was completed and no real order was persisted (the Razorpay SDK is network-blocked in every checkout test, so `window.Razorpay` never opens and `/api/checkout/verify` is never reached). The unauthenticated admin-product create attempt returned `401`, so no product was created. **No test data cleanup was required.**

> Note: the price-integrity and checkout tests do make real `POST /api/razorpay/order` calls, which create **Razorpay TEST-mode** order objects (no money, no card, no DB order). This is intentional and matches the "Razorpay test mode / do not complete real payment" constraint.

---

## What was covered

### functional.spec.ts (29 tests)
- **Navigation** — header brand/cart control, search bar routes to `/search?q=`, logo returns home, all 8 category-strip links present.
- **Pages load** — `/`, `/search`, `/checkout`, `/admin/login`, and all 8 `/category/[slug]` pages return `<400` and render a body.
- **Shop** — home renders seeded products (count derived from DOM, not hardcoded); category page narrows the grid (`category cards < full catalogue`) and its `"{n} items"` header equals the rendered card count; search returns matches with a count.
- **Cart** — add → increase (subtotal ×2) → decrease (×1) → remove (empty state); `DAILY10` promo applies exactly `round(subtotal × 0.10)`.
- **Guest checkout** — fills delivery, reaches the Payment step, and asserts **the amount handed to Razorpay equals the server-computed total**: `amount(paise) === round(totals.total × 100)` AND `totals.total === cart total === UI "Amount payable"`. Payment is never completed.
- **Admin** — correct password → Dashboard + logout → login; wrong password rejected and `/admin` bounces to login; orders list, products list, and a **real** `/admin/orders/[id]` detail page all load.
- **Responsive @375px** — header, hamburger-area nav, cart control, search, and product grid all render on mobile.

### crash.spec.ts (13 tests)
Severity-tagged abuse/security sweep — see findings below.

---

## Security & abuse findings

**No real bugs found.** Every CRITICAL/WARNING probe confirmed the server behaves correctly. Details:

### [CRITICAL] Price integrity — ✅ SECURE
- Cart payload is only `{id, qty}`; the server (`buildOrderFromCart`) re-fetches authoritative prices from the DB and recomputes via `computeTotals`.
- A forged payload (`price: 0.01`, `total: 1`, `amount: 1` injected) returned the **same total as the legit request** — every forged field was ignored. `amount > 1` confirmed.
- A nonexistent product id is rejected with `400` ("…no longer exists"), never priced.

### [CRITICAL] Admin auth bypass — ✅ SECURE
- Unauthenticated `/admin`, `/admin/orders`, `/admin/products` all `307`-redirect to `/admin/login`.
- `POST /api/admin/products`, `PATCH /api/admin/orders/[id]`, `PATCH /api/admin/products/[id]` without a session all return `401 Unauthorized`. Auth is a real httpOnly cookie (`db_admin` = SHA-256 token), not localStorage.

### [CRITICAL] XSS — ✅ SECURE
- `<script>alert(1)</script>` in the `?q=` search param: no dialog, no live `<script>` injected into `<main>` (React escapes the reflected term).
- `<img src=x onerror=alert(1)>` in checkout name/address fields: no dialog fired.

### [WARNING] Cart abuse — ✅ HANDLED
- `qty: 0` and `qty: -5` are scrubbed → `400 "Cart is empty"`.
- Empty cart → `400`. Empty-cart `/checkout` shows the empty-state, not a broken form.

### [WARNING] Admin password — ✅ HANDLED
- Wrong password → `401` with **no `db_admin` cookie** in the response. Empty password → `401`.

### [MINOR] Robustness — ✅ GRACEFUL
- Unknown route → `404` with a rendered page (no white screen).
- Garbage category slug (`/category/not-a-real-category-zzz`) → `404` via `notFound()`.
- 5,000-char search input → page loads, no `5xx`.
- Rapid double-increment in the cart recomputes cleanly (no `NaN`/negative).

### Console / page-error sweep — ✅ CLEAN
Navigated all 12 main routes; **zero uncaught page exceptions** and **zero meaningful console errors** (network noise from blocked third parties / the realtime socket / the image CDN is filtered out, as it is not an app crash).

---

## Real bugs vs false alarms

| # | Observation during authoring | Assessment |
|---|---|---|
| 1 | Initial run: 3 cart tests failed (`Increase`/`Decrease` click intercepted by the cart-sheet backdrop; discount locator matched `<dt>` not `<dd>`). | **FALSE ALARM (test-harness bug).** The cart-sheet stepper buttons have no `aria-label` (only the product-card stepper does), so `getByRole("Increase")` resolved to the card *behind* the open sheet. Fixed by operating the sheet's own stepper buttons by index and correcting the discount selector. Re-ran → pass. Not an app defect. |
| 2 | `curl` of `/category/fruits-veg` appeared to show `"0 items"`. | **FALSE ALARM.** Artifact of grepping the Next.js RSC streaming payload. The rendered page correctly shows 6 product cards, and the Playwright assertion (`header count === rendered grid count`) passes. |

**No genuine application bugs were found.**

---

## Recommended fixes (describe only — NOT applied)

These are minor polish/hardening notes, not defects:

1. **Add `aria-label`s to the cart-sheet quantity buttons** (`components/CartSheet.tsx`, the `−`/`+` buttons). They currently rely on glyph text only, which hurts accessibility and makes the sheet stepper indistinguishable from the product-card stepper for assistive tech and tests. (This is the root cause of finding #1.)
2. **Razorpay order endpoint is unauthenticated and unthrottled.** `POST /api/razorpay/order` will happily create a TEST-mode Razorpay order for any valid cart with no rate limit. Pricing is safe (server-recomputed), but consider basic rate-limiting / a simple bot check to avoid Razorpay test-order spam. *(MINOR — informational; not exploitable for price/charge abuse.)*
3. **Expose a stable test hook for product ids** (e.g. `data-product-id` on the card root). Product ids are not in the DOM today, so E2E price tests have to drive the full checkout UI to recover one. A data attribute would simplify future tests without weakening security.

---

## Crochetinggg severity comparison
No `Crochetinggg` baseline report is present in this repository, so a direct severity diff could not be performed. On absolute terms, **no CRITICAL or WARNING security finding was produced for DailyBasket** — price integrity, admin auth, RLS (orders are anon-INSERT-only and unreadable by the client), and XSS handling are all sound. There is therefore **nothing to escalate**.

---

## How to reproduce
```bash
# from project root
npm install            # @playwright/test@1.60.0 is in devDependencies
npx playwright install chromium
npx playwright test            # reads BASE_URL + ADMIN_PASSWORD from .env.test
```
`.env.test` (git-ignored via `.env*`) holds `BASE_URL` and `ADMIN_PASSWORD`.
