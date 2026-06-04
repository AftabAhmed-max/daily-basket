import type { OrderStatus } from "./constants";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_qty: number;
  weight_variant: string;
  image_url: string;
  active: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  weight_variant: string;
  qty: number;
  stock_qty: number;
};

// Snapshot of a line item stored on the order (JSONB), independent of live product rows.
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  weight_variant: string;
  qty: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_slot: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_id: string | null;
  status: OrderStatus;
  created_at: string;
};
