-- ============================================================
-- DailyBasket — demo seed data (~48 products, 6 per category)
-- Run AFTER schema.sql. Safe to re-run (clears products first).
-- Images: accurate, visually-verified Unsplash photos served via the
-- Unsplash CDN with `auto=format` (WebP/AVIF) for fast loading.
-- Swap any image_url to your own URL anytime from /admin.
-- ============================================================

truncate table public.products restart identity cascade;

insert into public.products (name, category, price, stock_qty, weight_variant, image_url, active) values
-- ---------- Fruits & Veg ----------
('Fresh Tomatoes',        'Fruits & Veg', 35,  60, '500 g',  'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=600&h=600&fit=crop&auto=format&q=70', true),
('Onions',                'Fruits & Veg', 45,  80, '1 kg',   'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=600&h=600&fit=crop&auto=format&q=70', true),
('Bananas',               'Fruits & Veg', 40,  50, '6 pcs',  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop&auto=format&q=70', true),
('Baby Spinach',          'Fruits & Veg', 25,   3, '250 g',  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop&auto=format&q=70', true),
('Potatoes',              'Fruits & Veg', 38,  70, '1 kg',   'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=600&fit=crop&auto=format&q=70', true),
('Royal Gala Apples',     'Fruits & Veg', 120, 40, '1 kg',   'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Dairy & Eggs ----------
('Amul Taaza Milk',       'Dairy & Eggs', 28,  90, '500 ml', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop&auto=format&q=70', true),
('Fresh Paneer',          'Dairy & Eggs', 85,  35, '200 g',  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop&auto=format&q=70', true),
('Creamy Curd',           'Dairy & Eggs', 55,  45, '400 g',  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop&auto=format&q=70', true),
('Amul Butter',           'Dairy & Eggs', 58,  50, '100 g',  'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop&auto=format&q=70', true),
('Farm Eggs',             'Dairy & Eggs', 42,  60, '6 pcs',  'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=600&fit=crop&auto=format&q=70', true),
('Cheese Slices',         'Dairy & Eggs', 130, 30, '200 g',  'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Snacks ----------
('Lay''s Classic Salted', 'Snacks', 20,  100, '73 g',  'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&h=600&fit=crop&auto=format&q=70', true),
('Parle-G Biscuits',      'Snacks', 15,  120, '100 g', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop&auto=format&q=70', true),
('Haldiram Namkeen Mix',  'Snacks', 45,  55,  '200 g', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=600&fit=crop&auto=format&q=70', true),
('Dark Fantasy Cookies',  'Snacks', 35,  40,  '75 g',  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=600&fit=crop&auto=format&q=70', true),
('Kurkure Masala Munch',  'Snacks', 20,  0,   '90 g',  'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=600&h=600&fit=crop&auto=format&q=70', true),
('Roasted Almonds',       'Snacks', 150, 25,  '100 g', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Beverages ----------
('Coca-Cola',             'Beverages', 45,  80, '750 ml', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=600&fit=crop&auto=format&q=70', true),
('Tropicana Orange Juice','Beverages', 85,  50, '1 L',    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=600&fit=crop&auto=format&q=70', true),
('Bisleri Water',         'Beverages', 20,  150,'1 L',    'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&h=600&fit=crop&auto=format&q=70', true),
('Red Bull Energy Drink', 'Beverages', 125, 35, '250 ml', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&h=600&fit=crop&auto=format&q=70', true),
('Tata Tea Gold',         'Beverages', 140, 45, '250 g',  'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=600&fit=crop&auto=format&q=70', true),
('Nescafe Classic Coffee','Beverages', 160, 30, '50 g',   'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Personal Care ----------
('Colgate Toothpaste',    'Personal Care', 55,  60, '100 g',  'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=600&fit=crop&auto=format&q=70', true),
('Dove Beauty Bar',       'Personal Care', 45,  70, '100 g',  'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&h=600&fit=crop&auto=format&q=70', true),
('Head & Shoulders Shampoo','Personal Care',110, 40,'180 ml', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&auto=format&q=70', true),
('Dettol Handwash',       'Personal Care', 85,  50, '200 ml', 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=600&h=600&fit=crop&auto=format&q=70', true),
('Gillette Guard Razor',  'Personal Care', 99,  45, '1 unit', 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop&auto=format&q=70', true),
('Nivea Body Lotion',     'Personal Care', 175, 30, '200 ml', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Cleaning ----------
('Surf Excel Detergent',  'Cleaning', 120, 50, '1 kg',    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=600&fit=crop&auto=format&q=70', true),
('Vim Dishwash Gel',      'Cleaning', 99,  55, '500 ml',  'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=600&fit=crop&auto=format&q=70', true),
('Harpic Toilet Cleaner', 'Cleaning', 85,  45, '500 ml',  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop&auto=format&q=70', true),
('Lizol Floor Cleaner',   'Cleaning', 185, 35, '975 ml',  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=600&fit=crop&auto=format&q=70', true),
('Colin Glass Cleaner',   'Cleaning', 95,  5,  '500 ml',  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop&auto=format&q=70', true),
('Scotch-Brite Scrub Pad','Cleaning', 30,  90, '2 pcs',   'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Frozen ----------
('McCain French Fries',   'Frozen', 99,  40, '420 g',  'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&h=600&fit=crop&auto=format&q=70', true),
('Frozen Broccoli Florets','Frozen', 75,  50, '500 g', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=600&fit=crop&auto=format&q=70', true),
('Amul Vanilla Ice Cream','Frozen', 160, 35, '1 L',    'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&h=600&fit=crop&auto=format&q=70', true),
('Frozen Chicken Nuggets','Frozen', 165, 30, '250 g',  'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=600&fit=crop&auto=format&q=70', true),
('Frozen Aloo Paratha',   'Frozen', 90,  45, '5 pcs',  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop&auto=format&q=70', true),
('Frozen Sweet Corn',     'Frozen', 85,  40, '500 g',  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&h=600&fit=crop&auto=format&q=70', true),

-- ---------- Breakfast & Cereals ----------
('Kellogg''s Corn Flakes','Breakfast & Cereals', 165, 40, '475 g', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600&h=600&fit=crop&auto=format&q=70', true),
('Quaker Oats',           'Breakfast & Cereals', 185, 45, '1 kg',  'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=600&h=600&fit=crop&auto=format&q=70', true),
('Saffola Honey',         'Breakfast & Cereals', 110, 50, '250 g', 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&h=600&fit=crop&auto=format&q=70', true),
('Kissan Mixed Fruit Jam','Breakfast & Cereals', 85,  55, '200 g', 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600&h=600&fit=crop&auto=format&q=70', true),
('Britannia Brown Bread', 'Breakfast & Cereals', 45,  60, '400 g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop&auto=format&q=70', true),
('Maggi 2-Minute Noodles','Breakfast & Cereals', 56,  100,'4 pack','https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&h=600&fit=crop&auto=format&q=70', true);
