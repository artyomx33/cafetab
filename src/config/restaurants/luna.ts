// Luna Cafe - Default restaurant (uses Supabase database)
import { RestaurantConfig, generateId, generateQRCode } from './types'

const LUNA_SLUG = 'luna'

// Luna Cafe uses Supabase database for menu/tables/sellers
// This config is mainly for branding and identifying database mode
export const lunaConfig: RestaurantConfig = {
  id: generateId(),
  slug: LUNA_SLUG,
  name: 'Luna Cafe',
  tagline: 'Modern Japanese Kitchen & Bar',
  currency: 'USD',
  currencySymbol: '$',
  locale: 'en-US',
  theme: {
    primary: 'var(--gold-500)', // Gold from existing theme
    primaryForeground: '#1A1A1D',
    gradient: 'text-gradient-gold',
  },
  // Luna uses Supabase database - these are empty as fallback only
  // The actual data comes from the database
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

// Flag to indicate this restaurant uses database
export const LUNA_USES_DATABASE = true
