'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tab, TabItem, TabWithItems, Product } from '@/types'

type AddItemResult =
  | { ok: true; item: TabItem }
  | { ok: false; message: string }

type RemoveItemResult =
  | { ok: true }
  | { ok: false; message: string }

type MarkPaidResult =
  | { ok: true }
  | { ok: false; message: string }

/**
 * Get a tab by group ID
 * @param groupId - The group ID
 * @returns Tab with items and product details, or null if not found
 */
export async function getTabByGroupId(groupId: string): Promise<TabWithItems | null> {
  try {
    if (!groupId) {
      return null
    }

    const supabase = await createClient()

    // Fetch the tab
    const { data: tab, error: tabError } = await supabase
      .from('tabs')
      .select('*')
      .eq('group_id', groupId)
      .single()

    if (tabError || !tab) {
      console.error('Error fetching tab:', tabError)
      return null
    }

    // Fetch tab items with product details
    const { data: items, error: itemsError } = await supabase
      .from('tab_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('tab_id', tab.id)
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Error fetching tab items:', itemsError)
      return null
    }

    return {
      ...tab,
      tab_items: items || [],
    }
  } catch (error) {
    console.error('Error getting tab by group ID:', error)
    return null
  }
}

/**
 * Add an item to a tab
 * @param tabId - The tab ID
 * @param productId - The product ID
 * @param quantity - The quantity to add
 * @param sellerId - The seller ID
 * @returns The created/updated item or error message
 */
export async function addItemToTab(
  tabId: string,
  productId: string,
  quantity: number,
  sellerId: string
): Promise<AddItemResult> {
  try {
    if (!tabId || !productId || !sellerId) {
      return { ok: false, message: 'Missing required fields' }
    }

    if (quantity <= 0) {
      return { ok: false, message: 'Quantity must be greater than 0' }
    }

    const supabase = await createClient()

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      return { ok: false, message: 'Product not found' }
    }

    // Check if item already exists on this tab
    const { data: existingItem, error: existingError } = await supabase
      .from('tab_items')
      .select('*')
      .eq('tab_id', tabId)
      .eq('product_id', productId)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing item:', existingError)
      return { ok: false, message: 'Failed to add item' }
    }

    let item: TabItem

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity

      const { data: updatedItem, error: updateError } = await supabase
        .from('tab_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (updateError || !updatedItem) {
        console.error('Error updating item:', updateError)
        return { ok: false, message: 'Failed to update item' }
      }

      item = updatedItem
    } else {
      // Create new item
      const { data: newItem, error: insertError } = await supabase
        .from('tab_items')
        .insert({
          tab_id: tabId,
          product_id: productId,
          quantity,
          unit_price: product.price,
          seller_id: sellerId,
        })
        .select()
        .single()

      if (insertError || !newItem) {
        console.error('Error creating item:', insertError)
        return { ok: false, message: 'Failed to add item' }
      }

      item = newItem
    }

    // Update tab total
    await updateTabTotal(tabId)

    return { ok: true, item }
  } catch (error) {
    console.error('Error adding item to tab:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}

/**
 * Remove an item from a tab
 * @param itemId - The item ID
 * @returns Success or error message
 */
export async function removeItemFromTab(itemId: string): Promise<RemoveItemResult> {
  try {
    if (!itemId) {
      return { ok: false, message: 'Item ID is required' }
    }

    const supabase = await createClient()

    // Get the item to find the tab_id
    const { data: item, error: itemError } = await supabase
      .from('tab_items')
      .select('tab_id')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      console.error('Error fetching item:', itemError)
      return { ok: false, message: 'Item not found' }
    }

    const { error } = await supabase
      .from('tab_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error removing item:', error)
      return { ok: false, message: 'Failed to remove item' }
    }

    // Update tab total
    await updateTabTotal(item.tab_id)

    return { ok: true }
  } catch (error) {
    console.error('Error removing item from tab:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}

/**
 * Mark a tab as paid
 * @param tabId - The tab ID
 * @returns Success or error message
 */
export async function markTabPaid(tabId: string): Promise<MarkPaidResult> {
  try {
    if (!tabId) {
      return { ok: false, message: 'Tab ID is required' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', tabId)

    if (error) {
      console.error('Error marking tab as paid:', error)
      return { ok: false, message: 'Failed to mark tab as paid' }
    }

    return { ok: true }
  } catch (error) {
    console.error('Error marking tab as paid:', error)
    return { ok: false, message: 'An unexpected error occurred' }
  }
}

/**
 * Update the total for a tab by summing all items
 * @param tabId - The tab ID
 */
async function updateTabTotal(tabId: string): Promise<void> {
  try {
    const supabase = await createClient()

    // Get all items for this tab
    const { data: items, error: itemsError } = await supabase
      .from('tab_items')
      .select('quantity, unit_price')
      .eq('tab_id', tabId)

    if (itemsError) {
      console.error('Error fetching items for total calculation:', itemsError)
      return
    }

    // Calculate total
    const total = (items || []).reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0)

    // Update tab total
    const { error: updateError } = await supabase
      .from('tabs')
      .update({ total })
      .eq('id', tabId)

    if (updateError) {
      console.error('Error updating tab total:', updateError)
    }
  } catch (error) {
    console.error('Error in updateTabTotal:', error)
  }
}
