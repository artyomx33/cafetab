'use server'

import { createClient } from '@/lib/supabase/server'
import { Table, TabWithItems } from '@/types'

export async function getTableByQRCode(
  qrCode: string
): Promise<
  | { ok: true; table: Table; tab: TabWithItems | null }
  | { ok: false; message: string }
> {
  try {
    const supabase = await createClient()

    // Fetch table by qr_code
    const { data: table, error: tableError } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('qr_code', qrCode)
      .single()

    if (tableError || !table) {
      return {
        ok: false,
        message: 'Table not found. Please check your code and try again.',
      }
    }

    // Fetch current tab for this table with items and products
    if (table.current_tab_id) {
      const { data: tab, error: tabError } = await supabase
        .from('cafe_tabs')
        .select(
          `
          *,
          tab_items:cafe_tab_items (
            *,
            product:cafe_products (*)
          )
        `
        )
        .eq('id', table.current_tab_id)
        .single()

      if (!tabError && tab) {
        return {
          ok: true,
          table,
          tab: tab as TabWithItems,
        }
      }
    }

    return {
      ok: true,
      table,
      tab: null,
    }
  } catch (error) {
    console.error('Error fetching table by QR code:', error)
    return {
      ok: false,
      message: 'An error occurred. Please try again.',
    }
  }
}
