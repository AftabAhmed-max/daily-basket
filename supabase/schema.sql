-- ============================================================
-- DailyBasket — Supabase schema + RLS
-- Paste this into the Supabase SQL editor and run it.
-- Then run seed.sql to load demo products.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null,
  price          numeric(10,2) not null check (price >= 0),
  stock_qty      integer not null default 0 check (stock_qty >= 0),
  weight_variant text not null default '',
  image_url      text not null default '',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (active);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  delivery_address text not null,
  delivery_slot    text not null,
  items            jsonb not null default '[]'::jsonb,
  subtotal         numeric(10,2) not null default 0,
  delivery_fee     numeric(10,2) not null default 0,
  discount         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  payment_id       text,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','delivered','cancelled')),
  created_at       timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- PRODUCTS: publicly readable by anon (storefront). Writes happen only via the
-- service-role key in server-side admin routes, which bypasses RLS entirely.
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  to anon, authenticated
  using (true);

-- ORDERS: the browser may INSERT an order (guest checkout), but may NOT read
-- any order back. All reads/updates go through server routes using the
-- service-role key. This keeps customer data off the client.
drop policy if exists "orders client insert" on public.orders;
create policy "orders client insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- (no SELECT/UPDATE/DELETE policy for anon => denied by default)

-- ============================================================
-- REALTIME: broadcast product changes to the storefront
-- ============================================================
alter publication supabase_realtime add table public.products;

-- ============================================================
-- Atomic stock decrement used by the checkout-verify route.
-- Decrements only if enough stock remains; returns the new qty.
-- ============================================================
create or replace function public.decrement_stock(p_id uuid, p_qty integer)
returns integer
language plpgsql
security definer
as $$
declare
  new_qty integer;
begin
  update public.products
    set stock_qty = stock_qty - p_qty
    where id = p_id and stock_qty >= p_qty
    returning stock_qty into new_qty;
  return new_qty; -- null if not enough stock
end;
$$;
