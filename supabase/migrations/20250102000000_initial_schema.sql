-- GolfTab Initial Schema Migration
-- Created: 2025-01-02
-- Description: Complete database schema for GolfTab POS system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: sellers
-- Description: Staff members who can create groups and sell products
-- ============================================================================
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active sellers lookup
CREATE INDEX idx_sellers_is_active ON sellers(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLE: groups
-- Description: Golf groups created by sellers or admins
-- ============================================================================
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES sellers(id) ON DELETE SET NULL
);

-- Indexes for groups
CREATE UNIQUE INDEX idx_groups_client_code ON groups(client_code);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_created_at ON groups(created_at DESC);
CREATE INDEX idx_groups_created_by ON groups(created_by);

-- Function to generate unique 6-digit client code
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 6-digit code (100000 to 999999)
        new_code := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM groups WHERE client_code = new_code) INTO code_exists;

        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate client_code if not provided
CREATE OR REPLACE FUNCTION set_client_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_code IS NULL OR NEW.client_code = '' THEN
        NEW.client_code := generate_client_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_client_code
    BEFORE INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION set_client_code();

-- ============================================================================
-- TABLE: categories
-- Description: Product categories for menu organization
-- ============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for visible categories ordered by sort_order
CREATE INDEX idx_categories_visible_sort ON categories(sort_order) WHERE is_visible = true;

-- ============================================================================
-- TABLE: products
-- Description: Products available for purchase
-- ============================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_category_sort ON products(category_id, sort_order);

-- ============================================================================
-- TABLE: tabs
-- Description: Customer tabs within groups
-- ============================================================================
CREATE TABLE tabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tabs
CREATE INDEX idx_tabs_group_id ON tabs(group_id);
CREATE INDEX idx_tabs_status ON tabs(status);
CREATE INDEX idx_tabs_group_status ON tabs(group_id, status);

-- ============================================================================
-- TABLE: tab_items
-- Description: Individual items on a tab
-- ============================================================================
CREATE TABLE tab_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tab_id UUID NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tab_items
CREATE INDEX idx_tab_items_tab_id ON tab_items(tab_id);
CREATE INDEX idx_tab_items_product_id ON tab_items(product_id);
CREATE INDEX idx_tab_items_seller_id ON tab_items(seller_id);
CREATE INDEX idx_tab_items_created_at ON tab_items(created_at DESC);

-- ============================================================================
-- TRIGGER: Update tab total when items are added/updated/deleted
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tab_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total for the affected tab
    UPDATE tabs
    SET total = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM tab_items
        WHERE tab_id = COALESCE(NEW.tab_id, OLD.tab_id)
    )
    WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tab_total_insert
    AFTER INSERT ON tab_items
    FOR EACH ROW
    EXECUTE FUNCTION update_tab_total();

CREATE TRIGGER trigger_update_tab_total_update
    AFTER UPDATE ON tab_items
    FOR EACH ROW
    EXECUTE FUNCTION update_tab_total();

CREATE TRIGGER trigger_update_tab_total_delete
    AFTER DELETE ON tab_items
    FOR EACH ROW
    EXECUTE FUNCTION update_tab_total();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: sellers
-- ============================================================================

-- Sellers can read all active sellers
CREATE POLICY "Sellers can read active sellers"
    ON sellers FOR SELECT
    USING (is_active = true);

-- Admins can do everything with sellers
CREATE POLICY "Admins can manage sellers"
    ON sellers FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- RLS POLICIES: groups
-- ============================================================================

-- Sellers can read all groups
CREATE POLICY "Sellers can read groups"
    ON groups FOR SELECT
    USING (true);

-- Sellers can create groups
CREATE POLICY "Sellers can create groups"
    ON groups FOR INSERT
    WITH CHECK (true);

-- Sellers can update groups they created
CREATE POLICY "Sellers can update their groups"
    ON groups FOR UPDATE
    USING (created_by = auth.uid()::uuid OR auth.jwt() ->> 'role' = 'admin');

