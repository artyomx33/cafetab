-- CafeTab Initial Schema
-- Universal tab management for cafes, restaurants, and hospitality
-- All tables prefixed with cafe_ to coexist with golf_ tables in same database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CAFE_SELLERS TABLE
-- Staff who manage tables and tabs
-- ============================================
CREATE TABLE cafe_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_sellers_active ON cafe_sellers(is_active) WHERE is_active = true;

-- ============================================
-- CAFE_CATEGORIES TABLE
-- Product categories (Coffee, Drinks, Food, Snacks, etc.)
-- ============================================
CREATE TABLE cafe_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_categories_visible ON cafe_categories(is_visible, sort_order) WHERE is_visible = true;

-- ============================================
-- CAFE_PRODUCTS TABLE
-- Items available for sale
-- ============================================
CREATE TABLE cafe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES cafe_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_products_category ON cafe_products(category_id, is_active, sort_order) WHERE is_active = true;

-- ============================================
-- CAFE_TABLES TABLE (NEW - replaces groups)
-- Physical tables in the venue
-- ============================================
CREATE TABLE cafe_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL,                    -- Display number (e.g., "7", "A3", "Patio-2")
  qr_code TEXT NOT NULL UNIQUE,            -- Unique QR identifier for client scanning
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  section TEXT,                            -- Optional grouping (Bar, Patio, Inside)
  current_tab_id UUID,                     -- Active tab (set after tab creation)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_cafe_tables_qr ON cafe_tables(qr_code);
CREATE INDEX idx_cafe_tables_status ON cafe_tables(status);

-- ============================================
-- CAFE_TABS TABLE (Enhanced)
-- Tabs with prepaid support
-- ============================================
CREATE TABLE cafe_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES cafe_tables(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'prepaid')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'refund_pending')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  prepaid_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (prepaid_amount >= 0),
  balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  tip DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tip >= 0),
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES cafe_sellers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_tabs_table ON cafe_tabs(table_id);
CREATE INDEX idx_cafe_tabs_status ON cafe_tabs(status) WHERE status = 'open';

-- Add foreign key from tables to tabs (circular reference)
ALTER TABLE cafe_tables
  ADD CONSTRAINT fk_cafe_tables_current_tab
  FOREIGN KEY (current_tab_id) REFERENCES cafe_tabs(id) ON DELETE SET NULL;

-- ============================================
-- CAFE_ORDERS TABLE (NEW)
-- Orders sent to kitchen/bar
-- ============================================
CREATE TABLE cafe_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES cafe_tabs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prepared_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ
);

CREATE INDEX idx_cafe_orders_tab ON cafe_orders(tab_id);
CREATE INDEX idx_cafe_orders_status ON cafe_orders(status) WHERE status IN ('pending', 'preparing', 'ready');

-- ============================================
-- CAFE_ORDER_ITEMS TABLE (NEW)
-- Individual items in an order
-- ============================================
CREATE TABLE cafe_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES cafe_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cafe_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_order_items_order ON cafe_order_items(order_id);

