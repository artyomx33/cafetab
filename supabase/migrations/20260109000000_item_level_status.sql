-- Kitchen Display v2: Item-Level Status Management
-- Enables per-item status tracking for quick items vs slow items

-- ============================================
-- ADD prep_time TO PRODUCTS
-- ============================================
ALTER TABLE cafe_products
ADD COLUMN prep_time INTEGER NOT NULL DEFAULT 10;

COMMENT ON COLUMN cafe_products.prep_time IS 'Expected preparation time in minutes. Quick items (<= 3) appear in Quick column.';

-- ============================================
-- ADD ITEM-LEVEL STATUS TO ORDER_ITEMS
-- ============================================
ALTER TABLE cafe_order_items
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'ready', 'delivered'));

ALTER TABLE cafe_order_items
ADD COLUMN ready_at TIMESTAMPTZ;

ALTER TABLE cafe_order_items
ADD COLUMN delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN cafe_order_items.status IS 'Item status: pending (cooking), ready (for pickup), delivered (to customer)';
COMMENT ON COLUMN cafe_order_items.ready_at IS 'When kitchen marked item as ready';
COMMENT ON COLUMN cafe_order_items.delivered_at IS 'When waiter delivered to customer';

-- Index for quick items query (ready items with low prep time)
CREATE INDEX idx_cafe_order_items_quick ON cafe_order_items(status)
WHERE status = 'ready';

-- ============================================
-- UPDATE EXISTING PRODUCTS WITH PREP TIMES
-- ============================================

-- Quick items (prep_time <= 3)
UPDATE cafe_products SET prep_time = 1 WHERE LOWER(name) LIKE '%water%';
UPDATE cafe_products SET prep_time = 1 WHERE LOWER(name) LIKE '%beer%';
UPDATE cafe_products SET prep_time = 1 WHERE LOWER(name) LIKE '%soda%';
UPDATE cafe_products SET prep_time = 1 WHERE LOWER(name) LIKE '%juice%';
UPDATE cafe_products SET prep_time = 2 WHERE LOWER(name) LIKE '%wine%';
UPDATE cafe_products SET prep_time = 3 WHERE LOWER(name) LIKE '%coffee%';
UPDATE cafe_products SET prep_time = 3 WHERE LOWER(name) LIKE '%tea%';
UPDATE cafe_products SET prep_time = 3 WHERE LOWER(name) LIKE '%espresso%';

-- Medium items (prep_time 5-10)
UPDATE cafe_products SET prep_time = 5 WHERE LOWER(name) LIKE '%salad%';
UPDATE cafe_products SET prep_time = 6 WHERE LOWER(name) LIKE '%edamame%';
UPDATE cafe_products SET prep_time = 8 WHERE LOWER(name) LIKE '%spring roll%';
UPDATE cafe_products SET prep_time = 8 WHERE LOWER(name) LIKE '%gyoza%';

-- Slow items (prep_time > 10)
UPDATE cafe_products SET prep_time = 12 WHERE LOWER(name) LIKE '%ramen%';
UPDATE cafe_products SET prep_time = 12 WHERE LOWER(name) LIKE '%pork%';
UPDATE cafe_products SET prep_time = 10 WHERE LOWER(name) LIKE '%salmon%';
UPDATE cafe_products SET prep_time = 10 WHERE LOWER(name) LIKE '%prawn%';
UPDATE cafe_products SET prep_time = 10 WHERE LOWER(name) LIKE '%tempura%';
UPDATE cafe_products SET prep_time = 15 WHERE LOWER(name) LIKE '%steak%';
UPDATE cafe_products SET prep_time = 15 WHERE LOWER(name) LIKE '%burger%';
