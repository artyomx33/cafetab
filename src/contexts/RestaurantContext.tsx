'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useRestaurantBySlug, Restaurant } from '@/lib/supabase/hooks'

interface RestaurantContextValue {
  restaurant: Restaurant | null
  restaurantId: string | null
  slug: string
  loading: boolean
  error: string | null

  // Formatting helpers
  formatPrice: (price: number) => string

  // URL helpers
  getBasePath: () => string
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null)

interface RestaurantProviderProps {
  children: ReactNode
  restaurantSlug: string
}

export function RestaurantProvider({ children, restaurantSlug }: RestaurantProviderProps) {
  const { restaurant, loading, error } = useRestaurantBySlug(restaurantSlug)

  const value = useMemo<RestaurantContextValue>(() => ({
    restaurant,
    restaurantId: restaurant?.id || null,
    slug: restaurantSlug,
    loading,
    error,

    formatPrice: (price: number) => {
      const locale = restaurant?.locale || 'en-US'
      const currency = restaurant?.currency || 'USD'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'MXN' ? 0 : 2,
        maximumFractionDigits: currency === 'MXN' ? 0 : 2,
      }).format(price)
    },

    getBasePath: () => `/${restaurantSlug}`,
  }), [restaurant, restaurantSlug, loading, error])

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
