import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Order, Product } from "./types";

const LOW_STOCK = 5;

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Product[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  return (data ?? null) as Order | null;
}

export async function getOrders(status?: string): Promise<Order[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data } = await query;
  return (data ?? []) as Order[];
}

export async function getDashboardStats() {
  const supabase = createAdminClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ data: todayOrders }, { data: products }, { data: recent }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("total, status")
        .gte("created_at", startOfDay.toISOString())
        .neq("status", "cancelled"),
      supabase.from("products").select("id, stock_qty, active"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const ordersToday = todayOrders?.length ?? 0;
  const revenueToday =
    todayOrders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
  const totalProducts = products?.length ?? 0;
  const lowStock =
    products?.filter((p) => p.active && p.stock_qty <= LOW_STOCK).length ?? 0;

  return {
    ordersToday,
    revenueToday,
    totalProducts,
    lowStock,
    recentOrders: (recent ?? []) as Order[],
  };
}
