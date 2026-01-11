// Restaurant Registry - Multi-restaurant demo support
export * from './types'
export { lunaConfig, LUNA_USES_DATABASE } from './luna'
export { burroConfig } from './burro'

import { RestaurantConfig } from './types'
import { lunaConfig } from './luna'
import { burroConfig } from './burro'

// All available restaurants
export const restaurants: RestaurantConfig[] = [
  lunaConfig,
  burroConfig,
]

// Restaurant lookup by slug
export const restaurantsBySlug: Record<string, RestaurantConfig> = {
  luna: lunaConfig,
  burro: burroConfig,
}

// Get restaurant by slug
export function getRestaurant(slug: string): RestaurantConfig | undefined {
  return restaurantsBySlug[slug.toLowerCase()]
}

// Check if restaurant uses database (vs in-memory demo data)
export function usesDatabase(slug: string): boolean {
  return slug.toLowerCase() === 'luna'
}

// Get all restaurant slugs
export function getRestaurantSlugs(): string[] {
  return Object.keys(restaurantsBySlug)
}

// Default restaurant
export const DEFAULT_RESTAURANT = 'luna'
