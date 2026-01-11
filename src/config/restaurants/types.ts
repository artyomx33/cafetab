// Restaurant configuration types for multi-restaurant demo mode

export interface RestaurantProduct {
  id: string
  name: string
  price: number
  description?: string
  notes?: string
}

export interface RestaurantCategory {
  id: string
  name: string
  products: RestaurantProduct[]
}

export interface RestaurantTable {
  id: string
  number: string
  qr_code: string
  section?: string
}

export interface RestaurantSeller {
  id: string
  name: string
  pin: string
  avatar_url?: string
}

export interface RestaurantTheme {
  primary: string // Main accent color
  primaryForeground: string
  gradient?: string // Optional gradient class
}

export interface RestaurantConfig {
  id: string
  slug: string // URL slug (e.g., 'burro', 'luna')
  name: string
  tagline?: string
  currency: string
  currencySymbol: string
  locale: string
  theme: RestaurantTheme
  categories: RestaurantCategory[]
  tables: RestaurantTable[]
  sellers: RestaurantSeller[]
  settings: {
    clientCanOrder: boolean
    clientCanPay: boolean
    requirePrepay: boolean
    defaultTipOptions: number[]
  }
}

// Helper to generate UUIDs for demo data
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper to generate QR codes
export function generateQRCode(restaurantSlug: string, tableNum: string): string {
  return `${restaurantSlug.toUpperCase()}-${tableNum.padStart(2, '0')}`
}
