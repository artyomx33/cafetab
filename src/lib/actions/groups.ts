'use server'

import { createClient } from '@/lib/supabase/server'
import type { Table, Tab } from '@/types'

type CreateTabResult =
  | { ok: true; tab: Tab }
  | { ok: false; message: string }

type CloseTabResult =
  | { ok: true }
  | { ok: false; message: string }

/**
 * Get all tables with their current tab status
 * @returns Array of tables
 */
export async function getAllTables(): Promise<Table[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .order('number', { ascending: true })

    if (error) {
      console.error('Error fetching tables:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting tables:', error)
    return []
  }
}

/**
 * Get occupied tables
 * @returns Array of occupied tables
 */
export async function getOccupiedTables(): Promise<Table[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('status', 'occupied')
      .order('number', { ascending: true })

    if (error) {
      console.error('Error fetching occupied tables:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting occupied tables:', error)
    return []
  }
}

/**
 * Create a new tab for a table
 * @param tableId - The table ID
 * @param sellerId - The seller ID (optional)
 * @param type - Tab type (regular or prepaid)
 * @param prepaidAmount - Prepaid amount if prepaid type
 * @returns The created tab or error message
 */
export async function createTab(
  tableId: string,
  sellerId?: string,
  type: 'regular' | 'prepaid' = 'regular',
  prepaidAmount: number = 0
): Promise<CreateTabResult> {
  try {
    if (!tableId) {
      return { ok: false, message: 'Table ID is required' }
    }

    const supabase = await createClient()

    const insertData: {
      table_id: string
      type: 'regular' | 'prepaid'
      status: 'open'
      prepaid_amount: number
      balance: number
      created_by?: string
    } = {
      table_id: tableId,
      type,
      status: 'open',
      prepaid_amount: type === 'prepaid' ? prepaidAmount : 0,
      balance: type === 'prepaid' ? prepaidAmount : 0,
    }

    if (sellerId) {
      insertData.created_by = sellerId
    }

    const { data, error } = await supabase
      .from('cafe_tabs')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tab:', error)
      return { ok: false, message: 'Failed to create tab' }
    }

    return { ok: true, tab: data }
  } catch (error) {
    console.error('Error creating tab:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}

/**
 * Get a table by QR code
 * @param qrCode - The table QR code
 * @returns Table data or null if not found
 */
export async function getTableByQRCode(qrCode: string): Promise<Table | null> {
  try {
    if (!qrCode || qrCode.trim().length === 0) {
      return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('qr_code', qrCode.trim())
      .single()

    if (error) {
      console.error('Error fetching table by QR code:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting table by QR code:', error)
    return null
  }
}

/**
 * Close a tab (mark as paid)
 * @param tabId - The tab ID
 * @returns Success or error message
 */
export async function closeTab(tabId: string): Promise<CloseTabResult> {
  try {
    if (!tabId) {
      return { ok: false, message: 'Tab ID is required' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('cafe_tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', tabId)

    if (error) {
      console.error('Error closing tab:', error)
      return { ok: false, message: 'Failed to close tab' }
    }

    return { ok: true }
  } catch (error) {
    console.error('Error closing tab:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}
