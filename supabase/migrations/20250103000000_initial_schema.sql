-- GolfTab Initial Schema
-- This migration creates all tables for the golf course tab management system
-- All tables prefixed with golf_ to coexist with other apps in same database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GOLF_SELLERS TABLE
-- Staff who operate the carts and manage tabs
-- ============================================
CREATE TABLE golf_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for PIN lookup (used during login)
CREATE INDEX idx_golf_sellers_active ON golf_sellers(is_active) WHERE is_active = true;

-- ============================================
-- GOLF_CATEGORIES TABLE
-- Product categories (Drinks, Food, Snacks, etc.)
-- ============================================
CREATE TABLE golf_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for visible categories sorted by order
CREATE INDEX idx_golf_categories_visible ON golf_categories(is_visible, sort_order) WHERE is_visible = true;

-- ============================================
-- GOLF_PRODUCTS TABLE
-- Items available for sale (beers, hot dogs, etc.)
-- ============================================
CREATE TABLE golf_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES golf_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active products by category
CREATE INDEX idx_golf_products_category ON golf_products(category_id, is_active, sort_order) WHERE is_active = true;

-- ============================================
-- GOLF_GROUPS TABLE
-- Golf groups/parties that open tabs
-- ============================================
CREATE TABLE golf_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_by UUID REFERENCES golf_sellers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up groups by client code
CREATE UNIQUE INDEX idx_golf_groups_client_code ON golf_groups(client_code);
CREATE INDEX idx_golf_groups_status ON golf_groups(status) WHERE status = 'active';

-- ============================================
-- GOLF_TABS TABLE
-- The running tab for each group
-- ============================================
CREATE TABLE golf_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES golf_groups(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each group has exactly one tab
CREATE UNIQUE INDEX idx_golf_tabs_group ON golf_tabs(group_id);
CREATE INDEX idx_golf_tabs_status ON golf_tabs(status) WHERE status = 'open';

-- ============================================
-- GOLF_TAB_ITEMS TABLE
-- Individual items added to a tab
-- ============================================
CREATE TABLE golf_tab_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES golf_tabs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES golf_products(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES golf_sellers(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching items by tab
CREATE INDEX idx_golf_tab_items_tab ON golf_tab_items(tab_id);
-- Index for seller analytics
CREATE INDEX idx_golf_tab_items_seller ON golf_tab_items(seller_id, created_at);

-- ============================================
-- FUNCTION: Update tab total on item changes
-- ============================================
CREATE OR REPLACE FUNCTION golf_update_tab_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE golf_tabs
  SET total = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM golf_tab_items
    WHERE tab_id = COALESCE(NEW.tab_id, OLD.tab_id)
  )
  WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tab total
CREATE TRIGGER trigger_golf_update_tab_total
AFTER INSERT OR UPDATE OR DELETE ON golf_tab_items
FOR EACH ROW
EXECUTE FUNCTION golf_update_tab_total();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE golf_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_tab_items ENABLE ROW LEVEL SECURITY;

-- Public read access to categories and products (for the menu)
CREATE POLICY "Golf categories are viewable by everyone"
  ON golf_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Golf products are viewable by everyone"
  ON golf_products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access to groups and tabs (for customers viewing their tab)
CREATE POLICY "Golf groups are viewable by everyone"
  ON golf_groups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Golf tabs are viewable by everyone"
  ON golf_tabs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Golf tab items are viewable by everyone"
  ON golf_tab_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sellers can read other sellers (for admin list)
CREATE POLICY "Golf sellers are viewable by everyone"
  ON golf_sellers FOR SELECT
  TO anon, authenticated
  USING (true);

-- For now, allow anon to insert/update (we'll lock this down later with proper auth)
CREATE POLICY "Allow all operations on golf_groups"
  ON golf_groups FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on golf_tabs"
  ON golf_tabs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on golf_tab_items"
  ON golf_tab_items FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on golf_sellers"
  ON golf_sellers FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on golf_categories"
  ON golf_categories FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on golf_products"
  ON golf_products FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
