import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVICE ROLE client — bypasses RLS. Server-only. Never import into client code.
// Used by admin API routes and the checkout-verify route (order writes, stock decrement).
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
