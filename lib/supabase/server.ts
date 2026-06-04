import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-side ANON client for public reads (products) inside Server Components
// and route handlers. No cookies/session — storefront reads are public via RLS.
export const createServerAnonClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
