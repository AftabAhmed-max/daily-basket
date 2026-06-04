export type Category = {
  name: string;
  slug: string;
  emoji: string;
};

// The 8 storefront categories. `name` is stored verbatim in the DB `products.category` column.
export const CATEGORIES: Category[] = [
  { name: "Fruits & Veg", slug: "fruits-veg", emoji: "🥦" },
  { name: "Dairy & Eggs", slug: "dairy-eggs", emoji: "🥛" },
  { name: "Snacks", slug: "snacks", emoji: "🍿" },
  { name: "Beverages", slug: "beverages", emoji: "🥤" },
  { name: "Personal Care", slug: "personal-care", emoji: "🧴" },
  { name: "Cleaning", slug: "cleaning", emoji: "🧽" },
  { name: "Frozen", slug: "frozen", emoji: "🧊" },
  { name: "Breakfast & Cereals", slug: "breakfast-cereals", emoji: "🥣" },
];

export const categoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const slugForCategory = (name: string) =>
  CATEGORIES.find((c) => c.name === name)?.slug ?? "";

// Cart / checkout rules
export const DELIVERY_FEE = 40; // flat ₹40
export const FREE_DELIVERY_THRESHOLD = 500; // free above ₹500
export const PROMO_CODE = "DAILY10";
export const PROMO_DISCOUNT = 0.1; // 10% off

export const DELIVERY_SLOTS = [
  { day: "Today", windows: ["Morning 7–10am", "Afternoon 12–3pm", "Evening 5–8pm"] },
  { day: "Tomorrow", windows: ["Morning 7–10am", "Afternoon 12–3pm", "Evening 5–8pm"] },
];

export const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
