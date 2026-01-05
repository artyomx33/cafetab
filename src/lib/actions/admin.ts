'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  Table,
  Product,
  ProductInsert,
  ProductUpdate,
  Seller,
  SellerInsert,
  SellerUpdate,
  Category,
  CategoryInsert,
  Tab,
  TabItem
} from '@/types'

export interface DashboardStats {
  totalSalesToday: number
  activeTablesCount: number
  itemsSoldToday: number
}

export interface SellerStats {
  id: string
  name: string
  totalSales: number
  itemsSold: number
}

export interface RecentActivity {
  id: string
  productName: string
  sellerName: string
  quantity: number
  subtotal: number
  createdAt: string
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // Get total sales today (sum of paid tabs)
  const { data: paidTabs } = await supabase
    .from('cafe_tabs')
    .select('total')
    .eq('status', 'paid')
    .gte('paid_at', todayISO)

  const totalSalesToday = paidTabs?.reduce((sum, tab) => sum + (tab.total || 0), 0) || 0

  // Get occupied tables count
  const { count: activeTablesCount } = await supabase
    .from('cafe_tables')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occupied')

  // Get items sold today
  const { data: itemsToday } = await supabase
    .from('cafe_tab_items')
    .select('quantity')
    .gte('created_at', todayISO)

  const itemsSoldToday = itemsToday?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  return {
    totalSalesToday,
    activeTablesCount: activeTablesCount || 0,
    itemsSoldToday
  }
}

// Seller Leaderboard
export async function getSellerLeaderboard(): Promise<SellerStats[]> {
  const supabase = createAdminClient()

  const { data: sellers } = await supabase
    .from('cafe_sellers')
    .select('id, name')

  if (!sellers) return []

  // Get tab items for each seller
  const results = await Promise.all(sellers.map(async (seller) => {
    const { data: tabItems } = await supabase
      .from('cafe_tab_items')
      .select('quantity, unit_price')
      .eq('seller_id', seller.id)

    const totalSales = tabItems?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0
    const itemsSold = tabItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

    return {
      id: seller.id,
      name: seller.name,
      totalSales,
      itemsSold
    }
  }))

  return results.sort((a, b) => b.totalSales - a.totalSales)
}

// Recent Activity
export async function getRecentActivity(): Promise<RecentActivity[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('cafe_tab_items')
    .select(`
      id,
      quantity,
      unit_price,
      created_at,
      product:cafe_products (
        name
      ),
      seller:cafe_sellers (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data) return []

  return data.map(item => ({
    id: item.id,
    productName: (item.product as any)?.name || 'Unknown',
    sellerName: (item.seller as any)?.name || 'Unknown',
    quantity: item.quantity,
    subtotal: item.quantity * item.unit_price,
    createdAt: item.created_at
  }))
}

// Tables
export async function getAllTables(): Promise<Table[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_tables')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTable(number: string, section: string | null): Promise<Table> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_tables')
    .insert({
      number,
      section,
      status: 'available'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTable(id: string, updates: { number?: string; section?: string; status?: 'available' | 'occupied' | 'reserved' }): Promise<Table> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_tables')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Products
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createProduct(product: ProductInsert): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('cafe_products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Categories
export async function getAllCategories(): Promise<Category[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(category: CategoryInsert): Promise<Category> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: Partial<CategoryInsert>): Promise<Category> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('cafe_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Sellers
export async function getAllSellers(): Promise<Seller[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_sellers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createSeller(seller: SellerInsert): Promise<Seller> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_sellers')
    .insert(seller)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSeller(id: string, updates: SellerUpdate): Promise<Seller> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cafe_sellers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const supabase = createAdminClient()

  const { data: seller } = await supabase
    .from('cafe_sellers')
    .select('id, name')
    .eq('id', sellerId)
    .single()

  if (!seller) {
    return {
      id: sellerId,
      name: 'Unknown',
      totalSales: 0,
      itemsSold: 0
    }
  }

  const { data: tabItems } = await supabase
    .from('cafe_tab_items')
    .select('quantity, unit_price')
    .eq('seller_id', sellerId)

  const totalSales = tabItems?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0
  const itemsSold = tabItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return {
    id: seller.id,
    name: seller.name,
    totalSales,
    itemsSold
  }
}
