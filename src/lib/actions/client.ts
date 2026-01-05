'use server'

import { createClient } from '@/lib/supabase/server'
import { Group, TabWithItems } from '@/types'

export async function getGroupByClientCode(
  code: string
): Promise<
  | { ok: true; group: Group; tab: TabWithItems }
  | { ok: false; message: string }
> {
  try {
    const supabase = await createClient()

    // Fetch group by client_code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('client_code', code)
      .single()

    if (groupError || !group) {
      return {
        ok: false,
        message: 'Group not found. Please check your code and try again.',
      }
    }

    // Fetch tab for this group with items and products
    const { data: tab, error: tabError } = await supabase
      .from('tabs')
      .select(
        `
        *,
        tab_items (
          *,
          product:products (*)
        )
      `
      )
      .eq('group_id', group.id)
      .single()

    if (tabError || !tab) {
      // If no tab exists, return empty tab
      return {
        ok: true,
        group,
        tab: {
          id: '',
          group_id: group.id,
          status: 'open',
          total: 0,
          paid_at: null,
          created_at: new Date().toISOString(),
          tab_items: [],
        },
      }
    }

    return {
      ok: true,
      group,
      tab: tab as TabWithItems,
    }
  } catch (error) {
    console.error('Error fetching group by client code:', error)
    return {
      ok: false,
      message: 'An error occurred. Please try again.',
    }
  }
}
