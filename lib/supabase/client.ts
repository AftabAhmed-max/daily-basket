"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser (anon) client — used for public product reads and the realtime
// stock subscription on the storefront. RLS allows anon SELECT on products only.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
