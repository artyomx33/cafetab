-- GolfTab Seed Data
-- Initial data to populate the system for demo purposes
-- All tables prefixed with golf_ to coexist with other apps

-- ============================================
-- GOLF_SELLERS (Cart Staff)
-- PIN is stored as simple hash for demo: hashed_<pin>
-- ============================================
INSERT INTO golf_sellers (name, pin_hash, is_active) VALUES
  ('Mike Johnson', 'hashed_1234', true),
  ('Sarah Williams', 'hashed_5678', true),
  ('Tom Garcia', 'hashed_0000', true);

-- ============================================
-- GOLF_CATEGORIES
-- ============================================
INSERT INTO golf_categories (name, sort_order, is_visible) VALUES
  ('Drinks', 1, true),
  ('Food', 2, true),
  ('Snacks', 3, true);

-- ============================================
-- GOLF_PRODUCTS
-- ============================================

-- Get category IDs (we use subqueries since UUIDs are generated)
-- Drinks
INSERT INTO golf_products (category_id, name, price, is_active, sort_order) VALUES
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Heineken', 5.00, true, 1),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Corona', 6.00, true, 2),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Craft IPA', 7.50, true, 3),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Water', 2.00, true, 4),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Gatorade', 3.50, true, 5),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Soda', 2.50, true, 6),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Iced Tea', 3.00, true, 7),
  ((SELECT id FROM golf_categories WHERE name = 'Drinks'), 'Red Bull', 4.50, true, 8);

-- Food
INSERT INTO golf_products (category_id, name, price, is_active, sort_order) VALUES
  ((SELECT id FROM golf_categories WHERE name = 'Food'), 'Hot Dog', 4.50, true, 1),
  ((SELECT id FROM golf_categories WHERE name = 'Food'), 'Burger', 8.00, true, 2),
  ((SELECT id FROM golf_categories WHERE name = 'Food'), 'Club Sandwich', 9.50, true, 3),
  ((SELECT id FROM golf_categories WHERE name = 'Food'), 'Chicken Wrap', 7.50, true, 4);

-- Snacks
INSERT INTO golf_products (category_id, name, price, is_active, sort_order) VALUES
  ((SELECT id FROM golf_categories WHERE name = 'Snacks'), 'Chips', 2.00, true, 1),
  ((SELECT id FROM golf_categories WHERE name = 'Snacks'), 'Peanuts', 3.00, true, 2),
  ((SELECT id FROM golf_categories WHERE name = 'Snacks'), 'Candy Bar', 2.50, true, 3),
  ((SELECT id FROM golf_categories WHERE name = 'Snacks'), 'Trail Mix', 4.00, true, 4);

-- ============================================
-- DEMO GOLF_GROUPS WITH TABS
-- ============================================

-- Create demo groups
INSERT INTO golf_groups (name, client_code, status, created_by)
SELECT
  'Morning Foursome',
  '847291',
  'active',
  (SELECT id FROM golf_sellers WHERE name = 'Mike Johnson');

INSERT INTO golf_groups (name, client_code, status, created_by)
SELECT
  'Smith Wedding Party',
  '123456',
  'active',
  (SELECT id FROM golf_sellers WHERE name = 'Sarah Williams');

INSERT INTO golf_groups (name, client_code, status, created_by)
SELECT
  'Corporate Outing',
  '555777',
  'active',
  (SELECT id FROM golf_sellers WHERE name = 'Mike Johnson');

-- Create tabs for each group
INSERT INTO golf_tabs (group_id, status, total)
SELECT id, 'open', 0 FROM golf_groups;

-- ============================================
-- DEMO GOLF_TAB_ITEMS
-- ============================================

-- Morning Foursome items (3 Heineken, 2 Water, 1 Hot Dog)
INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '847291'),
  (SELECT id FROM golf_products WHERE name = 'Heineken'),
  (SELECT id FROM golf_sellers WHERE name = 'Mike Johnson'),
  3,
  5.00;

INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '847291'),
  (SELECT id FROM golf_products WHERE name = 'Water'),
  (SELECT id FROM golf_sellers WHERE name = 'Mike Johnson'),
  2,
  2.00;

INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '847291'),
  (SELECT id FROM golf_products WHERE name = 'Hot Dog'),
  (SELECT id FROM golf_sellers WHERE name = 'Mike Johnson'),
  1,
  4.50;

-- Smith Wedding Party items (6 Corona, 4 Burger, 5 Chips)
INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '123456'),
  (SELECT id FROM golf_products WHERE name = 'Corona'),
  (SELECT id FROM golf_sellers WHERE name = 'Sarah Williams'),
  6,
  6.00;

INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '123456'),
  (SELECT id FROM golf_products WHERE name = 'Burger'),
  (SELECT id FROM golf_sellers WHERE name = 'Sarah Williams'),
  4,
  8.00;

INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '123456'),
  (SELECT id FROM golf_products WHERE name = 'Chips'),
  (SELECT id FROM golf_sellers WHERE name = 'Sarah Williams'),
  5,
  2.00;

-- Corporate Outing items (4 Craft IPA, 4 Gatorade)
INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '555777'),
  (SELECT id FROM golf_products WHERE name = 'Craft IPA'),
  (SELECT id FROM golf_sellers WHERE name = 'Tom Garcia'),
  4,
  7.50;

INSERT INTO golf_tab_items (tab_id, product_id, seller_id, quantity, unit_price)
SELECT
  (SELECT t.id FROM golf_tabs t JOIN golf_groups g ON t.group_id = g.id WHERE g.client_code = '555777'),
  (SELECT id FROM golf_products WHERE name = 'Gatorade'),
  (SELECT id FROM golf_sellers WHERE name = 'Tom Garcia'),
  4,
  3.50;
