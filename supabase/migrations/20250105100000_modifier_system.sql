-- CafeTab Modifier System
-- Adds support for product modifiers (choices, add-ons)

-- ============================================
-- CAFE_MODIFIER_GROUPS TABLE
-- Groups of modifiers (e.g., "Noodle Type", "Extra Proteins")
-- ============================================
CREATE TABLE cafe_modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                          -- Display name
  type TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multi')),
  is_required BOOLEAN NOT NULL DEFAULT false,  -- Must select at least one?
  min_select INTEGER NOT NULL DEFAULT 0,       -- Minimum selections (0 = optional)
  max_select INTEGER,                          -- Maximum selections (NULL = unlimited)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_modifier_groups_order ON cafe_modifier_groups(sort_order);

-- ============================================
-- CAFE_MODIFIERS TABLE
-- Individual modifier options within a group
-- ============================================
CREATE TABLE cafe_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES cafe_modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,  -- +$0, +$60, etc.
  is_default BOOLEAN NOT NULL DEFAULT false,          -- Pre-selected option
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_modifiers_group ON cafe_modifiers(group_id, is_active, sort_order) WHERE is_active = true;

-- ============================================
-- CAFE_PRODUCT_MODIFIER_GROUPS TABLE
-- Junction table linking products to modifier groups
-- ============================================
CREATE TABLE cafe_product_modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES cafe_products(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES cafe_modifier_groups(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, modifier_group_id)
);

CREATE INDEX idx_cafe_product_modifier_groups_product ON cafe_product_modifier_groups(product_id, sort_order);

-- ============================================
-- CAFE_ORDER_ITEM_MODIFIERS TABLE
-- Selected modifiers for each order item
-- ============================================
CREATE TABLE cafe_order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES cafe_order_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES cafe_modifiers(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Snapshot of price at order time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_order_item_modifiers_item ON cafe_order_item_modifiers(order_item_id);

-- ============================================
-- CAFE_TAB_ITEM_MODIFIERS TABLE
-- Selected modifiers for tab items (mirrors order items)
-- ============================================
CREATE TABLE cafe_tab_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_item_id UUID NOT NULL REFERENCES cafe_tab_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES cafe_modifiers(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_tab_item_modifiers_item ON cafe_tab_item_modifiers(tab_item_id);

-- ============================================
-- ADD NOTES FIELD TO PRODUCTS
-- For display-only text (e.g., "All desserts made in house")
-- ============================================
ALTER TABLE cafe_products
  ADD COLUMN notes TEXT,
  ADD COLUMN price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'ask_server', 'market'));

-- ============================================
-- UPDATE TAB TOTAL FUNCTION
-- Now includes modifier prices
-- ============================================
CREATE OR REPLACE FUNCTION cafe_update_tab_total()
RETURNS TRIGGER AS $$
DECLARE
  v_tab_id UUID;
  v_new_total DECIMAL(10,2);
  v_tab_type TEXT;
  v_prepaid_amount DECIMAL(10,2);
BEGIN
  v_tab_id := COALESCE(NEW.tab_id, OLD.tab_id);

  -- Calculate new total including modifiers
  SELECT COALESCE(SUM(
    ti.quantity * ti.unit_price +
    COALESCE((
      SELECT SUM(tim.quantity * tim.price_adjustment)
      FROM cafe_tab_item_modifiers tim
      WHERE tim.tab_item_id = ti.id
    ), 0)
  ), 0) INTO v_new_total
  FROM cafe_tab_items ti
  WHERE ti.tab_id = v_tab_id;

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

-- Also trigger on modifier changes
CREATE OR REPLACE FUNCTION cafe_update_tab_total_from_modifier()
RETURNS TRIGGER AS $$
DECLARE
  v_tab_item_id UUID;
  v_tab_id UUID;
BEGIN
  v_tab_item_id := COALESCE(NEW.tab_item_id, OLD.tab_item_id);

  SELECT tab_id INTO v_tab_id
  FROM cafe_tab_items
  WHERE id = v_tab_item_id;

  -- Trigger the main update function by doing a dummy update
  UPDATE cafe_tab_items
  SET quantity = quantity
  WHERE id = v_tab_item_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cafe_update_tab_total_modifier
AFTER INSERT OR UPDATE OR DELETE ON cafe_tab_item_modifiers
FOR EACH ROW
EXECUTE FUNCTION cafe_update_tab_total_from_modifier();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE cafe_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_tab_item_modifiers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Cafe modifier groups viewable by all" ON cafe_modifier_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe modifiers viewable by all" ON cafe_modifiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe product modifier groups viewable by all" ON cafe_product_modifier_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe order item modifiers viewable by all" ON cafe_order_item_modifiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cafe tab item modifiers viewable by all" ON cafe_tab_item_modifiers FOR SELECT TO anon, authenticated USING (true);

-- Full access (development - lock down later)
CREATE POLICY "Allow all on cafe_modifier_groups" ON cafe_modifier_groups FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_modifiers" ON cafe_modifiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_product_modifier_groups" ON cafe_product_modifier_groups FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_order_item_modifiers" ON cafe_order_item_modifiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cafe_tab_item_modifiers" ON cafe_tab_item_modifiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
