import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

export const ADMIN_COOKIE = "db_admin";

// Deterministic token derived from the password so we never store the raw value
// in the cookie. Verified on every protected route/page.
export const adminToken = () =>
  createHash("sha256")
    .update("dailybasket::" + (process.env.ADMIN_PASSWORD ?? ""))
    .digest("hex");

export async function isAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && token === adminToken();
}

// For Server Components: bounce to the login page if not authenticated.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
