-- CafeTab Seed Data
-- Full menu with modifiers

-- ============================================
-- VENUE SETTINGS
-- ============================================
INSERT INTO cafe_venue_settings (client_can_order, client_can_pay, require_prepay, notify_on_every_order)
VALUES (true, true, false, true);

-- ============================================
-- SELLERS (Staff)
-- ============================================
INSERT INTO cafe_sellers (id, name, pin_hash, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', '1234', true),
  ('00000000-0000-0000-0000-000000000002', 'Server 1', '1111', true),
  ('00000000-0000-0000-0000-000000000003', 'Server 2', '2222', true);

-- ============================================
-- TABLES
-- ============================================
INSERT INTO cafe_tables (number, section) VALUES
  ('1', 'Inside'),
  ('2', 'Inside'),
  ('3', 'Inside'),
  ('4', 'Inside'),
  ('5', 'Inside'),
  ('Bar 1', 'Bar'),
  ('Bar 2', 'Bar'),
  ('Bar 3', 'Bar'),
  ('Patio 1', 'Patio'),
  ('Patio 2', 'Patio'),
  ('Patio 3', 'Patio'),
  ('Patio 4', 'Patio');

-- ============================================
-- CATEGORIES (in display order)
-- ============================================
INSERT INTO cafe_categories (id, name, sort_order, is_visible) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Appetizers', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'Bao Buns', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Specials', 3, true),
  ('10000000-0000-0000-0000-000000000004', 'Ramen', 4, true),
  ('10000000-0000-0000-0000-000000000005', 'Extra Proteins', 5, true),
  ('10000000-0000-0000-0000-000000000006', 'Woks', 6, true),
  ('10000000-0000-0000-0000-000000000007', 'Desserts', 7, true),
  ('10000000-0000-0000-0000-000000000008', 'Sake', 8, true),
  ('10000000-0000-0000-0000-000000000009', 'Classics', 9, true),
  ('10000000-0000-0000-0000-000000000010', 'Signature Cocktails', 10, true),
  ('10000000-0000-0000-0000-000000000011', 'Vermut', 11, true),
  ('10000000-0000-0000-0000-000000000012', 'Lemonades', 12, true),
  ('10000000-0000-0000-0000-000000000013', 'Soft', 13, true),
  ('10000000-0000-0000-0000-000000000014', 'Beer', 14, true),
  ('10000000-0000-0000-0000-000000000015', 'Wine', 15, true),
  ('10000000-0000-0000-0000-000000000016', '0% Alcohol Cocktails', 16, true),
  ('10000000-0000-0000-0000-000000000017', 'Margaritas & Mezcalitas', 17, true);

-- ============================================
-- MODIFIER GROUPS
-- ============================================

-- Edamame Style (required, single choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Style', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Classic', 0, true, 1),
  ('20000000-0000-0000-0000-000000000001', 'Spicy', 0, false, 2);

-- Noodle Type (required, single choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000002', 'Noodle Type', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000002', 'Egg Noodles', 0, true, 1),
  ('20000000-0000-0000-0000-000000000002', 'Udon', 0, false, 2),
  ('20000000-0000-0000-0000-000000000002', 'Soy Bean', 0, false, 3);

-- Extra Proteins (optional, multi choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000003', 'Extra Proteins', 'multi', false, 0, NULL, 2);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000003', 'Egg', 30, false, 1),
  ('20000000-0000-0000-0000-000000000003', 'Tofu', 50, false, 2),
  ('20000000-0000-0000-0000-000000000003', 'Chicken', 60, false, 3),
  ('20000000-0000-0000-0000-000000000003', 'Beef', 80, false, 4),
  ('20000000-0000-0000-0000-000000000003', 'Pork', 80, false, 5),
  ('20000000-0000-0000-0000-000000000003', 'Prawns', 90, false, 6),
  ('20000000-0000-0000-0000-000000000003', 'Salmon', 110, false, 7);

-- Coca Cola Type (required, single choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000004', 'Type', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000004', 'Regular', 0, true, 1),
  ('20000000-0000-0000-0000-000000000004', 'Diet', 0, false, 2),
  ('20000000-0000-0000-0000-000000000004', 'Zero', 0, false, 3);

-- Water Type (required, single choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000005', 'Type', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000005', 'Still', 0, true, 1),
  ('20000000-0000-0000-0000-000000000005', 'Sparkling', 0, false, 2);

-- Margarita Base (required, single choice - Tequila or Mezcal)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000006', 'Base Spirit', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000006', 'Tequila (Margarita)', 0, true, 1),
  ('20000000-0000-0000-0000-000000000006', 'Mezcal (Mezcalita)', 0, false, 2);

