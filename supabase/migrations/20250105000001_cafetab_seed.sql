-- CafeTab Seed Data
-- Sample data for development and testing

-- ============================================
-- VENUE SETTINGS (Single row for now)
-- ============================================
INSERT INTO cafe_venue_settings (client_can_order, client_can_pay, require_prepay, notify_on_every_order, default_tip_options)
VALUES (true, true, false, true, '[10, 15, 20]'::jsonb);

-- ============================================
-- SELLERS (Staff)
-- ============================================
-- PIN: 1234 (hashed: simple hash for demo - replace with bcrypt in prod)
INSERT INTO cafe_sellers (name, pin_hash, is_active) VALUES
  ('Maria', '1234', true),
  ('Carlos', '2345', true),
  ('Sofia', '3456', true),
  ('Lucas', '4567', true);

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO cafe_categories (name, sort_order, is_visible) VALUES
  ('Hot Drinks', 1, true),
  ('Cold Drinks', 2, true),
  ('Breakfast', 3, true),
  ('Lunch', 4, true),
  ('Snacks', 5, true),
  ('Desserts', 6, true),
  ('Alcohol', 7, true);

-- ============================================
-- PRODUCTS
-- ============================================

-- Hot Drinks
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Espresso', 2.50, 'Single shot espresso', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Double Espresso', 3.50, 'Double shot espresso', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Americano', 3.00, 'Espresso with hot water', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Cappuccino', 4.00, 'Espresso with steamed milk foam', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Latte', 4.50, 'Espresso with steamed milk', 5),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Flat White', 4.50, 'Double espresso with microfoam', 6),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Mocha', 5.00, 'Espresso with chocolate and milk', 7),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Hot Chocolate', 4.00, 'Rich Belgian chocolate', 8),
  ((SELECT id FROM cafe_categories WHERE name = 'Hot Drinks'), 'Tea', 3.00, 'Selection of teas', 9);

-- Cold Drinks
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Iced Latte', 5.00, 'Espresso over ice with cold milk', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Iced Americano', 4.00, 'Espresso over ice with cold water', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Cold Brew', 5.00, '12-hour slow-steeped coffee', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Fresh Orange Juice', 5.50, 'Freshly squeezed', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Smoothie', 6.50, 'Ask for today''s flavors', 5),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Sparkling Water', 3.00, '500ml', 6),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Still Water', 2.50, '500ml', 7),
  ((SELECT id FROM cafe_categories WHERE name = 'Cold Drinks'), 'Soft Drinks', 3.50, 'Coca-Cola, Fanta, Sprite', 8);

-- Breakfast
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Avocado Toast', 9.50, 'Sourdough, smashed avo, poached eggs', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Eggs Benedict', 11.00, 'Poached eggs, hollandaise, ham', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Acai Bowl', 10.00, 'Acai, granola, fresh fruits', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Croissant', 3.50, 'Fresh baked butter croissant', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Pain au Chocolat', 4.00, 'Chocolate-filled pastry', 5),
  ((SELECT id FROM cafe_categories WHERE name = 'Breakfast'), 'Granola Bowl', 8.00, 'Greek yogurt, honey, granola', 6);

-- Lunch
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Caesar Salad', 12.00, 'Romaine, parmesan, croutons', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Club Sandwich', 13.50, 'Triple-decker with fries', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Buddha Bowl', 14.00, 'Quinoa, roasted veg, tahini', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Grilled Chicken Wrap', 11.00, 'Chicken, avocado, tomato', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Soup of the Day', 7.00, 'Ask your server', 5),
  ((SELECT id FROM cafe_categories WHERE name = 'Lunch'), 'Tuna Salad', 13.00, 'Fresh tuna, mixed greens', 6);

-- Snacks
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Snacks'), 'Nachos', 9.00, 'Cheese, jalapeños, guac, salsa', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Snacks'), 'Hummus Plate', 8.00, 'Hummus, pita, veggies', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Snacks'), 'Cheese Board', 15.00, 'Selection of cheeses, crackers', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Snacks'), 'French Fries', 5.00, 'Crispy with aioli', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Snacks'), 'Sweet Potato Fries', 6.00, 'With chipotle mayo', 5);

-- Desserts
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Desserts'), 'Cheesecake', 7.00, 'New York style', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Desserts'), 'Chocolate Brownie', 6.00, 'Warm with vanilla ice cream', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Desserts'), 'Tiramisu', 7.50, 'Classic Italian', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Desserts'), 'Fruit Tart', 6.50, 'Fresh seasonal fruits', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Desserts'), 'Ice Cream', 5.00, '2 scoops, choice of flavors', 5);

-- Alcohol
INSERT INTO cafe_products (category_id, name, price, description, sort_order) VALUES
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'House Wine (Glass)', 7.00, 'Red or White', 1),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'House Wine (Bottle)', 28.00, 'Red or White', 2),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Prosecco (Glass)', 8.00, 'Italian sparkling', 3),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Local Beer', 5.00, 'Draft 330ml', 4),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Imported Beer', 6.00, 'Selection available', 5),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Aperol Spritz', 10.00, 'Classic Italian aperitivo', 6),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Margarita', 11.00, 'Tequila, lime, triple sec', 7),
  ((SELECT id FROM cafe_categories WHERE name = 'Alcohol'), 'Mojito', 10.00, 'Rum, mint, lime, soda', 8);

-- ============================================
-- TABLES
-- ============================================

-- Inside Tables (1-10)
INSERT INTO cafe_tables (number, section, status) VALUES
  ('1', 'Inside', 'available'),
  ('2', 'Inside', 'available'),
  ('3', 'Inside', 'available'),
  ('4', 'Inside', 'available'),
  ('5', 'Inside', 'available'),
  ('6', 'Inside', 'available'),
  ('7', 'Inside', 'available'),
  ('8', 'Inside', 'available'),
  ('9', 'Inside', 'available'),
  ('10', 'Inside', 'available');

-- Bar Seats (B1-B6)
INSERT INTO cafe_tables (number, section, status) VALUES
  ('B1', 'Bar', 'available'),
  ('B2', 'Bar', 'available'),
  ('B3', 'Bar', 'available'),
  ('B4', 'Bar', 'available'),
  ('B5', 'Bar', 'available'),
  ('B6', 'Bar', 'available');

-- Patio Tables (P1-P8)
INSERT INTO cafe_tables (number, section, status) VALUES
  ('P1', 'Patio', 'available'),
  ('P2', 'Patio', 'available'),
  ('P3', 'Patio', 'available'),
  ('P4', 'Patio', 'available'),
  ('P5', 'Patio', 'available'),
  ('P6', 'Patio', 'available'),
  ('P7', 'Patio', 'available'),
  ('P8', 'Patio', 'available');
