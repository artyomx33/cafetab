'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyPin } from '@/lib/auth/pin'
import type { Seller } from '@/types'

type VerifySellerPinResult =
  | { ok: true; seller: Seller }
  | { ok: false; message: string }

/**
 * Verify a seller's PIN
 * @param pin - The PIN to verify
 * @returns Seller data if valid, error message if invalid
 */
export async function verifySellerPin(pin: string): Promise<VerifySellerPinResult> {
  try {
    if (!pin || pin.trim().length === 0) {
      return { ok: false, message: 'PIN is required' }
    }

    const supabase = await createClient()

    // Fetch all active sellers
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching sellers:', error)
      return { ok: false, message: 'Failed to verify PIN' }
    }

    if (!sellers || sellers.length === 0) {
      return { ok: false, message: 'Invalid PIN' }
    }

    // Find seller with matching PIN
    const seller = sellers.find((s) => verifyPin(pin, s.pin_hash))

    if (!seller) {
      return { ok: false, message: 'Invalid PIN' }
    }

    return { ok: true, seller }
  } catch (error) {
    console.error('Error verifying seller PIN:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}

/**
 * Get a seller by ID
 * @param id - The seller ID
 * @returns Seller data or null if not found
 */
export async function getSellerById(id: string): Promise<Seller | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching seller:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting seller by ID:', error)
    return null
  }
}