-- ============================================
-- CAFE_TAB_ITEMS TABLE
-- Individual items added to a tab (linked to orders)
-- ============================================
CREATE TABLE cafe_tab_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES cafe_tabs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cafe_products(id) ON DELETE RESTRICT,
  seller_id UUID REFERENCES cafe_sellers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES cafe_orders(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_tab_items_tab ON cafe_tab_items(tab_id);
CREATE INDEX idx_cafe_tab_items_order ON cafe_tab_items(order_id);

-- ============================================
-- CAFE_NOTIFICATIONS TABLE (NEW)
-- Real-time notifications for staff
-- ============================================
CREATE TABLE cafe_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('order', 'bill_request', 'server_call', 'payment', 'refund_request', 'low_balance')),
  table_id UUID NOT NULL REFERENCES cafe_tables(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES cafe_sellers(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_notifications_unread ON cafe_notifications(seller_id, read, created_at) WHERE read = false;
CREATE INDEX idx_cafe_notifications_table ON cafe_notifications(table_id);

-- ============================================
-- CAFE_TRANSACTIONS TABLE (NEW)
-- Financial transaction ledger
-- ============================================
CREATE TABLE cafe_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES cafe_tabs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('load', 'spend', 'refund', 'tip', 'payment')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,  -- 'card', 'cash', 'apple_pay', 'google_pay'
  processed_by UUID REFERENCES cafe_sellers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_transactions_tab ON cafe_transactions(tab_id);
CREATE INDEX idx_cafe_transactions_type ON cafe_transactions(type, created_at);

-- ============================================
-- CAFE_VENUE_SETTINGS TABLE (NEW)
-- Per-venue configuration
-- ============================================
CREATE TABLE cafe_venue_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_can_order BOOLEAN NOT NULL DEFAULT true,
  client_can_pay BOOLEAN NOT NULL DEFAULT true,
  require_prepay BOOLEAN NOT NULL DEFAULT false,
  notify_on_every_order BOOLEAN NOT NULL DEFAULT true,
  default_tip_options JSONB NOT NULL DEFAULT '[10, 15, 20]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update tab total when items change
CREATE OR REPLACE FUNCTION cafe_update_tab_total()
RETURNS TRIGGER AS $$
DECLARE
  v_tab_id UUID;
  v_new_total DECIMAL(10,2);
  v_tab_type TEXT;
  v_prepaid_amount DECIMAL(10,2);
BEGIN
  v_tab_id := COALESCE(NEW.tab_id, OLD.tab_id);

  -- Calculate new total
  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_new_total
  FROM cafe_tab_items
  WHERE tab_id = v_tab_id;

  -- Get tab type and prepaid amount
  SELECT type, prepaid_amount INTO v_tab_type, v_prepaid_amount
  FROM cafe_tabs
  WHERE id = v_tab_id;

  -- Update tab
  IF v_tab_type = 'prepaid' THEN
    UPDATE cafe_tabs
    SET total = v_new_total,
        balance = GREATEST(v_prepaid_amount - v_new_total, 0)
    WHERE id = v_tab_id;
  ELSE
    UPDATE cafe_tabs
    SET total = v_new_total
    WHERE id = v_tab_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cafe_update_tab_total
AFTER INSERT OR UPDATE OR DELETE ON cafe_tab_items
FOR EACH ROW
EXECUTE FUNCTION cafe_update_tab_total();

-- Update table status when tab opens/closes
CREATE OR REPLACE FUNCTION cafe_update_table_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New tab opened - mark table as occupied
    UPDATE cafe_tables
    SET status = 'occupied',
        current_tab_id = NEW.id
    WHERE id = NEW.table_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('paid', 'refund_pending') AND OLD.status = 'open' THEN
    -- Tab closed - mark table as available
    UPDATE cafe_tables
    SET status = 'available',
        current_tab_id = NULL
    WHERE id = NEW.table_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cafe_update_table_status
AFTER INSERT OR UPDATE ON cafe_tabs
FOR EACH ROW
EXECUTE FUNCTION cafe_update_table_status();

-- Generate unique QR code for tables
CREATE OR REPLACE FUNCTION cafe_generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL OR NEW.qr_code = '' THEN
    NEW.qr_code := 'CT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cafe_generate_qr
BEFORE INSERT ON cafe_tables
FOR EACH ROW
EXECUTE FUNCTION cafe_generate_qr_code();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE cafe_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_tab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_venue_settings ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Cafe sellers viewable by all" ON cafe_sellers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe categories viewable by all" ON cafe_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe products viewable by all" ON cafe_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe tables viewable by all" ON cafe_tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe tabs viewable by all" ON cafe_tabs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe tab items viewable by all" ON cafe_tab_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe orders viewable by all" ON cafe_orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe order items viewable by all" ON cafe_order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe notifications viewable by all" ON cafe_notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe transactions viewable by all" ON cafe_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe venue settings viewable by all" ON cafe_venue_settings FOR SELECT TO anon, authenticated USING (true);

-- Full access policies (for development - lock down later)
CREATE POLICY "Allow all on cafe_sellers" ON cafe_sellers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_categories" ON cafe_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_products" ON cafe_products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_tables" ON cafe_tables FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_tabs" ON cafe_tabs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_tab_items" ON cafe_tab_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_orders" ON cafe_orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_order_items" ON cafe_order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_notifications" ON cafe_notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_transactions" ON cafe_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_venue_settings" ON cafe_venue_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
