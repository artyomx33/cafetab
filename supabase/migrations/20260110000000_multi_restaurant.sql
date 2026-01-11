-- Multi-Restaurant Support Migration
-- Adds restaurant_id to all cafe tables for multi-tenant support

-- ============================================
-- 1. CREATE RESTAURANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  currency TEXT DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  locale TEXT DEFAULT 'en-US',
  theme_primary TEXT,
  theme_gradient TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ADD RESTAURANT_ID TO EXISTING TABLES
-- ============================================

-- Add restaurant_id to cafe_categories
ALTER TABLE cafe_categories
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Add restaurant_id to cafe_products
ALTER TABLE cafe_products
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Add restaurant_id to cafe_tables
ALTER TABLE cafe_tables
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Add restaurant_id to cafe_sellers
ALTER TABLE cafe_sellers
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Add restaurant_id to cafe_venue_settings
ALTER TABLE cafe_venue_settings
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- ============================================
-- 3. INSERT LUNA RESTAURANT & UPDATE EXISTING DATA
-- ============================================

-- Insert Luna restaurant
INSERT INTO restaurants (id, slug, name, tagline, currency, currency_symbol, locale, theme_primary, theme_gradient)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'luna',
  'Luna Cafe',
  'Cozy neighborhood cafe',
  'USD',
  '$',
  'en-US',
  '#14b8a6',
  'bg-gradient-to-r from-teal-500 to-cyan-500'
);

-- Update all existing data to belong to Luna
UPDATE cafe_categories SET restaurant_id = 'a0000000-0000-0000-0000-000000000001' WHERE restaurant_id IS NULL;
UPDATE cafe_products SET restaurant_id = 'a0000000-0000-0000-0000-000000000001' WHERE restaurant_id IS NULL;
UPDATE cafe_tables SET restaurant_id = 'a0000000-0000-0000-0000-000000000001' WHERE restaurant_id IS NULL;
UPDATE cafe_sellers SET restaurant_id = 'a0000000-0000-0000-0000-000000000001' WHERE restaurant_id IS NULL;
UPDATE cafe_venue_settings SET restaurant_id = 'a0000000-0000-0000-0000-000000000001' WHERE restaurant_id IS NULL;

-- ============================================
-- 4. INSERT BURRO RESTAURANT
-- ============================================

INSERT INTO restaurants (id, slug, name, tagline, currency, currency_symbol, locale, theme_primary, theme_gradient)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'burro',
  'Burro Tulum',
  'The Best Burrito in Town',
  'MXN',
  '$',
  'es-MX',
  '#C45C4A',
  'bg-gradient-to-r from-[#C45C4A] to-[#D4846C]'
);

-- ============================================
-- 5. INSERT BURRO CATEGORIES
-- ============================================

INSERT INTO cafe_categories (id, name, sort_order, is_visible, restaurant_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Starters', 1, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000002', 'Specials - Camote Relleno', 2, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'Tacos (3 pz.)', 3, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000004', 'Aguachile de Ribeye', 4, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000005', 'Patadas (2 pz.)', 5, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000006', 'The Best Burrito', 6, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000007', 'Chef''s Dessert', 7, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000008', 'Classic Cocktails', 8, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000009', 'Soft Drinks', 9, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000010', 'Beers', 10, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000011', 'Mezcal', 11, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000012', 'Tequila', 12, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000013', 'Ron', 13, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000014', 'Vodka', 14, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000015', 'Gin', 15, true, 'b0000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000016', 'Whisky', 16, true, 'b0000000-0000-0000-0000-000000000002');

-- ============================================
-- 6. INSERT BURRO PRODUCTS
-- ============================================

-- Starters
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Elote Tatemado', 70, 'Charred Mexican street corn', true, 1, 5, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Guacamole', 180, 'Fresh avocado dip with totopos', true, 2, 5, 'b0000000-0000-0000-0000-000000000002');

