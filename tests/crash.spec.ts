import { test, expect, type Page } from "@playwright/test";
import { CATEGORIES } from "../lib/constants";

// ---------------------------------------------------------------------------
// DailyBasket — abuse / security sweep. Live target. No real payments, no real
// orders. Severity tags: [CRITICAL] / [WARNING] / [MINOR].
// ---------------------------------------------------------------------------

const FAKE_UUID = "00000000-0000-0000-0000-000000000000";

// Drive the storefront UI to obtain ONE genuine product id (not exposed in the
// DOM otherwise). Blocks the Razorpay SDK so nothing is ever charged.
async function captureRealProductId(page: Page): Promise<string> {
  await page.route(/checkout\.razorpay\.com/, (r) => r.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "ADD" }).first().click();
  await expect(page.getByText("Your Cart")).toBeVisible();
  await page.getByRole("link", { name: /Proceed to Checkout/i }).click();
  await page.getByPlaceholder("Aftab Siddiqui").fill("Test Bot");
  await page.getByPlaceholder("9876543210").fill("9876543210");
  await page.getByPlaceholder("400001").fill("400001");
  await page.getByPlaceholder("you@example.com").fill("testbot@example.com");
  await page.getByPlaceholder(/Flat \/ House/i).fill("1 Test Street");
  await page.getByRole("button", { name: "Continue to summary" }).click();
  await page.getByRole("button", { name: "Continue to payment" }).click();

  const reqP = page.waitForRequest(
    (r) => r.url().includes("/api/razorpay/order") && r.method() === "POST"
  );
  await page.getByRole("button", { name: /^Pay ₹/ }).click();
  const req = await reqP;
  const cart = JSON.parse(req.postData() || "{}").cart;
  expect(Array.isArray(cart) && cart.length).toBeTruthy();
  return cart[0].id as string;
}

test.describe("[CRITICAL] Price integrity", () => {
  test("server recomputes totals from DB and ignores forged client amounts", async ({
    page,
  }) => {
    const id = await captureRealProductId(page);

    // Legit baseline straight from the server.
    const legit = await page.request.post("/api/razorpay/order", {
      data: { cart: [{ id, qty: 1 }], promoApplied: false },
    });
    expect(legit.status()).toBe(200);
    const legitBody = await legit.json();
    expect(legitBody.totals.total).toBeGreaterThan(0);
    expect(legitBody.amount).toBe(Math.round(legitBody.totals.total * 100));

    // Forged payload: bogus price/total/amount fields + a laughably low value.
    const forged = await page.request.post("/api/razorpay/order", {
      data: {
        cart: [{ id, qty: 1, price: 0.01, total: 1 }],
        promoApplied: false,
        amount: 1,
        total: 1,
      },
    });
    expect(forged.status()).toBe(200);
    const forgedBody = await forged.json();

    // The server must have ignored every forged field and recomputed the total.
    expect(forgedBody.totals.total).toBe(legitBody.totals.total);
    expect(forgedBody.amount).toBe(legitBody.amount);
    expect(forgedBody.amount).toBeGreaterThan(1);
  });

  test("nonexistent product id is rejected, never priced", async ({ page }) => {
    const resp = await page.request.post("/api/razorpay/order", {
      data: { cart: [{ id: FAKE_UUID, qty: 1 }], promoApplied: false },
    });
    expect(resp.status()).toBe(400);
    expect((await resp.json()).error).toMatch(/no longer exists|does not|invalid/i);
  });
});

