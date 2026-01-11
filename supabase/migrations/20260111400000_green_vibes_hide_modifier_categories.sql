-- Green Vibes Menu Fix: Hide categories that are modifiers, not menu items
-- These items (Salad Bases, Proteins, Premium Vegetables, Garnish) should only appear
-- as options when customizing a salad, not as standalone menu items.

-- Hide the modifier-based categories from the menu
UPDATE cafe_categories
SET is_visible = false
WHERE restaurant_id = 'c0000000-0000-0000-0000-000000000003'
AND name IN ('Salad Bases', 'Proteins', 'Premium Vegetables', 'Garnish');