-- Piccolo Ramen Choice (required, single choice)
INSERT INTO cafe_modifier_groups (id, name, type, is_required, min_select, max_select, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000007', 'Ramen Base', 'single', true, 1, 1, 1);

INSERT INTO cafe_modifiers (group_id, name, price_adjustment, is_default, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000007', 'Shoyu Pork Belly', 0, true, 1),
  ('20000000-0000-0000-0000-000000000007', 'Thai Green Curry', 0, false, 2),
  ('20000000-0000-0000-0000-000000000007', 'Dashi Chicken', 0, false, 3),
  ('20000000-0000-0000-0000-000000000007', 'Sriracha Beef', 0, false, 4);

-- ============================================
-- PRODUCTS
-- ============================================

-- APPETIZERS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Edamames', 110, 'Steamed soybeans in the pod. Your choice of classic, or SPICY', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Gyoza', 140, 'Four sauted pork filled dumplings DRESSED with eel sauce and neri goma', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Spring Rolls', 110, 'Portion of five perfectly crunchy spring rolls filled with vegetables served with Sweet chill sauce on the side', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Piccolo Ramen', 180, 'Enjoy a small version of your favorite choice of ramen', NULL, 'fixed', 4),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Wakame Salad', 130, 'Mix of seasoned seaweeds, subtly sweet, but distinctive in flavor and texture. bamboo, cucumber', 'Recommended to order with salmon', 'fixed', 5);

-- BAO BUNS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Tempura Prawn', 170, 'Crispy tempura prawns, seasoned seaweed, alfalfa sprouts and chipotle mayo, dusted with togarashi powder, sesame seeds and spring onion', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Sriracha Beef', 160, 'Marinated beef, alfalfa sprouts, seasoned with sriracha sauce and topped with sesame seeds', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'Pork Belly', 160, 'Marinated pork belly, alfalfa sprouts, seaweed, seasoned with neri goma. eel sauce', NULL, 'fixed', 3);

-- SPECIALS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Salmon Tiradito', 230, 'Delicately sliced raw salmon, marinated in our signature passionfruit sesame sauce, edamame, togarashi, rice paper cracker.', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'Weekly Special', 0, 'Ask your server for this week''s special creation', 'ASK FOR WEEKLY SPECIAL', 'ask_server', 2);

-- RAMEN
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'Shoyu Pork Belly', 210, 'CLASSIC dashi broth, slice of golden pork belly, egg noodles, rich tare sauce. Served with shiitake mushrooms, bamboo, soft boiled egg, seaweed.', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'Thai Green Curry', 260, '[Our secret curry version] curry broth, your choice of protein, egg noodles. Served with shiitake mushrooms, bamboo, soft boiled egg, seaweed.', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 'Dashi Chicken', 210, 'Dashi broth, fried chicken in hoisin and tare sauce, egg noodles. Served with shiitake mushrooms, bamboo, soft boiled egg, seaweed.', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', 'Sriracha Beef', 220, 'Dash of dashi broth, marinated Sriracha beef egg noodles. Served with shiitake mushrooms, bamboo, soft boiled egg, seaweed.', NULL, 'fixed', 4);

-- EXTRA PROTEINS (standalone category for direct ordering)
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', 'Extra Egg', 30, '', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', 'Extra Tofu', 50, '', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', 'Extra Chicken', 60, '', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', 'Extra Beef', 80, '', NULL, 'fixed', 4),
  ('30000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', 'Extra Pork', 80, '', NULL, 'fixed', 5),
  ('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005', 'Extra Prawns', 90, '', NULL, 'fixed', 6),
  ('30000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000005', 'Extra Salmon', 110, '', NULL, 'fixed', 7);

-- WOKS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000006', 'Yaki Soba', 160, 'Stir-fried egg noodles, carrot, broccoli, red pepper, spring onion, dressed with eel sauce, topped with basil leaves.', 'ADD YOUR FAV PROTEIN', 'fixed', 1),
  ('30000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000006', 'Yaki Udon', 160, 'Stir-fried udon noodles, carrot, onion, zucchini, egg, topped with spring onion.', 'ADD YOUR FAV PROTEIN', 'fixed', 2),
  ('30000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000006', 'Stir Fried Rice', 160, '¡A CLASSIC! Carrot, zucchini, onion, broccoli, egg.', 'ADD YOUR FAV PROTEIN', 'fixed', 3),
  ('30000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000006', 'Spicy Wok Chicken Peanut', 230, 'Chicken garlic with roasted peanut eel sauce and sriracha sauce.', NULL, 'fixed', 4);

-- DESSERTS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000007', 'Tiramisu', 140, '', 'All our desserts are made in house', 'fixed', 1),
  ('30000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000007', 'Chocolate Mousse', 130, '', 'All our desserts are made in house', 'fixed', 2);

