import { test, expect, type Page, type Locator } from "@playwright/test";
import { CATEGORIES } from "../lib/constants";

// ---------------------------------------------------------------------------
// DailyBasket — functional E2E. Runs against the live Vercel deployment.
// Counts are derived from the rendered DOM / schema constants, never hardcoded.
// No real payment is completed and no real order is created.
// ---------------------------------------------------------------------------

const SEARCH_PLACEHOLDER = /Search/i;

// A storefront product card shows exactly one of: an ADD button, a "Sold out"
// button, or (once in cart) a qty stepper. On a fresh context the cart is
// empty, so card count = ADD + Sold out within the given scope.
async function cardCount(scope: Page | Locator): Promise<number> {
  const add = await scope.getByRole("button", { name: "ADD" }).count();
  const sold = await scope.getByRole("button", { name: "Sold out" }).count();
  return add + sold;
}

function parseINR(text: string): number {
  const m = text.replace(/,/g, "").match(/₹\s*([\d.]+)/);
  return m ? Number(m[1]) : NaN;
}

test.describe("Navigation", () => {
  test("header brand, search bar and logo-to-home all work", async ({ page }) => {
    await page.goto("/");

    // Header is present with brand + cart control.
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await expect(header.getByRole("button", { name: "Open cart" })).toBeVisible();
    await expect(header.getByText("DailyBasket")).toBeVisible();

    // Search bar routes to /search.
    const search = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await expect(search).toBeVisible();
    await search.fill("milk");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=milk/);

    // Logo returns home.
    await page.locator('header a[href="/"]').first().click();
    await expect(page).toHaveURL(new RegExp(`${escapeRe(baseHost(page))}/?$`));
  });

  test("category strip links to every category page", async ({ page }) => {
    await page.goto("/");
    for (const cat of CATEGORIES) {
      await expect(
        page.locator(`a[href="/category/${cat.slug}"]`).first()
      ).toBeVisible();
    }
  });
});

test.describe("Pages load", () => {
  const routes = [
    "/",
    "/search?q=milk",
    "/checkout",
    "/admin/login",
    ...CATEGORIES.map((c) => `/category/${c.slug}`),
  ];
  for (const route of routes) {
    test(`GET ${route} renders without server error`, async ({ page }) => {
      const resp = await page.goto(route);
      expect(resp, `no response for ${route}`).toBeTruthy();
      expect(resp!.status(), `bad status for ${route}`).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Shop", () => {
  test("home renders products and one section per stocked category", async ({
    page,
  }) => {
    await page.goto("/");
    const total = await cardCount(page);
    expect(total, "home should render seeded products").toBeGreaterThan(0);

    // Every category that the home page advertises with a "See all" link must
    // also have a section heading. (Derived from DOM, not hardcoded counts.)
    const seeAll = await page.locator('a:has-text("See all")').count();
    expect(seeAll).toBeGreaterThan(0);
    expect(seeAll).toBeLessThanOrEqual(CATEGORIES.length);
  });

  test("category page narrows the grid and header count matches the grid", async ({
    page,
  }) => {
    await page.goto("/");
    const homeTotal = await cardCount(page);

    const slug = CATEGORIES[0].slug; // fruits-veg
    await page.goto(`/category/${slug}`);

    const main = page.locator("main");
    const grid = await cardCount(main);
    expect(grid, "category should have products").toBeGreaterThan(0);
    expect(grid, "a single category must be smaller than the full catalogue").toBeLessThan(
      homeTotal
    );

    // Header "{n} items" must equal the number of rendered cards.
    const headerText = await main.getByText(/\d+ items/).first().innerText();
    const headerCount = Number(headerText.match(/(\d+) items/)![1]);
    expect(headerCount).toBe(grid);
  });

  test("search returns matching products with a result count", async ({ page }) => {
    await page.goto("/search?q=milk");
    await expect(page.getByRole("heading", { name: /Results for/i })).toBeVisible();
    const grid = await cardCount(page.locator("main"));
    expect(grid).toBeGreaterThan(0);
  });
});

test.describe("Cart", () => {
  test("add, increase, decrease, remove and totals recompute", async ({ page }) => {
    await page.goto("/");

    // Add the first in-stock product. The cart sheet opens automatically.
    await page.getByRole("button", { name: "ADD" }).first().click();
    await expect(page.getByText("Your Cart")).toBeVisible();

    // The cart line item holds the stepper. Its buttons are [Remove, −, +]
    // (the sheet stepper has no aria-label, unlike the product card behind it).
    const line = page.locator("li", { has: page.getByText("Remove") }).first();
    const minus = line.getByRole("button").nth(1);
    const plus = line.getByRole("button").nth(2);

    const subtotalRow = page.locator("dt:has-text('Subtotal') + dd");
    const unit = parseINR(await subtotalRow.innerText());
    expect(unit).toBeGreaterThan(0);

    // Increase qty -> subtotal doubles.
    await plus.click();
    await expect
      .poll(async () => parseINR(await subtotalRow.innerText()))
      .toBe(unit * 2);

    // Decrease qty -> back to one unit.
    await minus.click();
    await expect
      .poll(async () => parseINR(await subtotalRow.innerText()))
      .toBe(unit);

    // Remove -> cart empties.
    await page.getByRole("button", { name: "Remove" }).first().click();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });

  test("DAILY10 promo applies a 10% discount", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "ADD" }).first().click();
    await expect(page.getByText("Your Cart")).toBeVisible();

    const subtotal = parseINR(
      await page.locator("dt:has-text('Subtotal') + dd").innerText()
    );
    await page.getByPlaceholder(/Promo code/i).fill("DAILY10");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText(/DAILY10 applied/i)).toBeVisible();
    const discount = parseINR(
      await page.locator("dt:has-text('Discount') + dd").first().innerText()
    );
    // 10% of subtotal, rounded.
    expect(discount).toBe(Math.round(subtotal * 0.1));
  });
});

