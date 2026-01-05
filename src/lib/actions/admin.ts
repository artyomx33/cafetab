'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  Group,
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
  activeGroupsCount: number
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
    .from('tabs')
    .select('total')
    .eq('status', 'paid')
    .gte('updated_at', todayISO)

  const totalSalesToday = paidTabs?.reduce((sum, tab) => sum + (tab.total || 0), 0) || 0

  // Get active groups count
  const { count: activeGroupsCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get items sold today
  const { data: itemsToday } = await supabase
    .from('tab_items')
    .select('quantity')
    .gte('created_at', todayISO)

  const itemsSoldToday = itemsToday?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  return {
    totalSalesToday,
    activeGroupsCount: activeGroupsCount || 0,
    itemsSoldToday
  }
}

// Seller Leaderboard
export async function getSellerLeaderboard(): Promise<SellerStats[]> {
  const supabase = createAdminClient()

  const { data: sellers } = await supabase
    .from('sellers')
    .select(`
      id,
      name,
      tabs (
        total,
        status,
        tab_items (
          quantity
        )
      )
    `)

  if (!sellers) return []

  return sellers.map(seller => {
    const paidTabs = (seller.tabs as any[])?.filter(tab => tab.status === 'paid') || []
    const totalSales = paidTabs.reduce((sum, tab) => sum + (tab.total || 0), 0)

    const allItems = (seller.tabs as any[])?.flatMap(tab => tab.tab_items || []) || []
    const itemsSold = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

    return {
      id: seller.id,
      name: seller.name,
      totalSales,
      itemsSold
    }
  }).sort((a, b) => b.totalSales - a.totalSales)
}

// Recent Activity
export async function getRecentActivity(): Promise<RecentActivity[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('tab_items')
    .select(`
      id,
      quantity,
      unit_price,
      created_at,
      product:products (
        name
      ),
      seller:sellers (
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

// Groups
export async function getAllGroups(): Promise<Group[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createGroup(name: string, clientCode: string, createdBy: string | null): Promise<Group> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      client_code: clientCode,
      status: 'active',
      created_by: createdBy
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGroup(id: string, updates: { name?: string; client_code?: string; status?: 'active' | 'closed' }): Promise<Group> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('groups')
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
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createProduct(product: ProductInsert): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
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
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Categories
export async function getAllCategories(): Promise<Category[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(category: CategoryInsert): Promise<Category> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: Partial<CategoryInsert>): Promise<Category> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
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
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Sellers
export async function getAllSellers(): Promise<Seller[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createSeller(seller: SellerInsert): Promise<Seller> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('sellers')
    .insert(seller)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSeller(id: string, updates: SellerUpdate): Promise<Seller> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('sellers')
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
    .from('sellers')
    .select(`
      id,
      name,
      tabs (
        total,
        status,
        tab_items (
          quantity
        )
      )
    `)
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

  const paidTabs = (seller.tabs as any[])?.filter(tab => tab.status === 'paid') || []
  const totalSales = paidTabs.reduce((sum, tab) => sum + (tab.total || 0), 0)

  const allItems = (seller.tabs as any[])?.flatMap(tab => tab.tab_items || []) || []
  const itemsSold = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  return {
    id: seller.id,
    name: seller.name,
    totalSales,
    itemsSold
  }
}