-- Specials - Camote Relleno
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Camote Relleno - Veggies', 150, 'Stuffed sweet potato with veggies', true, 1, 12, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Camote Relleno - Chicken', 180, 'Stuffed sweet potato with chicken', true, 2, 12, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Camote Relleno - Sirloin', 200, 'Stuffed sweet potato with sirloin', true, 3, 12, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Camote Relleno - Rib Eye', 220, 'Stuffed sweet potato with rib eye', true, 4, 15, 'b0000000-0000-0000-0000-000000000002');

-- Tacos
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'Tacos - Vegetarian', 130, '3 vegetarian tacos', true, 1, 8, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Tacos - Chicken', 150, '3 chicken tacos', true, 2, 8, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 'Tacos - Sirloin', 170, '3 sirloin tacos', true, 3, 10, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000003', 'Tacos - Rib Eye', 190, '3 rib eye tacos', true, 4, 10, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000003', 'Taco Extras', 40, 'Additional toppings', true, 5, 2, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000003', 'Avocado/Cheese', 40, 'Add avocado or cheese', true, 6, 2, 'b0000000-0000-0000-0000-000000000002');

-- Aguachile
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000004', 'Aguachile - For 2', 490, 'Ribeye aguachile for 2 people', true, 1, 15, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000004', 'Aguachile - For 4', 980, 'Ribeye aguachile for 4 people', true, 2, 20, 'b0000000-0000-0000-0000-000000000002');

-- Patadas
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000005', 'Patadas - Vegetarian', 130, '2 vegetarian patadas', true, 1, 8, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000005', 'Patadas - Chicken', 150, '2 chicken patadas', true, 2, 8, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000005', 'Patadas - Sirloin', 170, '2 sirloin patadas', true, 3, 10, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000005', 'Patadas - Rib Eye', 190, '2 rib eye patadas', true, 4, 10, 'b0000000-0000-0000-0000-000000000002');

-- Burritos
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000006', 'Burrito - Vegetarian', 180, 'The best vegetarian burrito', true, 1, 10, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000006', 'Burrito - Chicken', 190, 'The best chicken burrito', true, 2, 10, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000006', 'Burrito - Sirloin', 260, 'The best sirloin burrito', true, 3, 12, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000006', 'Burrito - Rib Eye', 290, 'The best rib eye burrito', true, 4, 12, 'b0000000-0000-0000-0000-000000000002');

-- Dessert
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000007', 'La Jacinta', 120, 'Chef''s special dessert', true, 1, 5, 'b0000000-0000-0000-0000-000000000002');

-- Classic Cocktails
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000008', 'Margarita', 150, true, 1, 3, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000025', 'b1000000-0000-0000-0000-000000000008', 'Mezcalita', 150, true, 2, 3, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000026', 'b1000000-0000-0000-0000-000000000008', 'Cuba', 160, true, 3, 3, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000027', 'b1000000-0000-0000-0000-000000000008', 'Gin Tonic', 160, true, 4, 3, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000028', 'b1000000-0000-0000-0000-000000000008', 'Paloma', 160, true, 5, 3, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000029', 'b1000000-0000-0000-0000-000000000008', 'Vodka Soda', 160, true, 6, 3, 'b0000000-0000-0000-0000-000000000002');

-- Soft Drinks
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000030', 'b1000000-0000-0000-0000-000000000009', 'Sodas', 50, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000031', 'b1000000-0000-0000-0000-000000000009', 'Lemonade', 50, true, 2, 2, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000032', 'b1000000-0000-0000-0000-000000000009', 'Natural Water', 50, true, 3, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000033', 'b1000000-0000-0000-0000-000000000009', 'Sparkling Water', 50, true, 4, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000034', 'b1000000-0000-0000-0000-000000000009', 'Felix', 60, true, 5, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000035', 'b1000000-0000-0000-0000-000000000009', 'Flavored Water', 50, true, 6, 1, 'b0000000-0000-0000-0000-000000000002');

-- Beers
INSERT INTO cafe_products (id, category_id, name, price, description, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000036', 'b1000000-0000-0000-0000-000000000010', 'Beer (Nacional)', 50, 'Domestic beer', true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000037', 'b1000000-0000-0000-0000-000000000010', 'Beer (Artesanal)', 130, 'Craft beer', true, 2, 1, 'b0000000-0000-0000-0000-000000000002');