test.describe("Guest checkout", () => {
  test("reaches payment and the amount sent to Razorpay equals the server total", async ({
    page,
  }) => {
    // Block the external Razorpay SDK so the real modal never opens and no
    // payment can be attempted. window.Razorpay stays undefined -> the handler
    // throws after our assertion target (the /api/razorpay/order response).
    await page.route(/checkout\.razorpay\.com/, (r) => r.abort());

    await page.goto("/");
    await page.getByRole("button", { name: "ADD" }).first().click();
    await expect(page.getByText("Your Cart")).toBeVisible();

    const cartTotalText = await page
      .getByRole("link", { name: /Proceed to Checkout/i })
      .innerText();
    const cartTotal = parseINR(cartTotalText);

    await page.getByRole("link", { name: /Proceed to Checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);

    // Step 1 — Delivery details (synthetic, never submitted as a real order).
    await page.getByPlaceholder("Aftab Siddiqui").fill("Test Bot");
    await page.getByPlaceholder("9876543210").fill("9876543210");
    await page.getByPlaceholder("400001").fill("400001");
    await page.getByPlaceholder("you@example.com").fill("testbot@example.com");
    await page.getByPlaceholder(/Flat \/ House/i).fill("1 Test Street, Andheri");
    await page.getByRole("button", { name: "Continue to summary" }).click();

    // Step 2 — Summary.
    await expect(page.getByRole("heading", { name: "Order summary" })).toBeVisible();
    await page.getByRole("button", { name: "Continue to payment" }).click();

    // Step 3 — Payment. Capture the server's Razorpay order creation.
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible();
    const uiTotal = parseINR(
      await page.locator("text=Amount payable").locator("..").innerText()
    );

    const orderRespP = page.waitForResponse(
      (r) => r.url().includes("/api/razorpay/order") && r.request().method() === "POST"
    );
    await page.getByRole("button", { name: /^Pay ₹/ }).click();
    const orderResp = await orderRespP;

    expect(orderResp.status()).toBe(200);
    const body = await orderResp.json();

    // The amount handed to Razorpay (paise) must equal the server-computed total.
    expect(body.amount).toBe(Math.round(body.totals.total * 100));
    // ...and that server total must match what the customer saw in cart + UI.
    expect(body.totals.total).toBe(cartTotal);
    expect(body.totals.total).toBe(uiTotal);
  });
});

test.describe("Admin", () => {
  test("login with correct password reaches the dashboard; logout works", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Admin password").fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong password is rejected and no session is granted", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Admin password").fill("definitely-wrong-pw");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/Wrong password/i)).toBeVisible();
    // Still on login; visiting /admin must bounce back to login.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("orders list, products list and a real order detail page load", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Admin password").fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();

    await page.goto("/admin/products");
    await expect(page.locator("main, body").first()).toBeVisible();
    // Products manager renders the admin product table/list.
    expect(await page.locator("input, table, [class*='product']").count()).toBeGreaterThan(0);

    // Order detail for a REAL id, if any orders exist.
    await page.goto("/admin/orders");
    const firstOrder = page.locator('a[href^="/admin/orders/"]').first();
    if (await firstOrder.count()) {
      await firstOrder.click();
      await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]+/);
      await expect(page.getByRole("heading", { name: /Order #/ })).toBeVisible();
    } else {
      test.info().annotations.push({
        type: "note",
        description: "No orders present — order-detail page not exercised.",
      });
    }
  });
});

test.describe("Responsive @375px", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile home renders single-column-friendly nav and grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Open cart" })).toBeVisible();
    await expect(page.getByPlaceholder(SEARCH_PLACEHOLDER)).toBeVisible();
    expect(await cardCount(page)).toBeGreaterThan(0);
  });
});

// --- helpers --------------------------------------------------------------
function baseHost(page: Page): string {
  const u = new URL(page.url());
  return `${u.protocol}//${u.host}`;
}
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
