// Restaurant Registry - Multi-restaurant demo support
export * from './types'
export { lunaConfig, LUNA_USES_DATABASE } from './luna'
export { burroConfig } from './burro'
export { greenVibesConfig } from './green-vibes'

import { RestaurantConfig } from './types'
import { lunaConfig } from './luna'
import { burroConfig } from './burro'
import { greenVibesConfig } from './green-vibes'

// All available restaurants (hardcoded demos)
export const restaurants: RestaurantConfig[] = [
  lunaConfig,
  burroConfig,
  greenVibesConfig,
]

// Restaurant lookup by slug (hardcoded only)
export const restaurantsBySlug: Record<string, RestaurantConfig> = {
  luna: lunaConfig,
  burro: burroConfig,
  'green-vibes': greenVibesConfig,
}

// Get restaurant by slug (hardcoded only - use getRestaurantFromDb for dynamic)
export function getRestaurant(slug: string): RestaurantConfig | undefined {
  return restaurantsBySlug[slug.toLowerCase()]
}

// Check if restaurant uses database (vs in-memory demo data)
// Dynamic restaurants always use database
export function usesDatabase(slug: string): boolean {
  const hardcoded = restaurantsBySlug[slug.toLowerCase()]
  // If not in hardcoded list, it's a dynamic restaurant that uses database
  if (!hardcoded) return true
  // Luna uses database, others are demo
  return slug.toLowerCase() === 'luna'
}

// Get all restaurant slugs (hardcoded only)
export function getRestaurantSlugs(): string[] {
  return Object.keys(restaurantsBySlug)
}

// Default restaurant
export const DEFAULT_RESTAURANT = 'luna'

// Database restaurant type (matches restaurants table)
export interface DbRestaurant {
  id: string
  slug: string
  name: string
  tagline: string | null
  currency: string
  currency_symbol: string
  locale: string
  theme_primary: string | null
  theme_gradient: string | null
  logo_url: string | null
  created_at: string
}

// Convert database restaurant to config format
export function dbToConfig(db: DbRestaurant): RestaurantConfig {
  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    tagline: db.tagline || undefined,
    currency: db.currency,
    currencySymbol: db.currency_symbol,
    locale: db.locale,
    theme: {
      primary: db.theme_primary || '#C9A962',
      primaryForeground: '#0D0D0F',
      gradient: db.theme_gradient || undefined,
    },
    // Dynamic restaurants load from database
    categories: [],
    tables: [],
    sellers: [],
    settings: {
      clientCanOrder: true,
      clientCanPay: true,
      requirePrepay: false,
      defaultTipOptions: [10, 15, 20],
    },
  }
}
