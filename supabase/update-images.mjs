// One-off: replace demo product images with accurate, fast-loading Unsplash URLs.
// Updates the live Supabase rows by product name (matches seed.sql).
// Run:  node supabase/update-images.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// minimal .env.local loader
const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format&q=70`;

// name -> unsplash photo id  (all visually verified)
const MAP = [
  ["Fresh Tomatoes", "1607305387299-a3d9611cd469"],
  ["Onions", "1620574387735-3624d75b2dbc"],
  ["Bananas", "1571771894821-ce9b6c11b08e"],
  ["Baby Spinach", "1576045057995-568f588f82fb"],
  ["Potatoes", "1518977676601-b53f82aba655"],
  ["Royal Gala Apples", "1568702846914-96b305d2aaeb"],
  ["Amul Taaza Milk", "1563636619-e9143da7973b"],
  ["Fresh Paneer", "1631452180519-c014fe946bc7"],
  ["Creamy Curd", "1488477181946-6428a0291777"],
  ["Amul Butter", "1589985270826-4b7bb135bc9d"],
  ["Farm Eggs", "1582722872445-44dc5f7e3c8f"],
  ["Cheese Slices", "1486297678162-eb2a19b0a32d"],
  ["Lay's Classic Salted", "1566478989037-eec170784d0b"],
  ["Parle-G Biscuits", "1558961363-fa8fdf82db35"],
  ["Haldiram Namkeen Mix", "1606491956689-2ea866880c84"],
  ["Dark Fantasy Cookies", "1499636136210-6f4ee915583e"],
  ["Kurkure Masala Munch", "1613919113640-25732ec5e61f"],
  ["Roasted Almonds", "1508061253366-f7da158b6d46"],
  ["Coca-Cola", "1554866585-cd94860890b7"],
  ["Tropicana Orange Juice", "1600271886742-f049cd451bba"],
  ["Bisleri Water", "1560023907-5f339617ea30"],
  ["Red Bull Energy Drink", "1625772299848-391b6a87d7b3"],
  ["Tata Tea Gold", "1564890369478-c89ca6d9cde9"],
  ["Nescafe Classic Coffee", "1559056199-641a0ac8b55e"],
  ["Colgate Toothpaste", "1607613009820-a29f7bb81c04"],
  ["Dove Beauty Bar", "1600857544200-b2f666a9a2ec"],
  ["Head & Shoulders Shampoo", "1556228578-8c89e6adf883"],
  ["Dettol Handwash", "1584305574647-0cc949a2bb9f"],
  ["Gillette Guard Razor", "1621607512214-68297480165e"],
  ["Nivea Body Lotion", "1556228720-195a672e8a03"],
  ["Surf Excel Detergent", "1610557892470-55d9e80c0bce"],
  ["Vim Dishwash Gel", "1585421514738-01798e348b17"],
  ["Harpic Toilet Cleaner", "1563453392212-326f5e854473"],
  ["Lizol Floor Cleaner", "1583947215259-38e31be8751f"],
  ["Colin Glass Cleaner", "1581578731548-c64695cc6952"],
  ["Scotch-Brite Scrub Pad", "1583947581924-860bda6a26df"],
  ["McCain French Fries", "1630384060421-cb20d0e0649d"],
  ["Amul Vanilla Ice Cream", "1576506295286-5cda18df43e7"],
  ["Frozen Chicken Nuggets", "1562967914-608f82629710"],
  ["Frozen Aloo Paratha", "1565557623262-b51c2513a641"],
  ["Frozen Sweet Corn", "1551754655-cd27e38d2076"],
  ["Kellogg's Corn Flakes", "1521483451569-e33803c0330c"],
  ["Quaker Oats", "1614961233913-a5113a4a34ed"],
  ["Saffola Honey", "1587049352851-8d4e89133924"],
  ["Kissan Mixed Fruit Jam", "1597528662465-55ece5734101"],
  ["Britannia Brown Bread", "1509440159596-0249088772ff"],
  ["Maggi 2-Minute Noodles", "1612927601601-6638404737ce"],
];

let ok = 0;
for (const [name, id] of MAP) {
  const { error, count } = await supabase
    .from("products")
    .update({ image_url: img(id) }, { count: "exact" })
    .eq("name", name);
  if (error) console.error("✗", name, error.message);
  else {
    ok++;
    if (!count) console.warn("  (no row matched:", name, ")");
  }
}

// Rename "Frozen Green Peas" -> "Frozen Broccoli Florets" with a matching image
const { error: rErr } = await supabase
  .from("products")
  .update({
    name: "Frozen Broccoli Florets",
    image_url: img("1615485290382-441e4d049cb5"),
  })
  .eq("name", "Frozen Green Peas");
if (rErr) console.error("✗ broccoli rename", rErr.message);
else ok++;

console.log(`\nDone. ${ok}/${MAP.length + 1} products updated.`);