-- Mezcal
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000038', 'b1000000-0000-0000-0000-000000000011', 'House Mezcal', 100, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000039', 'b1000000-0000-0000-0000-000000000011', 'Hilo Joven', 150, true, 2, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000040', 'b1000000-0000-0000-0000-000000000011', 'Pies Desc. Esp.', 140, true, 3, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000041', 'b1000000-0000-0000-0000-000000000011', 'Tobala', 160, true, 4, 1, 'b0000000-0000-0000-0000-000000000002');

-- Tequila
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000042', 'b1000000-0000-0000-0000-000000000012', 'House Tequila', 100, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000043', 'b1000000-0000-0000-0000-000000000012', '7 Leguas', 200, true, 2, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000044', 'b1000000-0000-0000-0000-000000000012', 'Don Julio Rep.', 200, true, 3, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000045', 'b1000000-0000-0000-0000-000000000012', 'Don Julio 70', 220, true, 4, 1, 'b0000000-0000-0000-0000-000000000002');

-- Ron
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000046', 'b1000000-0000-0000-0000-000000000013', 'Bacardi', 110, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000047', 'b1000000-0000-0000-0000-000000000013', 'Matusalem', 160, true, 2, 1, 'b0000000-0000-0000-0000-000000000002');

-- Vodka
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000048', 'b1000000-0000-0000-0000-000000000014', 'Stolichnaya', 150, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000049', 'b1000000-0000-0000-0000-000000000014', 'Tito''s', 190, true, 2, 1, 'b0000000-0000-0000-0000-000000000002');

-- Gin
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000050', 'b1000000-0000-0000-0000-000000000015', 'Diega', 190, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000051', 'b1000000-0000-0000-0000-000000000015', 'Tanqueray', 220, true, 2, 1, 'b0000000-0000-0000-0000-000000000002');

-- Whisky
INSERT INTO cafe_products (id, category_id, name, price, is_active, sort_order, prep_time, restaurant_id) VALUES
  ('b2000000-0000-0000-0000-000000000052', 'b1000000-0000-0000-0000-000000000016', 'Red Label', 190, true, 1, 1, 'b0000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000053', 'b1000000-0000-0000-0000-000000000016', 'Jack Daniels', 220, true, 2, 1, 'b0000000-0000-0000-0000-000000000002');

-- ============================================
-- 7. INSERT BURRO TABLES
-- ============================================

INSERT INTO cafe_tables (id, number, qr_code, section, status, restaurant_id) VALUES
  ('b3000000-0000-0000-0000-000000000001', '1', 'BURRO-01', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000002', '2', 'BURRO-02', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000003', '3', 'BURRO-03', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000004', '4', 'BURRO-04', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000005', '5', 'BURRO-05', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000006', '6', 'BURRO-06', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002'),
  ('b3000000-0000-0000-0000-000000000007', '7', 'BURRO-07', 'Main', 'available', 'b0000000-0000-0000-0000-000000000002');

-- ============================================
-- 8. INSERT BURRO SELLERS
-- ============================================

INSERT INTO cafe_sellers (id, name, pin_hash, is_active, restaurant_id) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'Admin', '1234', true, 'b0000000-0000-0000-0000-000000000002'),
  ('b4000000-0000-0000-0000-000000000002', 'Server 1', '1111', true, 'b0000000-0000-0000-0000-000000000002'),
  ('b4000000-0000-0000-0000-000000000003', 'Server 2', '2222', true, 'b0000000-0000-0000-0000-000000000002');

-- ============================================
-- 9. INSERT BURRO VENUE SETTINGS
-- ============================================

INSERT INTO cafe_venue_settings (id, client_can_order, client_can_pay, require_prepay, default_tip_options, restaurant_id)
VALUES (
  'b5000000-0000-0000-0000-000000000001',
  true,
  true,
  false,
  '[10, 15, 20]',
  'b0000000-0000-0000-0000-000000000002'
);

-- ============================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cafe_categories_restaurant ON cafe_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cafe_products_restaurant ON cafe_products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cafe_tables_restaurant ON cafe_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cafe_sellers_restaurant ON cafe_sellers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