-- SAKE
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000008', 'Ozeki Super Dry (cup)', 180, 'Extra dry, smooth, light-bodied, great with fried chicken or seafood. Origin: California, USA Category: Junmai', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000008', 'Nami (cup)', 150, 'Subtly sweet and fresh, full body, prolonged taste. Origin: Sinaloa, Mex Category: Junmai', NULL, 'fixed', 2);

-- CLASSICS (Cocktails)
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000009', 'Negroni', 220, '', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000009', 'Mezcal Negroni', 220, '', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000009', 'Aperol Spritz', 220, '', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000009', 'Manhattan', 220, '', NULL, 'fixed', 4),
  ('30000000-0000-0000-0000-000000000034', '10000000-0000-0000-0000-000000000009', 'Americano', 220, '', NULL, 'fixed', 5),
  ('30000000-0000-0000-0000-000000000035', '10000000-0000-0000-0000-000000000009', 'Old Fashioned', 220, '', NULL, 'fixed', 6);

-- SIGNATURE COCKTAILS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000036', '10000000-0000-0000-0000-000000000010', 'Japanese Mule', 220, 'Sake, vodka, fresh lime, ginger, mint leaves', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000037', '10000000-0000-0000-0000-000000000010', 'Sake Sprits', 220, 'St. Germain, sake, fresh lime, prosecco, mint', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000038', '10000000-0000-0000-0000-000000000010', 'Mezcalpico', 220, 'Our signature house cocktail with mezcal, passionfruit and japanese calpis', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000039', '10000000-0000-0000-0000-000000000010', 'Paloma Roja', 220, 'Tequila, fresh lime, infused hibiscus, beer', NULL, 'fixed', 4);

-- VERMUT
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000011', 'Home Made Vermut', 280, 'Aromatized fortified wine. Flavored with various herbs, seeds, citrics and spices, artisanally crafted', NULL, 'fixed', 1);

-- LEMONADES
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000012', 'Classic Lemonade', 50, '', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000012', 'Hibiscus Lemonade', 50, '', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000012', 'Passionfruit Lemonade', 50, '', NULL, 'fixed', 3);

-- SOFT DRINKS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000013', 'Coca Cola', 50, '', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000013', 'Water', 80, '', NULL, 'fixed', 2);

-- BEER
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000014', 'Modelo', 90, 'México', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000014', 'Asahi', 140, 'Japan', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000014', 'Sapporo Premium', 170, 'Japan', NULL, 'fixed', 3);

-- WINE
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000015', 'Red Wine (Glass)', 130, '', 'Bottle price by request', 'fixed', 1),
  ('30000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000015', 'White Wine (Glass)', 130, '', 'Bottle price by request', 'fixed', 2);

-- 0% ALCOHOL COCKTAILS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000016', 'Calpicool', 140, 'Passion fruit based, japanese calpis, fresh apple juice and lime.', NULL, 'fixed', 1);

-- MARGARITAS & MEZCALITAS
INSERT INTO cafe_products (id, category_id, name, price, description, notes, price_type, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000017', 'Classic', 190, '', NULL, 'fixed', 1),
  ('30000000-0000-0000-0000-000000000053', '10000000-0000-0000-0000-000000000017', 'Spicy', 190, '', NULL, 'fixed', 2),
  ('30000000-0000-0000-0000-000000000054', '10000000-0000-0000-0000-000000000017', 'Hibiscus', 190, '', NULL, 'fixed', 3),
  ('30000000-0000-0000-0000-000000000055', '10000000-0000-0000-0000-000000000017', 'Passionfruit', 210, '', NULL, 'fixed', 4);

-- ============================================
-- PRODUCT -> MODIFIER GROUP LINKS
-- ============================================

-- Edamames -> Style (Classic/Spicy)
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1);

-- Piccolo Ramen -> Ramen Base choice + Noodle Type + Extra Proteins
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 1),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 2),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 3);

-- All Ramen -> Noodle Type + Extra Proteins
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 1),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000003', 2),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', 1),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', 2),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000002', 1),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 2),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000002', 1),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000003', 2);

-- Woks (Yaki Soba, Yaki Udon, Stir Fried Rice) -> Extra Proteins
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000003', 1),
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000003', 1),
  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000003', 1);

-- Coca Cola -> Type (Regular/Diet/Zero)
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000044', '20000000-0000-0000-0000-000000000004', 1);

-- Water -> Type (Still/Sparkling)
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000045', '20000000-0000-0000-0000-000000000005', 1);

-- All Margaritas -> Base Spirit (Tequila/Mezcal)
INSERT INTO cafe_product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000052', '20000000-0000-0000-0000-000000000006', 1),
  ('30000000-0000-0000-0000-000000000053', '20000000-0000-0000-0000-000000000006', 1),
  ('30000000-0000-0000-0000-000000000054', '20000000-0000-0000-0000-000000000006', 1),
  ('30000000-0000-0000-0000-000000000055', '20000000-0000-0000-0000-000000000006', 1);
