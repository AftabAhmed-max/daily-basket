import { createServerAnonClient } from "./supabase/server";
import type { Product } from "./types";

// All storefront reads use the anon client (public RLS SELECT on products).
// Run server-side in Server Components so the grid arrives pre-rendered & fast.

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("getActiveProducts", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("category", category)
    .order("name", { ascending: true });
  if (error) {
    console.error("getProductsByCategory", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

export async function searchProducts(term: string): Promise<Product[]> {
  const supabase = createServerAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .ilike("name", `%${term}%`)
    .order("name", { ascending: true });
  if (error) {
    console.error("searchProducts", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}