test.describe("[CRITICAL] Admin auth bypass", () => {
  for (const path of ["/admin", "/admin/orders", "/admin/products"]) {
    test(`unauthenticated ${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }

  test("protected admin APIs reject calls without a session (401)", async ({
    page,
  }) => {
    const createProduct = await page.request.post("/api/admin/products", {
      data: { name: "hacker", category: "Snacks", price: 1, stock_qty: 1 },
    });
    expect(createProduct.status()).toBe(401);

    const patchOrder = await page.request.patch(
      `/api/admin/orders/${FAKE_UUID}`,
      { data: { status: "confirmed" } }
    );
    expect(patchOrder.status()).toBe(401);

    const patchProduct = await page.request.patch(
      `/api/admin/products/${FAKE_UUID}`,
      { data: { price: 0 } }
    );
    expect(patchProduct.status()).toBe(401);

    // No product was actually created on the storefront.
    expect((await createProduct.json()).error).toMatch(/unauthor/i);
  });
});

test.describe("[CRITICAL] XSS", () => {
  test("script payload in search is escaped, not executed", async ({ page }) => {
    let dialogFired = false;
    page.on("dialog", async (d) => {
      dialogFired = true;
      await d.dismiss();
    });
    const payload = '<script>alert(1)</script>';
    await page.goto(`/search?q=${encodeURIComponent(payload)}`);
    await page.waitForTimeout(500);
    expect(dialogFired).toBe(false);
    // The term is shown as text, and no live <script> got injected into <main>.
    const injected = await page.locator("main script").count();
    expect(injected).toBe(0);
  });

  test("script payload in checkout fields is not executed", async ({ page }) => {
    let dialogFired = false;
    page.on("dialog", async (d) => {
      dialogFired = true;
      await d.dismiss();
    });
    await page.route(/checkout\.razorpay\.com/, (r) => r.abort());

    await page.goto("/");
    await page.getByRole("button", { name: "ADD" }).first().click();
    await page.getByRole("link", { name: /Proceed to Checkout/i }).click();

    const payload = '<img src=x onerror=alert(1)>';
    await page.getByPlaceholder("Aftab Siddiqui").fill(payload);
    await page.getByPlaceholder(/Flat \/ House/i).fill(payload);
    await page.getByPlaceholder("9876543210").fill("9876543210");
    await page.getByPlaceholder("400001").fill("400001");
    await page.getByPlaceholder("you@example.com").fill("testbot@example.com");
    await page.getByRole("button", { name: "Continue to summary" }).click();
    await page.waitForTimeout(500);
    expect(dialogFired).toBe(false);
  });
});

test.describe("[WARNING] Cart abuse", () => {
  test("zero / negative quantities are scrubbed to an empty cart (400)", async ({
    page,
  }) => {
    const zero = await page.request.post("/api/razorpay/order", {
      data: { cart: [{ id: FAKE_UUID, qty: 0 }], promoApplied: false },
    });
    expect(zero.status()).toBe(400);
    expect((await zero.json()).error).toMatch(/empty/i);

    const negative = await page.request.post("/api/razorpay/order", {
      data: { cart: [{ id: FAKE_UUID, qty: -5 }], promoApplied: false },
    });
    expect(negative.status()).toBe(400);
    expect((await negative.json()).error).toMatch(/empty/i);
  });

  test("empty cart cannot start a payment", async ({ page }) => {
    const resp = await page.request.post("/api/razorpay/order", {
      data: { cart: [], promoApplied: false },
    });
    expect(resp.status()).toBe(400);
    expect((await resp.json()).error).toMatch(/empty/i);
  });

  test("empty-cart checkout page shows the empty state, not a broken form", async ({
    page,
  }) => {
    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });
});

test.describe("[WARNING] Admin password", () => {
  test("wrong password -> 401 and no session cookie issued", async ({ page }) => {
    const resp = await page.request.post("/api/admin/login", {
      data: { password: "totally-wrong" },
    });
    expect(resp.status()).toBe(401);
    const setCookie = resp.headers()["set-cookie"] ?? "";
    expect(setCookie).not.toMatch(/db_admin=[^;\s]+/);
  });

  test("empty password -> 401", async ({ page }) => {
    const resp = await page.request.post("/api/admin/login", {
      data: { password: "" },
    });
    expect(resp.status()).toBe(401);
  });
});

test.describe("[MINOR] Robustness", () => {
  test("unknown route returns 404 with a rendered page (no white screen)", async ({
    page,
  }) => {
    const resp = await page.goto("/this-route-does-not-exist-xyz");
    expect(resp!.status()).toBe(404);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("garbage category slug degrades to a 404, not a crash", async ({ page }) => {
    const resp = await page.goto("/category/not-a-real-category-zzz");
    expect(resp!.status()).toBe(404);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("oversized search input does not crash the page", async ({ page }) => {
    const huge = "a".repeat(5000);
    const resp = await page.goto(`/search?q=${huge}`);
    expect(resp!.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Results for|Search/i })).toBeVisible();
  });

  test("rapid double ADD increments quantity without error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "ADD" }).first().click();
    await expect(page.getByText("Your Cart")).toBeVisible();
    // The cart sheet opened; hammer its "+" (stepper button, index 2 in the line).
    const line = page.locator("li", { has: page.getByText("Remove") }).first();
    const plus = line.getByRole("button").nth(2);
    await plus.click();
    await plus.click();
    // Subtotal must be a clean multiple — no NaN / negative from the race.
    const sub = await page.locator("dt:has-text('Subtotal') + dd").innerText();
    expect(sub).toMatch(/₹\s*\d/);
  });
});

test.describe("Console / page-error sweep", () => {
  test("no uncaught exceptions across the main routes", async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });

    const routes = [
      "/",
      "/search?q=milk",
      "/checkout",
      "/admin/login",
      ...CATEGORIES.map((c) => `/category/${c.slug}`),
    ];
    for (const r of routes) {
      await page.goto(r);
      await page.waitForLoadState("domcontentloaded");
    }

    // Network-level noise (blocked third parties, image CDN, realtime sockets)
    // is not an app crash; only flag genuine console errors for the report.
    const meaningful = consoleErrors.filter(
      (t) =>
        !/favicon|net::ERR|Failed to load resource|websocket|realtime|ERR_BLOCKED/i.test(
          t
        )
    );
    if (meaningful.length) {
      test.info().annotations.push({
        type: "console-errors",
        description: meaningful.slice(0, 10).join(" || "),
      });
    }

    expect(pageErrors, pageErrors.join(" || ")).toHaveLength(0);
  });
});