-- Admins can do everything with groups
CREATE POLICY "Admins can manage groups"
    ON groups FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- RLS POLICIES: categories
-- ============================================================================

-- Sellers can read visible categories
CREATE POLICY "Sellers can read visible categories"
    ON categories FOR SELECT
    USING (is_visible = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- RLS POLICIES: products
-- ============================================================================

-- Sellers can read active products
CREATE POLICY "Sellers can read active products"
    ON products FOR SELECT
    USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- RLS POLICIES: tabs
-- ============================================================================

-- Sellers can read all tabs
CREATE POLICY "Sellers can read tabs"
    ON tabs FOR SELECT
    USING (true);

-- Sellers can create tabs
CREATE POLICY "Sellers can create tabs"
    ON tabs FOR INSERT
    WITH CHECK (true);

-- Sellers can update tabs
CREATE POLICY "Sellers can update tabs"
    ON tabs FOR UPDATE
    USING (true);

-- Admins can manage tabs
CREATE POLICY "Admins can manage tabs"
    ON tabs FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- RLS POLICIES: tab_items
-- ============================================================================

-- Sellers can read all tab items
CREATE POLICY "Sellers can read tab_items"
    ON tab_items FOR SELECT
    USING (true);

-- Sellers can create tab items
CREATE POLICY "Sellers can create tab_items"
    ON tab_items FOR INSERT
    WITH CHECK (true);

-- Sellers can update tab items they created
CREATE POLICY "Sellers can update their tab_items"
    ON tab_items FOR UPDATE
    USING (seller_id = auth.uid()::uuid OR auth.jwt() ->> 'role' = 'admin');

-- Sellers can delete tab items they created
CREATE POLICY "Sellers can delete their tab_items"
    ON tab_items FOR DELETE
    USING (seller_id = auth.uid()::uuid OR auth.jwt() ->> 'role' = 'admin');

-- Admins can manage tab items
CREATE POLICY "Admins can manage tab_items"
    ON tab_items FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- SEED DATA: categories
-- ============================================================================
INSERT INTO categories (name, sort_order, is_visible) VALUES
    ('Drinks', 1, true),
    ('Food', 2, true),
    ('Other', 3, true);

-- ============================================================================
-- SEED DATA: sample products
-- ============================================================================

-- Get category IDs for seed data
DO $$
DECLARE
    drinks_id UUID;
    food_id UUID;
    other_id UUID;
BEGIN
    SELECT id INTO drinks_id FROM categories WHERE name = 'Drinks';
    SELECT id INTO food_id FROM categories WHERE name = 'Food';
    SELECT id INTO other_id FROM categories WHERE name = 'Other';

    -- Drinks
    INSERT INTO products (category_id, name, price, sort_order, is_active) VALUES
        (drinks_id, 'Water', 1.50, 1, true),
        (drinks_id, 'Soda', 2.50, 2, true),
        (drinks_id, 'Beer', 5.00, 3, true),
        (drinks_id, 'Wine', 8.00, 4, true),
        (drinks_id, 'Cocktail', 10.00, 5, true),
        (drinks_id, 'Coffee', 3.00, 6, true),
        (drinks_id, 'Energy Drink', 4.00, 7, true);

    -- Food
    INSERT INTO products (category_id, name, price, sort_order, is_active) VALUES
        (food_id, 'Hot Dog', 4.50, 1, true),
        (food_id, 'Hamburger', 8.00, 2, true),
        (food_id, 'Cheeseburger', 9.00, 3, true),
        (food_id, 'Sandwich', 7.00, 4, true),
        (food_id, 'Chips', 2.00, 5, true),
        (food_id, 'Candy Bar', 2.50, 6, true),
        (food_id, 'Ice Cream', 4.00, 7, true),
        (food_id, 'Pretzel', 3.50, 8, true);

    -- Other
    INSERT INTO products (category_id, name, price, sort_order, is_active) VALUES
        (other_id, 'Golf Balls (3-pack)', 12.00, 1, true),
        (other_id, 'Golf Tees (pack)', 5.00, 2, true),
        (other_id, 'Ball Marker', 3.00, 3, true),
        (other_id, 'Divot Tool', 8.00, 4, true),
        (other_id, 'Golf Glove', 15.00, 5, true);
END $$;

-- ============================================================================
-- VIEWS: Useful queries for the application
-- ============================================================================

-- View for group summary with tab counts and totals
CREATE OR REPLACE VIEW group_summary AS
SELECT
    g.id,
    g.name,
    g.client_code,
    g.status,
    g.created_at,
    g.created_by,
    s.name AS created_by_name,
    COUNT(DISTINCT t.id) AS tab_count,
    COUNT(DISTINCT CASE WHEN t.status = 'open' THEN t.id END) AS open_tab_count,
    COALESCE(SUM(t.total), 0) AS total_amount,
    COALESCE(SUM(CASE WHEN t.status = 'open' THEN t.total ELSE 0 END), 0) AS open_total
FROM groups g
LEFT JOIN sellers s ON g.created_by = s.id
LEFT JOIN tabs t ON g.id = t.group_id
GROUP BY g.id, g.name, g.client_code, g.status, g.created_at, g.created_by, s.name;

-- View for tab details with item counts
CREATE OR REPLACE VIEW tab_details AS
SELECT
    t.id,
    t.group_id,
    t.status,
    t.total,
    t.paid_at,
    t.created_at,
    g.name AS group_name,
    g.client_code,
    COUNT(ti.id) AS item_count,
    SUM(ti.quantity) AS total_items
FROM tabs t
JOIN groups g ON t.group_id = g.id
LEFT JOIN tab_items ti ON t.id = ti.tab_id
GROUP BY t.id, t.group_id, t.status, t.total, t.paid_at, t.created_at, g.name, g.client_code;

-- View for seller sales summary
CREATE OR REPLACE VIEW seller_sales_summary AS
SELECT
    s.id,
    s.name,
    COUNT(DISTINCT ti.id) AS items_sold,
    SUM(ti.quantity) AS total_quantity_sold,
    SUM(ti.quantity * ti.unit_price) AS total_sales,
    COUNT(DISTINCT t.group_id) AS groups_served,
    MIN(ti.created_at) AS first_sale,
    MAX(ti.created_at) AS last_sale
FROM sellers s
LEFT JOIN tab_items ti ON s.id = ti.seller_id
LEFT JOIN tabs t ON ti.tab_id = t.id
GROUP BY s.id, s.name;

-- View for product sales summary
CREATE OR REPLACE VIEW product_sales_summary AS
SELECT
    p.id,
    p.name,
    c.name AS category_name,
    p.price AS current_price,
    COUNT(ti.id) AS times_sold,
    SUM(ti.quantity) AS total_quantity_sold,
    SUM(ti.quantity * ti.unit_price) AS total_revenue,
    AVG(ti.unit_price) AS average_selling_price,
    MAX(ti.created_at) AS last_sold
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN tab_items ti ON p.id = ti.product_id
GROUP BY p.id, p.name, c.name, p.price;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE sellers IS 'Staff members who can create groups and sell products';
COMMENT ON TABLE groups IS 'Golf groups created by sellers or admins with unique client codes';
COMMENT ON TABLE categories IS 'Product categories for organizing the menu';
COMMENT ON TABLE products IS 'Products available for purchase';
COMMENT ON TABLE tabs IS 'Customer tabs within groups for tracking purchases';
COMMENT ON TABLE tab_items IS 'Individual line items on customer tabs';

COMMENT ON COLUMN groups.client_code IS 'Unique 6-digit code for group identification';
COMMENT ON COLUMN sellers.pin_hash IS 'Hashed PIN for seller authentication';
COMMENT ON COLUMN tabs.total IS 'Auto-calculated total from tab_items';
COMMENT ON COLUMN tab_items.unit_price IS 'Price at time of sale (captured from product)';
