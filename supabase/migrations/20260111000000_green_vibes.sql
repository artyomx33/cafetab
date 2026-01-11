-- Green Vibes - Healthy Cafe & Salad Bar
-- Database migration for multi-restaurant support

-- ============================================
-- 1. INSERT GREEN VIBES RESTAURANT
-- ============================================

INSERT INTO restaurants (id, slug, name, tagline, currency, currency_symbol, locale, theme_primary, theme_gradient)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'green-vibes',
  'Green Vibes',
  'Create your own salad and eat healthy!',
  'MXN',
  '$',
  'es-MX',
  '#2F5233',
  'bg-gradient-to-r from-[#2F5233] to-[#4A7C59]'
);

-- ============================================
-- 2. INSERT GREEN VIBES CATEGORIES
-- ============================================

INSERT INTO cafe_categories (id, name, sort_order, is_visible, restaurant_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Salad Bar', 1, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'Salad Bases', 2, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000003', 'Proteins', 3, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004', 'Premium Vegetables', 4, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000005', 'Garnish', 5, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000006', 'Juices (500ml)', 6, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000007', 'Smoothies (500ml)', 7, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000008', 'Coffee Shop (335ml)', 8, true, 'c0000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000009', 'Beverages', 9, true, 'c0000000-0000-0000-0000-000000000003');

-- ============================================
-- 3. INSERT GREEN VIBES PRODUCTS
-- ============================================

-- Salad Bar
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Medium Salad', 180, 'Base + 2 Proteins + 4 Vegetables. Includes dressing, seeds, crunch & seasoning', true, 1, 8, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Large Salad', 220, 'Base + 3 Proteins + 6 Vegetables. Includes dressing, seeds, crunch & seasoning', true, 2, 10, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Medium Salad Combo', 210, 'Medium salad + Soft Drink (335ml)', true, 3, 8, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Large Salad Combo', 250, 'Large salad + Soft Drink (335ml)', true, 4, 10, 'c0000000-0000-0000-0000-000000000003');

-- Salad Bases
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Lettuce', 0, 'Included with salad', true, 1, 1, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Green Leaves', 45, 'Premium base upgrade', true, 2, 1, 'c0000000-0000-0000-0000-000000000003');

-- Proteins ($50 each, premium ones $90)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Tofu', 50, 'Plant-based protein', true, 1, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Egg', 50, NULL, true, 2, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000003', 'Chicken with Herbs', 50, NULL, true, 3, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000003', 'Tuna', 50, NULL, true, 4, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000003', 'Kanikama', 50, 'Imitation crab', true, 5, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000003', 'Quinoa', 50, 'Plant-based protein', true, 6, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000003', 'Bacon', 50, NULL, true, 7, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000003', 'Panela Cheese', 50, NULL, true, 8, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000003', 'Smoked Salmon', 90, 'Premium protein (+$40)', true, 9, 2, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000003', 'Shrimp', 90, 'Premium protein (+$40)', true, 10, 2, 'c0000000-0000-0000-0000-000000000003');

-- Premium Vegetables (+$40)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000004', 'Mango', 40, NULL, true, 1, 1, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000004', 'Avocado', 40, NULL, true, 2, 1, 'c0000000-0000-0000-0000-000000000003');

-- Garnish ($220)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000005', 'Guacamole', 220, NULL, true, 1, 3, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000005', 'Hummus', 220, NULL, true, 2, 3, 'c0000000-0000-0000-0000-000000000003');

-- Juices (500ml)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000006', 'Green Juice', 80, 'Fresh green juice', true, 1, 5, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000006', 'Orange Juice', 70, 'Fresh squeezed orange', true, 2, 5, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000006', 'Carrot Juice', 80, 'Fresh carrot juice', true, 3, 5, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000006', 'Coconut Water', 80, 'Natural coconut water', true, 4, 2, 'c0000000-0000-0000-0000-000000000003');

-- Smoothies (500ml)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000007', 'Love Vibes', 140, 'Almond milk, protein (vanilla), strawberries, banana & peanut butter', true, 1, 6, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000007', 'Mayan Vibes', 120, 'Almond milk, banana, strawberries, cocoa, dates, agave honey, cocoa nibs & coconut flakes', true, 2, 6, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000027', 'c1000000-0000-0000-0000-000000000007', 'Matcha Vibes', 120, 'Almond milk, matcha, mango, banana, spinach & agave honey', true, 3, 6, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000028', 'c1000000-0000-0000-0000-000000000007', 'Berry Vibes', 140, 'Almond milk, berries, orange, protein (vanilla) & agave honey', true, 4, 6, 'c0000000-0000-0000-0000-000000000003');

-- Coffee Shop (335ml)
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000029', 'c1000000-0000-0000-0000-000000000008', 'Americano / Iced Americano', 60, NULL, true, 1, 3, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000008', 'Cappuccino', 60, NULL, true, 2, 4, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000031', 'c1000000-0000-0000-0000-000000000008', 'Latte / Iced Latte', 70, NULL, true, 3, 4, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000032', 'c1000000-0000-0000-0000-000000000008', 'Golden Milk', 100, 'Turmeric latte', true, 4, 4, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000033', 'c1000000-0000-0000-0000-000000000008', 'Chai Latte', 80, NULL, true, 5, 4, 'c0000000-0000-0000-0000-000000000003');

-- Beverages
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('c2000000-0000-0000-0000-000000000034', 'c1000000-0000-0000-0000-000000000009', 'Soft Drinks', 40, NULL, true, 1, 1, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000035', 'c1000000-0000-0000-0000-000000000009', 'Mineral Water', 40, NULL, true, 2, 1, 'c0000000-0000-0000-0000-000000000003'),
  ('c2000000-0000-0000-0000-000000000036', 'c1000000-0000-0000-0000-000000000009', 'Natural Water', 40, NULL, true, 3, 1, 'c0000000-0000-0000-0000-000000000003');

-- ============================================
-- 4. INSERT GREEN VIBES TABLES
-- ============================================

INSERT INTO cafe_tables (id, number, qr_code, section, status, restaurant_id) VALUES
  ('c3000000-0000-0000-0000-000000000001', '1', 'GV-01', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000002', '2', 'GV-02', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000003', '3', 'GV-03', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000004', '4', 'GV-04', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000005', '5', 'GV-05', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000006', '6', 'GV-06', 'Patio', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000007', '7', 'GV-07', 'Patio', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000008', '8', 'GV-08', 'Patio', 'available', 'c0000000-0000-0000-0000-000000000003');

-- ============================================
-- 5. INSERT GREEN VIBES SELLERS
-- ============================================

INSERT INTO cafe_sellers (id, name, pin_hash, is_active, restaurant_id) VALUES
  ('c4000000-0000-0000-0000-000000000001', 'Admin', '1234', true, 'c0000000-0000-0000-0000-000000000003'),
  ('c4000000-0000-0000-0000-000000000002', 'Server 1', '1111', true, 'c0000000-0000-0000-0000-000000000003'),
  ('c4000000-0000-0000-0000-000000000003', 'Server 2', '2222', true, 'c0000000-0000-0000-0000-000000000003');

-- ============================================
-- 6. INSERT GREEN VIBES VENUE SETTINGS
-- ============================================

INSERT INTO cafe_venue_settings (id, client_can_order, client_can_pay, require_prepay, default_tip_options, restaurant_id)
VALUES (
  'c5000000-0000-0000-0000-000000000001',
  true,
  true,
  false,
  '[10, 15, 20]',
  'c0000000-0000-0000-0000-000000000003'
);
