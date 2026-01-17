'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

interface CreateCafeInput {
  name: string
  tableCount: number
}

interface CreateCafeResult {
  success: boolean
  slug?: string
  error?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateQRCode(slug: string, tableNum: number): string {
  return `${slug.toUpperCase()}-${tableNum.toString().padStart(2, '0')}`
}

function hashPin(pin: string): string {
  // Simple hash for demo - in production, use proper bcrypt
  return Buffer.from(pin).toString('base64')
}

export async function createCafe(input: CreateCafeInput): Promise<CreateCafeResult> {
  const supabase = createAdminClient()

  // Generate slug from name
  let slug = slugify(input.name)

  // Ensure slug is unique
  const { data: existing } = await supabase
    .from('restaurants')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existing) {
    // Add random suffix if slug exists
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
  }

  const restaurantId = uuidv4()

  try {
    // 1. Create restaurant
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        id: restaurantId,
        slug,
        name: input.name,
        tagline: 'Welcome to our cafe',
        currency: 'USD',
        currency_symbol: '$',
        locale: 'en-US',
        theme_primary: '#C9A962', // Gold
        theme_gradient: 'bg-gradient-to-r from-[#C9A962] to-[#D4A82E]'
      })

    if (restaurantError) {
      console.error('Restaurant creation error:', restaurantError)
      return { success: false, error: `Failed to create restaurant: ${restaurantError.message}` }
    }

    // 2. Create tables
    const tables = Array.from({ length: input.tableCount }, (_, i) => ({
      id: uuidv4(),
      number: (i + 1).toString(),
      qr_code: generateQRCode(slug, i + 1),
      status: 'available' as const,
      restaurant_id: restaurantId
    }))

    const { error: tablesError } = await supabase
      .from('cafe_tables')
      .insert(tables)

    if (tablesError) {
      console.error('Tables creation error:', tablesError)
      return { success: false, error: `Failed to create tables: ${tablesError.message}` }
    }

    // 3. Create admin seller
    const { error: sellerError } = await supabase
      .from('cafe_sellers')
      .insert({
        id: uuidv4(),
        name: 'Admin',
        pin_hash: hashPin('1234'), // Default PIN: 1234
        is_active: true,
        restaurant_id: restaurantId
      })

    if (sellerError) {
      console.error('Seller creation error:', sellerError)
      return { success: false, error: `Failed to create admin: ${sellerError.message}` }
    }

    // 4. Create venue settings
    const { error: settingsError } = await supabase
      .from('cafe_venue_settings')
      .insert({
        id: uuidv4(),
        client_can_order: true,
        client_can_pay: true,
        require_prepay: false,
        notify_on_every_order: true,
        default_tip_options: [10, 15, 20],
        restaurant_id: restaurantId
      })

    if (settingsError) {
      console.error('Settings creation error:', settingsError)
      // Non-critical, continue
    }

    return { success: true, slug }

  } catch (error) {
    console.error('Create cafe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
