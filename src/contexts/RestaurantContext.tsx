'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { RestaurantConfig, RestaurantCategory, RestaurantTable, RestaurantSeller } from '@/config/restaurants/types'
import { getRestaurant, usesDatabase, DEFAULT_RESTAURANT } from '@/config/restaurants'

interface RestaurantContextValue {
  restaurant: RestaurantConfig
  slug: string
  usesDatabase: boolean

  // Formatting helpers
  formatPrice: (price: number) => string

  // Data getters (for demo mode)
  getCategories: () => RestaurantCategory[]
  getTables: () => RestaurantTable[]
  getSellers: () => RestaurantSeller[]
  getTableByQR: (qrCode: string) => RestaurantTable | undefined
  getSellerByPin: (pin: string) => RestaurantSeller | undefined

  // URL helpers
  getBasePath: () => string
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null)

interface RestaurantProviderProps {
  children: ReactNode
  restaurantSlug: string
}

export function RestaurantProvider({ children, restaurantSlug }: RestaurantProviderProps) {
  const restaurant = getRestaurant(restaurantSlug) || getRestaurant(DEFAULT_RESTAURANT)!
  const isDatabase = usesDatabase(restaurantSlug)

  const value = useMemo<RestaurantContextValue>(() => ({
    restaurant,
    slug: restaurant.slug,
    usesDatabase: isDatabase,

    formatPrice: (price: number) => {
      return new Intl.NumberFormat(restaurant.locale, {
        style: 'currency',
        currency: restaurant.currency,
        minimumFractionDigits: restaurant.currency === 'MXN' ? 0 : 2,
        maximumFractionDigits: restaurant.currency === 'MXN' ? 0 : 2,
      }).format(price)
    },

    getCategories: () => restaurant.categories,
    getTables: () => restaurant.tables,
    getSellers: () => restaurant.sellers,

    getTableByQR: (qrCode: string) => {
      return restaurant.tables.find(t => t.qr_code === qrCode)
    },

    getSellerByPin: (pin: string) => {
      return restaurant.sellers.find(s => s.pin === pin)
    },

    getBasePath: () => `/${restaurant.slug}`,
  }), [restaurant, isDatabase])

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider')
  }
  return context
}

// Optional hook that returns null instead of throwing
export function useRestaurantOptional() {
  return useContext(RestaurantContext)
}
