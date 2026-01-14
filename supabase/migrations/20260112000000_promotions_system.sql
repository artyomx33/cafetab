-- Promotions System
-- Supports: % off, buy X get Y
-- Targets: category, specific items, entire order
-- Schedules: time windows, days of week, date ranges, always

-- Main promotions table
CREATE TABLE cafe_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percent_off', 'buy_x_get_y')),
  value NUMERIC NOT NULL, -- percentage (20 = 20%) or Y quantity for buy_x_get_y
  buy_quantity INTEGER, -- X in "buy X get Y" (null for percent_off)
  scope TEXT NOT NULL CHECK (scope IN ('category', 'items', 'order')),
  badge_text TEXT, -- e.g. "Happy Hour", "🔥 Special"
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promotion targets (what items/categories the promo applies to)
CREATE TABLE cafe_promotion_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES cafe_promotions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES cafe_categories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES cafe_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Must have either category_id or product_id (or neither for order scope)
  CONSTRAINT valid_target CHECK (
    (category_id IS NOT NULL AND product_id IS NULL) OR
    (category_id IS NULL AND product_id IS NOT NULL) OR
    (category_id IS NULL AND product_id IS NULL)
  )
);

-- Promotion schedules (when the promo is active)
CREATE TABLE cafe_promotion_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES cafe_promotions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('always', 'time_window', 'day_of_week', 'date_range')),
  days_of_week INTEGER[], -- 0=Sun, 1=Mon, ..., 6=Sat (for day_of_week and time_window)
  start_time TIME, -- for time_window
  end_time TIME, -- for time_window
  start_date DATE, -- for date_range
  end_date DATE, -- for date_range
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_promotions_restaurant ON cafe_promotions(restaurant_id);
CREATE INDEX idx_promotions_active ON cafe_promotions(restaurant_id, is_active);
CREATE INDEX idx_promotion_targets_promo ON cafe_promotion_targets(promotion_id);
CREATE INDEX idx_promotion_targets_category ON cafe_promotion_targets(category_id);
CREATE INDEX idx_promotion_targets_product ON cafe_promotion_targets(product_id);
CREATE INDEX idx_promotion_schedules_promo ON cafe_promotion_schedules(promotion_id);

-- RLS Policies
ALTER TABLE cafe_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_promotion_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_promotion_schedules ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (anon access for demo)
CREATE POLICY "Allow all for cafe_promotions" ON cafe_promotions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for cafe_promotion_targets" ON cafe_promotion_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for cafe_promotion_schedules" ON cafe_promotion_schedules FOR ALL USING (true) WITH CHECK (true);
