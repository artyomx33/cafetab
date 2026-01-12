'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './client'
import type {
  Seller,
  Tab,
  TabItem,
  Product,
  Category,
  Table,
  TableStatus,
  Order,
  OrderItem,
  ItemStatus,
  Notification,
  VenueSettings,
  Transaction,
  TabWithItems as TabWithItemsType,
  CategoryWithProducts as CategoryWithProductsType,
  TableWithTab,
  OrderWithItems,
  NotificationWithTable,
  ModifierGroup,
  Modifier,
  ProductModifierGroup,
  ModifierGroupWithModifiers,
  ProductWithModifiers,
  OrderItemModifier,
  TabItemModifier,
  Promotion,
  PromotionWithDetails,
  PromotionTarget,
  PromotionSchedule,
  ActivePromotion,
  PromotionType,
  PromotionScope,
  PromotionScheduleType
} from '@/types'

// Re-export types from @/types
export type { TabWithItemsType as TabWithItems, CategoryWithProductsType as CategoryWithProducts }

// Helper to get supabase client (lazy initialization to avoid build errors)
function getSupabase() {
  return createClient()
}

// ============================================
// RESTAURANT HOOKS (Multi-tenant support)
// ============================================

export interface Restaurant {
  id: string
  slug: string
  name: string
  tagline: string | null
  currency: string
  currency_symbol: string
  locale: string
  theme_primary: string | null
  theme_gradient: string | null
  logo_url: string | null
  created_at: string
}

export function useRestaurantBySlug(slug: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    const fetchRestaurant = async () => {
      const supabase = getSupabase()
      const { data, error: err } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (err || !data) {
        setError('Restaurant not found')
        setLoading(false)
        return
      }

      setRestaurant(data as Restaurant)
      setError(null)
      setLoading(false)
    }

    fetchRestaurant()
  }, [slug])

  return { restaurant, loading, error }
}

export function useAllRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .order('name')

      setRestaurants(data || [])
      setLoading(false)
    }

    fetchRestaurants()
  }, [])

  return { restaurants, loading }
}

// Seller hooks
export function useVerifyPin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (restaurantId: string, pin: string): Promise<Seller | null> => {
    setLoading(true)
    setError(null)

    const supabase = getSupabase()
    // Try plain pin first (for database-stored plain pins)
    let { data, error: err } = await supabase
      .from('cafe_sellers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('pin_hash', pin)
      .eq('is_active', true)
      .single()

    // If not found, try hashed version
    if (err || !data) {
      const pinHash = `hashed_${pin}`
      const result = await supabase
        .from('cafe_sellers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('pin_hash', pinHash)
        .eq('is_active', true)
        .single()

      data = result.data
      err = result.error
    }

    if (err || !data) {
      setError('Invalid PIN')
      setLoading(false)
      return null
    }

    setLoading(false)
    return data as Seller
  }, [])

  return { verify, loading, error }
}

// Sellers hook with restaurant filtering
export function useSellers(restaurantId?: string) {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_sellers')
      .select('*')
      .order('name', { ascending: true })

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }

    const { data } = await query
    setSellers(data || [])
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { sellers, loading, refresh }
}

// Table hooks (replaces Groups)
export function useTables(restaurantId?: string) {
  const [tables, setTables] = useState<TableWithTab[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_tables')
      .select(`
        *,
        cafe_tabs!current_tab_id (*)
      `)
      .order('number', { ascending: true })

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }

    const { data: tablesData } = await query

    if (tablesData) {
      const formatted = tablesData.map((t: any) => ({
        id: t.id,
        number: t.number,
        qr_code: t.qr_code,
        status: t.status,
        section: t.section,
        current_tab_id: t.current_tab_id,
        restaurant_id: t.restaurant_id,
        created_at: t.created_at,
        current_tab: t.cafe_tabs || null
      }))
      setTables(formatted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { tables, loading, refresh }
}

export function useTableById(id: string) {
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchTable = async () => {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('cafe_tables')
        .select('*')
        .eq('id', id)
        .single()

      setTable(data as Table)
      setLoading(false)
    }

    fetchTable()
  }, [id])

  return { table, loading }
}

export function useCreateTable() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (number: string, section?: string): Promise<Table> => {
    setLoading(true)
    const supabase = getSupabase()

    // Generate unique QR code
    const qrCode = `TBL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data: table, error } = await supabase
      .from('cafe_tables')
      .insert({
        number,
        qr_code: qrCode,
        status: 'available',
        section: section || null,
        current_tab_id: null
      })
      .select()
      .single()

    if (error) throw error

    setLoading(false)
    return table as Table
  }, [])

  return { create, loading }
}

export function useUpdateTable() {
  const [loading, setLoading] = useState(false)

  const update = useCallback(async (id: string, data: Partial<{ number: string; section: string | null; status: TableStatus }>): Promise<Table> => {
    setLoading(true)

    const supabase = getSupabase()
    const { data: table, error } = await supabase
      .from('cafe_tables')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    setLoading(false)
    return table as Table
  }, [])

  return { update, loading }
}

export function useDeleteTable() {
  const [loading, setLoading] = useState(false)

  const deleteTable = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    const supabase = getSupabase()

    // Check if table has an active tab
    const { data: table } = await supabase
      .from('cafe_tables')
      .select('current_tab_id')
      .eq('id', id)
      .single()

    if (table?.current_tab_id) {
      throw new Error('Cannot delete table with active tab')
    }

    const { error } = await supabase
      .from('cafe_tables')
      .delete()
      .eq('id', id)

    if (error) throw error

    setLoading(false)
  }, [])

  return { deleteTable, loading }
}

// Categories & Products hooks
export function useCategories(restaurantId?: string) {
  const [categories, setCategories] = useState<CategoryWithProductsType[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = getSupabase()

    // Fetch categories with products (only visible categories)
    let query = supabase
      .from('cafe_categories')
      .select(`
        *,
        cafe_products (*)
      `)
      .eq('is_visible', true)
      .order('sort_order')

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }

    const { data } = await query

    // Fetch product IDs that have modifier groups (for quick-add eligibility)
    const { data: modifierLinks } = await supabase
      .from('cafe_product_modifier_groups')
      .select('product_id')

    const productsWithModifiers = new Set(
      (modifierLinks || []).map((link: { product_id: string }) => link.product_id)
    )

    if (data) {
      const formatted = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        is_visible: cat.is_visible,
        created_at: cat.created_at,
        products: (cat.cafe_products || [])
          .sort((a: Product, b: Product) => a.sort_order - b.sort_order)
          .map((p: Product) => ({
            ...p,
            has_modifiers: productsWithModifiers.has(p.id)
          }))
      }))
      setCategories(formatted)
    }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { categories, loading, refresh }
}

// Tab hooks
export function useTab(tableId: string) {
  const [tab, setTab] = useState<TabWithItemsType | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    const { data: tabData } = await supabase
      .from('cafe_tabs')
      .select(`
        *,
        cafe_tab_items (
          *,
          cafe_products (*)
        )
      `)
      .eq('table_id', tableId)
      .eq('status', 'open')
      .single()

    if (tabData) {
      const tabWithItems: TabWithItemsType = {
        id: tabData.id,
        table_id: tabData.table_id,
        type: tabData.type,
        status: tabData.status,
        total: tabData.total,
        prepaid_amount: tabData.prepaid_amount,
        balance: tabData.balance,
        tip: tabData.tip,
        paid_at: tabData.paid_at,
        created_by: tabData.created_by,
        created_at: tabData.created_at,
        tab_items: tabData.cafe_tab_items?.map((item: any) => ({
          id: item.id,
          tab_id: item.tab_id,
          product_id: item.product_id,
          seller_id: item.seller_id,
          order_id: item.order_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          product: item.cafe_products
        })) || []
      }
      setTab(tabWithItems)
    }
    setLoading(false)
  }, [tableId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, sellerId?: string, orderId?: string) => {
    if (!tab) return null
    const supabase = getSupabase()

    // Get product price
    const { data: product } = await supabase
      .from('cafe_products')
      .select('price')
      .eq('id', productId)
      .single()

    if (!product) return null

    const { data: item, error } = await supabase
      .from('cafe_tab_items')
      .insert({
        tab_id: tab.id,
        product_id: productId,
        seller_id: sellerId || null,
        order_id: orderId || null,
        quantity,
        unit_price: product.price
      })
      .select()
      .single()

    if (error) throw error

    refresh()
    return item
  }, [tab, refresh])

  const removeItem = useCallback(async (itemId: string) => {
    const supabase = getSupabase()
    await supabase
      .from('cafe_tab_items')
      .delete()
      .eq('id', itemId)

    refresh()
  }, [refresh])

  const markPaid = useCallback(async () => {
    if (!tab) return false
    const supabase = getSupabase()

    const { error } = await supabase
      .from('cafe_tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', tab.id)

    // Update table status to available
    await supabase
      .from('cafe_tables')
      .update({
        status: 'available',
        current_tab_id: null
      })
      .eq('id', tab.table_id)

    refresh()
    return !error
  }, [tab, refresh])

  return { tab, loading, refresh, addItem, removeItem, markPaid }
}

// Admin hooks
export function useDashboardStats(restaurantId: string) {
  const [stats, setStats] = useState({ totalSales: 0, totalTables: 0, occupiedTables: 0, openTabs: 0 })
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; itemsSold: number; totalSales: number }[]>([])
  const [activity, setActivity] = useState<{ id: string; productName: string; quantity: number; total: number; sellerName: string; tableName: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    // Get tables stats
    const { count: totalTables } = await supabase
      .from('cafe_tables')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)

    const { count: occupiedTables } = await supabase
      .from('cafe_tables')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'occupied')

    // Get open tabs count (filter via tables join)
    const { data: restaurantTables } = await supabase
      .from('cafe_tables')
      .select('id')
      .eq('restaurant_id', restaurantId)

    const tableIds = restaurantTables?.map(t => t.id) || []

    let openTabs = 0
    let totalSales = 0

    if (tableIds.length > 0) {
      const { count } = await supabase
        .from('cafe_tabs')
        .select('*', { count: 'exact', head: true })
        .in('table_id', tableIds)
        .eq('status', 'open')

      openTabs = count || 0

      // Get today's revenue (paid tabs from today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayTabs } = await supabase
        .from('cafe_tabs')
        .select('total')
        .in('table_id', tableIds)
        .eq('status', 'paid')
        .gte('paid_at', today.toISOString())

      totalSales = todayTabs?.reduce((sum, t) => sum + Number(t.total), 0) || 0
    }

    setStats({
      totalSales,
      totalTables: totalTables || 0,
      occupiedTables: occupiedTables || 0,
      openTabs
    })

    // Get seller leaderboard
    const { data: sellers } = await supabase
      .from('cafe_sellers')
      .select('id, name')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)

    if (sellers) {
      const sellerStats = await Promise.all(
        sellers.map(async (seller) => {
          const { data: items } = await supabase
            .from('cafe_tab_items')
            .select('quantity, unit_price')
            .eq('seller_id', seller.id)

          const itemsSold = items?.reduce((sum, i) => sum + i.quantity, 0) || 0
          const totalSales = items?.reduce((sum, i) => sum + (i.quantity * Number(i.unit_price)), 0) || 0

          return {
            id: seller.id,
            name: seller.name,
            itemsSold,
            totalSales
          }
        })
      )
      setLeaderboard(sellerStats.sort((a, b) => b.totalSales - a.totalSales))
    }

    // Get recent activity (filter via nested tables join)
    const { data: recentItems } = await supabase
      .from('cafe_tab_items')
      .select(`
        id,
        quantity,
        unit_price,
        created_at,
        cafe_products (name),
        cafe_sellers (name),
        cafe_tabs!inner (
          cafe_tables!inner (number, restaurant_id)
        )
      `)
      .eq('cafe_tabs.cafe_tables.restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentItems) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activityData = recentItems.map((item: any) => ({
        id: item.id,
        productName: item.cafe_products?.name || 'Unknown',
        quantity: item.quantity,
        total: item.quantity * Number(item.unit_price),
        sellerName: item.cafe_sellers?.name || 'Unknown',
        tableName: item.cafe_tabs?.cafe_tables?.number ? `Table ${item.cafe_tabs.cafe_tables.number}` : 'Unknown',
        createdAt: item.created_at
      }))
      setActivity(activityData)
    }

    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, leaderboard, activity, loading, refresh }
}

export function useAllTables(restaurantId: string) {
  const [tables, setTables] = useState<(Table & { total: number })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('cafe_tables')
      .select(`
        *,
        cafe_tabs (total)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tablesWithTotal = data.map((g: any) => ({
        ...g,
        total: g.cafe_tabs?.[0]?.total || 0
      }))
      setTables(tablesWithTotal)
    }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { tables, loading, refresh }
}

export function useAllProducts(restaurantId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    const { data: productsData } = await supabase
      .from('cafe_products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order')

    const { data: categoriesData } = await supabase
      .from('cafe_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order')

    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createProduct = useCallback(async (data: { name: string; price: number; category_id: string; description?: string; prep_time?: number }) => {
    const supabase = getSupabase()
    const { data: product, error } = await supabase
      .from('cafe_products')
      .insert({
        ...data,
        is_active: true,
        sort_order: 0,
        prep_time: data.prep_time ?? 10
      })
      .select()
      .single()

    if (error) throw error
    refresh()
    return product
  }, [refresh])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const supabase = getSupabase()
    const { data: product, error } = await supabase
      .from('cafe_products')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    refresh()
    return product
  }, [refresh])

  const deleteProduct = useCallback(async (id: string) => {
    const supabase = getSupabase()
    await supabase
      .from('cafe_products')
      .delete()
      .eq('id', id)

    refresh()
  }, [refresh])

  const createCategory = useCallback(async (name: string) => {
    const supabase = getSupabase()
    const { data: category, error } = await supabase
      .from('cafe_categories')
      .insert({
        name,
        is_visible: true,
        sort_order: 0
      })
      .select()
      .single()

    if (error) throw error
    refresh()
    return category
  }, [refresh])

  return { products, categories, loading, refresh, createProduct, updateProduct, deleteProduct, createCategory }
}

export function useAllSellers(restaurantId: string) {
  const [sellers, setSellers] = useState<(Seller & { totalSales: number; itemsSold: number })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    const { data: sellersData } = await supabase
      .from('cafe_sellers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (sellersData) {
      const sellersWithStats = await Promise.all(
        sellersData.map(async (seller) => {
          const { data: items } = await supabase
            .from('cafe_tab_items')
            .select('quantity, unit_price')
            .eq('seller_id', seller.id)

          const itemsSold = items?.reduce((sum, i) => sum + i.quantity, 0) || 0
          const totalSales = items?.reduce((sum, i) => sum + (i.quantity * Number(i.unit_price)), 0) || 0

          return {
            ...seller,
            itemsSold,
            totalSales
          }
        })
      )
      setSellers(sellersWithStats)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createSeller = useCallback(async (name: string, pin: string) => {
    const supabase = getSupabase()
    const { data: seller, error } = await supabase
      .from('cafe_sellers')
      .insert({
        name,
        pin_hash: `hashed_${pin}`,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    refresh()
    return seller
  }, [refresh])

  const updateSeller = useCallback(async (id: string, data: Partial<Seller>) => {
    const supabase = getSupabase()
    const { data: seller, error } = await supabase
      .from('cafe_sellers')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    refresh()
    return seller
  }, [refresh])

  return { sellers, loading, refresh, createSeller, updateSeller }
}

// Reset hook (for demo purposes - just reloads the page)
export function useResetDemo() {
  const reset = useCallback(() => {
    window.location.reload()
  }, [])

  return { reset }
}

export function useOpenTab() {
  const [loading, setLoading] = useState(false)

  const openTab = useCallback(async (
    tableId: string,
    type: 'regular' | 'prepaid',
    sellerId: string,
    prepaidAmount?: number
  ): Promise<Tab> => {
    setLoading(true)
    const supabase = getSupabase()

    const { data: tab, error } = await supabase
      .from('cafe_tabs')
      .insert({
        table_id: tableId,
        type,
        status: 'open',
        prepaid_amount: prepaidAmount || 0,
        balance: prepaidAmount || 0,
        tip: 0,
        created_by: sellerId
      })
      .select()
      .single()

    if (error) throw error

    // Update table to mark as occupied and link to tab
    await supabase
      .from('cafe_tables')
      .update({
        status: 'occupied',
        current_tab_id: tab.id
      })
      .eq('id', tableId)

    setLoading(false)
    return tab as Tab
  }, [])

  return { openTab, loading }
}

export function useTabByTableId(tableId: string) {
  const [tab, setTab] = useState<TabWithItemsType | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tableId) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()
    const { data: tabData } = await supabase
      .from('cafe_tabs')
      .select(`
        *,
        cafe_tab_items (
          *,
          cafe_products (*)
        )
      `)
      .eq('table_id', tableId)
      .eq('status', 'open')
      .single()

    if (tabData) {
      const tabWithItems: TabWithItemsType = {
        id: tabData.id,
        table_id: tabData.table_id,
        type: tabData.type,
        status: tabData.status,
        total: tabData.total,
        prepaid_amount: tabData.prepaid_amount,
        balance: tabData.balance,
        tip: tabData.tip,
        paid_at: tabData.paid_at,
        created_by: tabData.created_by,
        created_at: tabData.created_at,
        tab_items: tabData.cafe_tab_items?.map((item: any) => ({
          id: item.id,
          tab_id: item.tab_id,
          product_id: item.product_id,
          seller_id: item.seller_id,
          order_id: item.order_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          product: item.cafe_products
        })) || []
      }
      setTab(tabWithItems)
    } else {
      setTab(null)
    }
    setLoading(false)
  }, [tableId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (
    productId: string,
    quantity: number,
    sellerId: string,
    modifiers?: { modifierId: string; quantity: number; priceAdjustment: number }[],
    notes?: string
  ) => {
    if (!tab) return null
    const supabase = getSupabase()

    // Get product price
    const { data: product } = await supabase
      .from('cafe_products')
      .select('price')
      .eq('id', productId)
      .single()

    if (!product) return null

    // Calculate unit price including modifiers
    let unitPrice = product.price
    if (modifiers && modifiers.length > 0) {
      modifiers.forEach(mod => {
        unitPrice += mod.priceAdjustment * mod.quantity
      })
    }

    const { data: item, error } = await supabase
      .from('cafe_tab_items')
      .insert({
        tab_id: tab.id,
        product_id: productId,
        seller_id: sellerId,
        quantity,
        unit_price: unitPrice
      })
      .select()
      .single()

    if (error) throw error

    // Add modifiers to tab item if any
    if (modifiers && modifiers.length > 0 && item) {
      const modifierInserts = modifiers.map(mod => ({
        tab_item_id: item.id,
        modifier_id: mod.modifierId,
        quantity: mod.quantity,
        price_adjustment: mod.priceAdjustment
      }))

      const { error: modError } = await supabase
        .from('cafe_tab_item_modifiers')
        .insert(modifierInserts)

      if (modError) {
        console.error('Failed to add tab item modifiers:', modError)
      }
    }

    refresh()
    return item
  }, [tab, refresh])

  const closeTab = useCallback(async () => {
    if (!tab) return false
    const supabase = getSupabase()

    const { error } = await supabase
      .from('cafe_tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', tab.id)

    if (error) return false

    // Update table to mark as available
    await supabase
      .from('cafe_tables')
      .update({
        status: 'available',
        current_tab_id: null
      })
      .eq('id', tab.table_id)

    refresh()
    return true
  }, [tab, refresh])

  return { tab, loading, refresh, addItem, closeTab }
}

// ============================================
// CLIENT-FACING HOOKS (for table QR codes)
// ============================================

// Hook to fetch table by QR code
export function useTableByQR(qrCode: string) {
  const [table, setTable] = useState<Table | null>(null)
  const [tab, setTab] = useState<Tab | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!qrCode) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = getSupabase()
    const { data: tableData, error: err } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('qr_code', qrCode)
      .single()

    if (err || !tableData) {
      setError('Table not found')
      setLoading(false)
      return
    }

    setTable(tableData as Table)

    // Get active tab if exists
    if (tableData.current_tab_id) {
      const { data: tabData } = await supabase
        .from('cafe_tabs')
        .select('*')
        .eq('id', tableData.current_tab_id)
        .single()

      if (tabData) {
        setTab(tabData as Tab)
      }
    }

    setError(null)
    setLoading(false)
  }, [qrCode])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { table, tab, loading, error, refresh }
}

// Hook to get tab with items for client view
export function useClientTab(tabId: string | null) {
  const [tab, setTab] = useState<TabWithItemsType | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tabId) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    // Fetch tab with items and products (including prep_time)
    const { data: tabData } = await supabase
      .from('cafe_tabs')
      .select(`
        *,
        cafe_tab_items (
          *,
          cafe_products (*)
        )
      `)
      .eq('id', tabId)
      .single()

    if (!tabData) {
      setLoading(false)
      return
    }

    // Get all unique order_ids from tab items
    const orderIds = [...new Set(
      tabData.cafe_tab_items
        ?.filter((item: any) => item.order_id)
        .map((item: any) => item.order_id) || []
    )]

    // Fetch order_items status for those orders
    let orderItemsMap: Record<string, { status: string; product_id: string }[]> = {}
    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('cafe_order_items')
        .select('order_id, product_id, status')
        .in('order_id', orderIds)

      if (orderItems) {
        // Group by order_id for easy lookup
        orderItems.forEach((item: any) => {
          if (!orderItemsMap[item.order_id]) {
            orderItemsMap[item.order_id] = []
          }
          orderItemsMap[item.order_id].push({
            status: item.status,
            product_id: item.product_id
          })
        })
      }
    }

    const tabWithItems: TabWithItemsType = {
      id: tabData.id,
      table_id: tabData.table_id,
      type: tabData.type,
      status: tabData.status,
      total: tabData.total,
      prepaid_amount: tabData.prepaid_amount,
      balance: tabData.balance,
      tip: tabData.tip,
      paid_at: tabData.paid_at,
      created_by: tabData.created_by,
      created_at: tabData.created_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tab_items: tabData.cafe_tab_items?.map((item: any) => {
        // Find matching order_item status
        let itemStatus: string | null = null
        if (item.order_id && orderItemsMap[item.order_id]) {
          const matchingOrderItem = orderItemsMap[item.order_id].find(
            oi => oi.product_id === item.product_id
          )
          if (matchingOrderItem) {
            itemStatus = matchingOrderItem.status
          }
        }

        return {
          id: item.id,
          tab_id: item.tab_id,
          product_id: item.product_id,
          seller_id: item.seller_id,
          order_id: item.order_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          product: item.cafe_products,
          item_status: itemStatus // 'pending' | 'ready' | 'delivered' | null
        }
      }) || []
    }
    setTab(tabWithItems)
    setLoading(false)
  }, [tabId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { tab, loading, refresh }
}

// Hook to get categories with products for menu
export function useClientMenu(restaurantId?: string) {
  const [categories, setCategories] = useState<CategoryWithProductsType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      const supabase = getSupabase()
      let query = supabase
        .from('cafe_categories')
        .select(`
          *,
          cafe_products (*)
        `)
        .eq('is_visible', true)
        .order('sort_order')

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId)
      }

      const { data } = await query

      // Fetch product IDs that have modifier groups (for quick-add eligibility)
      const { data: modifierLinks } = await supabase
        .from('cafe_product_modifier_groups')
        .select('product_id')

      const productsWithModifiers = new Set(
        (modifierLinks || []).map((link: { product_id: string }) => link.product_id)
      )

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          sort_order: cat.sort_order,
          is_visible: cat.is_visible,
          created_at: cat.created_at,
          products: (cat.cafe_products || [])
            .filter((p: Product) => p.is_active)
            .sort((a: Product, b: Product) => a.sort_order - b.sort_order)
            .map((p: Product) => ({
              ...p,
              has_modifiers: productsWithModifiers.has(p.id)
            }))
        }))
        setCategories(formatted)
      }
      setLoading(false)
    }

    fetchMenu()
  }, [])

  return { categories, loading }
}

// Hook to create order and add items to tab (with modifier support)
export function useCreateOrder(tabId: string | null) {
  const [loading, setLoading] = useState(false)

  const createOrder = useCallback(async (items: {
    product_id: string
    quantity: number
    notes?: string
    modifiers?: { modifier_id: string; quantity: number; price_adjustment: number }[]
    unit_price?: number
  }[]) => {
    if (!tabId) return null

    setLoading(true)
    const supabase = getSupabase()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('cafe_orders')
      .insert({
        tab_id: tabId,
        status: 'pending',
        notes: null
      })
      .select()
      .single()

    if (orderError || !order) {
      setLoading(false)
      throw new Error('Failed to create order')
    }

    // Add order items and their modifiers
    for (const item of items) {
      // Insert order item
      const { data: orderItem, error: itemError } = await supabase
        .from('cafe_order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes || null
        })
        .select()
        .single()

      if (itemError || !orderItem) {
        setLoading(false)
        throw new Error('Failed to add order item')
      }

      // Add modifiers for this order item if any
      if (item.modifiers && item.modifiers.length > 0) {
        const modifierInserts = item.modifiers.map(mod => ({
          order_item_id: orderItem.id,
          modifier_id: mod.modifier_id,
          quantity: mod.quantity,
          price_adjustment: mod.price_adjustment
        }))

        const { error: modError } = await supabase
          .from('cafe_order_item_modifiers')
          .insert(modifierInserts)

        if (modError) {
          setLoading(false)
          throw new Error('Failed to add order item modifiers')
        }
      }

      // Add to tab items with calculated price
      let unitPrice = item.unit_price
      if (unitPrice === undefined) {
        const { data: product } = await supabase
          .from('cafe_products')
          .select('price')
          .eq('id', item.product_id)
          .single()

        unitPrice = product?.price || 0

        // Add modifier prices to unit price
        if (item.modifiers) {
          item.modifiers.forEach(mod => {
            unitPrice = (unitPrice || 0) + (mod.price_adjustment * mod.quantity)
          })
        }
      }

      const { data: tabItem, error: tabItemError } = await supabase
        .from('cafe_tab_items')
        .insert({
          tab_id: tabId,
          product_id: item.product_id,
          seller_id: null,
          order_id: order.id,
          quantity: item.quantity,
          unit_price: unitPrice
        })
        .select()
        .single()

      if (tabItemError || !tabItem) {
        setLoading(false)
        throw new Error('Failed to add tab item')
      }

      // Add modifiers to tab item if any
      if (item.modifiers && item.modifiers.length > 0) {
        const tabModifierInserts = item.modifiers.map(mod => ({
          tab_item_id: tabItem.id,
          modifier_id: mod.modifier_id,
          quantity: mod.quantity,
          price_adjustment: mod.price_adjustment
        }))

        const { error: tabModError } = await supabase
          .from('cafe_tab_item_modifiers')
          .insert(tabModifierInserts)

        if (tabModError) {
          setLoading(false)
          throw new Error('Failed to add tab item modifiers')
        }
      }
    }

    setLoading(false)
    return order
  }, [tabId])

  return { createOrder, loading }
}

// Hook to send notifications
export function useSendNotification() {
  const [loading, setLoading] = useState(false)

  const sendNotification = useCallback(async (
    type: 'order' | 'bill_request' | 'server_call' | 'payment' | 'refund_request' | 'low_balance',
    tableId: string,
    message: string
  ) => {
    setLoading(true)
    const supabase = getSupabase()

    const { error } = await supabase
      .from('cafe_notifications')
      .insert({
        type,
        table_id: tableId,
        seller_id: null,
        message,
        read: false
      })

    setLoading(false)
    if (error) throw error
  }, [])

  return { sendNotification, loading }
}

// Hook to get and update venue settings
export function useVenueSettings(restaurantId?: string) {
  const [settings, setSettings] = useState<VenueSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_venue_settings')
      .select('*')

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }

    const { data } = await query.single()

    setSettings(data as VenueSettings)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateSettings = useCallback(async (updates: Partial<VenueSettings>) => {
    if (!settings) return null
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('cafe_venue_settings')
      .update(updates)
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw error

    setSettings(data as VenueSettings)
    return data as VenueSettings
  }, [settings])

  return { settings, loading, refresh, updateSettings }
}

// ============================================
// ORDER HOOKS (for kitchen display)
// ============================================

export function useOrders(restaurantId: string, status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled') {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_orders')
      .select(`
        *,
        cafe_order_items (
          *,
          cafe_products (*)
        ),
        cafe_tabs!inner (
          cafe_tables!inner (number, restaurant_id)
        )
      `)
      .eq('cafe_tabs.cafe_tables.restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data } = await query

    if (data) {
      const formatted = data.map((order: any) => ({
        id: order.id,
        tab_id: order.tab_id,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        prepared_at: order.prepared_at,
        served_at: order.served_at,
        order_items: order.cafe_order_items?.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes,
          status: item.status || 'pending',
          ready_at: item.ready_at,
          delivered_at: item.delivered_at,
          created_at: item.created_at,
          product: item.cafe_products
        })) || [],
        table_number: order.cafe_tabs?.cafe_tables?.number || 'Unknown'
      }))
      setOrders(formatted)
    }
    setLoading(false)
  }, [restaurantId, status])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled') => {
    const supabase = getSupabase()
    const updateData: any = { status: newStatus }

    if (newStatus === 'ready') {
      updateData.prepared_at = new Date().toISOString()
    } else if (newStatus === 'served') {
      updateData.served_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('cafe_orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw error
    refresh()
  }, [refresh])

  // Mark individual item as ready
  const markItemReady = useCallback(async (itemId: string) => {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_order_items')
      .update({
        status: 'ready',
        ready_at: new Date().toISOString()
      })
      .eq('id', itemId)

    if (error) throw error
    refresh()
  }, [refresh])

  // Mark individual item as delivered
  const markItemDelivered = useCallback(async (itemId: string) => {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_order_items')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', itemId)

    if (error) throw error
    refresh()
  }, [refresh])

  // Bulk mark items as delivered
  const markItemsDelivered = useCallback(async (itemIds: string[]) => {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_order_items')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .in('id', itemIds)

    if (error) throw error
    refresh()
  }, [refresh])

  return { orders, loading, refresh, updateOrderStatus, markItemReady, markItemDelivered, markItemsDelivered }
}

// ============================================
// NOTIFICATION HOOKS
// ============================================

export function useNotifications(restaurantId: string, sellerId?: string) {
  const [notifications, setNotifications] = useState<NotificationWithTable[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_notifications')
      .select(`
        *,
        cafe_tables!inner (*)
      `)
      .eq('cafe_tables.restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (sellerId) {
      query = query.or(`seller_id.eq.${sellerId},seller_id.is.null`)
    }

    const { data } = await query

    if (data) {
      const formatted = data.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        table_id: notif.table_id,
        seller_id: notif.seller_id,
        message: notif.message,
        read: notif.read,
        created_at: notif.created_at,
        table: notif.cafe_tables
      }))
      setNotifications(formatted)
    }
    setLoading(false)
  }, [restaurantId, sellerId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
    refresh()
  }, [refresh])

  const markAllAsRead = useCallback(async () => {
    const supabase = getSupabase()
    let query = supabase
      .from('cafe_notifications')
      .update({ read: true })
      .eq('read', false)

    if (sellerId) {
      query = query.or(`seller_id.eq.${sellerId},seller_id.is.null`)
    }

    const { error } = await query

    if (error) throw error
    refresh()
  }, [sellerId, refresh])

  return { notifications, loading, refresh, markAsRead, markAllAsRead }
}

// ============================================
// MODIFIER SYSTEM HOOKS
// ============================================

// Hook to fetch a product with all its modifier groups and modifiers
export function useProductWithModifiers(productId: string) {
  const [product, setProduct] = useState<ProductWithModifiers | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!productId) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()
    // Fetch product
    const { data: productData, error: productError } = await supabase
      .from('cafe_products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !productData) {
      setLoading(false)
      return
    }

    // Fetch product modifier groups with their details and modifiers
    const { data: productModifierGroups } = await supabase
      .from('cafe_product_modifier_groups')
      .select(`
        *,
        cafe_modifier_groups (
          *,
          cafe_modifiers (*)
        )
      `)
      .eq('product_id', productId)
      .order('sort_order')

    // Format the data
    const modifierGroups: ModifierGroupWithModifiers[] = (productModifierGroups || [])
      .map((pmg: any) => {
        const group = pmg.cafe_modifier_groups
        if (!group) return null

        return {
          id: group.id,
          name: group.name,
          type: group.type,
          is_required: group.is_required,
          min_select: group.min_select,
          max_select: group.max_select,
          sort_order: group.sort_order,
          created_at: group.created_at,
          modifiers: (group.cafe_modifiers || [])
            .filter((m: Modifier) => m.is_active)
            .sort((a: Modifier, b: Modifier) => a.sort_order - b.sort_order)
        }
      })
      .filter(Boolean) as ModifierGroupWithModifiers[]

    const productWithModifiers: ProductWithModifiers = {
      ...productData,
      modifier_groups: modifierGroups
    }

    setProduct(productWithModifiers)
    setLoading(false)
  }, [productId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { product, loading, refresh }
}

// Hook to fetch all modifier groups with their modifiers
export function useModifierGroups(restaurantId: string) {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroupWithModifiers[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!restaurantId) {
      setModifierGroups([])
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    // Modifier groups don't have restaurant_id directly.
    // Filter by finding groups linked to products belonging to this restaurant.
    const { data: productModifierGroups } = await supabase
      .from('cafe_product_modifier_groups')
      .select(`
        modifier_group_id,
        cafe_products!inner (restaurant_id)
      `)
      .eq('cafe_products.restaurant_id', restaurantId)

    const groupIds = [...new Set((productModifierGroups || []).map(pmg => pmg.modifier_group_id))]

    if (groupIds.length === 0) {
      setModifierGroups([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('cafe_modifier_groups')
      .select(`
        *,
        cafe_modifiers (*)
      `)
      .in('id', groupIds)
      .order('sort_order')

    if (data) {
      const formatted = data.map((group: any) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        is_required: group.is_required,
        min_select: group.min_select,
        max_select: group.max_select,
        sort_order: group.sort_order,
        created_at: group.created_at,
        modifiers: (group.cafe_modifiers || [])
          .filter((m: Modifier) => m.is_active)
          .sort((a: Modifier, b: Modifier) => a.sort_order - b.sort_order)
      }))
      setModifierGroups(formatted)
    }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { modifierGroups, loading, refresh }
}

// Hook to create a new modifier group
export function useCreateModifierGroup() {
  const [loading, setLoading] = useState(false)

  const createModifierGroup = useCallback(async (data: {
    name: string
    type: 'single' | 'multi'
    is_required: boolean
    min_select: number
    max_select: number | null
    sort_order?: number
  }): Promise<ModifierGroup> => {
    setLoading(true)
    const supabase = getSupabase()

    const { data: modifierGroup, error } = await supabase
      .from('cafe_modifier_groups')
      .insert({
        name: data.name,
        type: data.type,
        is_required: data.is_required,
        min_select: data.min_select,
        max_select: data.max_select,
        sort_order: data.sort_order ?? 0
      })
      .select()
      .single()

    if (error) throw error

    setLoading(false)
    return modifierGroup as ModifierGroup
  }, [])

  return { createModifierGroup, loading }
}

// Hook to create a new modifier
export function useCreateModifier() {
  const [loading, setLoading] = useState(false)

  const createModifier = useCallback(async (data: {
    group_id: string
    name: string
    price_adjustment: number
    is_default?: boolean
    is_active?: boolean
    sort_order?: number
  }): Promise<Modifier> => {
    setLoading(true)
    const supabase = getSupabase()

    const { data: modifier, error } = await supabase
      .from('cafe_modifiers')
      .insert({
        group_id: data.group_id,
        name: data.name,
        price_adjustment: data.price_adjustment,
        is_default: data.is_default ?? false,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0
      })
      .select()
      .single()

    if (error) throw error

    setLoading(false)
    return modifier as Modifier
  }, [])

  return { createModifier, loading }
}

// Hook to link a modifier group to a product
export function useLinkProductModifierGroup() {
  const [loading, setLoading] = useState(false)

  const linkProductModifierGroup = useCallback(async (data: {
    product_id: string
    modifier_group_id: string
    sort_order?: number
  }): Promise<ProductModifierGroup> => {
    setLoading(true)
    const supabase = getSupabase()

    const { data: link, error } = await supabase
      .from('cafe_product_modifier_groups')
      .insert({
        product_id: data.product_id,
        modifier_group_id: data.modifier_group_id,
        sort_order: data.sort_order ?? 0
      })
      .select()
      .single()

    if (error) throw error

    setLoading(false)
    return link as ProductModifierGroup
  }, [])

  return { linkProductModifierGroup, loading }
}

// ============================================
// PAYMENT & TRANSACTION HOOKS
// ============================================

// Hook to create a payment transaction
export function useCreatePayment() {
  const [loading, setLoading] = useState(false)

  const createPayment = useCallback(async (data: {
    tab_id: string
    amount: number
    tip_amount: number
    payment_method: 'card' | 'cash'
    processed_by: string
    notes?: string
  }) => {
    setLoading(true)
    const supabase = getSupabase()

    const { data: transaction, error } = await supabase
      .from('cafe_transactions')
      .insert({
        tab_id: data.tab_id,
        type: 'payment',
        amount: data.amount,
        tip_amount: data.tip_amount,
        payment_method: data.payment_method,
        processed_by: data.processed_by,
        notes: data.notes || null
      })
      .select()
      .single()

    setLoading(false)
    if (error) throw error
    return transaction
  }, [])

  return { createPayment, loading }
}

// Hook to get transactions for a tab
export function useTabTransactions(tabId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tabId) {
      setTransactions([])
      setLoading(false)
      return
    }

    const supabase = getSupabase()
    const { data } = await supabase
      .from('cafe_transactions')
      .select('*')
      .eq('tab_id', tabId)
      .order('created_at', { ascending: false })

    setTransactions(data || [])
    setLoading(false)
  }, [tabId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Calculate remaining balance
  const paidAmount = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { transactions, paidAmount, loading, refresh }
}

// Hook to get payment history with filters
export function usePaymentHistory(restaurantId: string, filters?: {
  date_from?: string
  date_to?: string
  payment_method?: 'card' | 'cash' | null
  seller_id?: string | null
}) {
  const [payments, setPayments] = useState<(Transaction & {
    tab?: { total: number; table?: { number: string; restaurant_id?: string } }
    seller?: { name: string }
  })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!restaurantId) {
      setPayments([])
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = getSupabase()

    // Filter transactions through tab -> table -> restaurant_id
    let query = supabase
      .from('cafe_transactions')
      .select(`
        *,
        tab:cafe_tabs!tab_id (
          total,
          table:cafe_tables!table_id!inner (number, restaurant_id)
        ),
        seller:cafe_sellers!processed_by (name)
      `)
      .eq('type', 'payment')
      .eq('tab.table.restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method)
    }
    if (filters?.seller_id) {
      query = query.eq('processed_by', filters.seller_id)
    }

    const { data } = await query.limit(100)
    setPayments(data || [])
    setLoading(false)
  }, [restaurantId, filters?.date_from, filters?.date_to, filters?.payment_method, filters?.seller_id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { payments, loading, refresh }
}

// Hook to get daily payment stats
export function useDailyPaymentStats(restaurantId: string, date?: string) {
  const [stats, setStats] = useState<{
    totalRevenue: number
    cashTotal: number
    cardTotal: number
    tipsTotal: number
    paymentCount: number
    sellerStats: { seller_id: string; seller_name: string; revenue: number; tips: number; count: number }[]
  }>({
    totalRevenue: 0,
    cashTotal: 0,
    cardTotal: 0,
    tipsTotal: 0,
    paymentCount: 0,
    sellerStats: []
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!restaurantId) {
      setStats({
        totalRevenue: 0,
        cashTotal: 0,
        cardTotal: 0,
        tipsTotal: 0,
        paymentCount: 0,
        sellerStats: []
      })
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = getSupabase()

    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0]
    const startOfDay = `${targetDate}T00:00:00`
    const endOfDay = `${targetDate}T23:59:59`

    // Filter transactions through tab -> table -> restaurant_id
    const { data: payments } = await supabase
      .from('cafe_transactions')
      .select(`
        *,
        seller:cafe_sellers!processed_by (id, name),
        tab:cafe_tabs!tab_id (
          table:cafe_tables!table_id!inner (restaurant_id)
        )
      `)
      .eq('type', 'payment')
      .eq('tab.table.restaurant_id', restaurantId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (payments) {
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount) + Number(p.tip_amount || 0), 0)
      const cashPayments = payments.filter(p => p.payment_method === 'cash')
      const cardPayments = payments.filter(p => p.payment_method === 'card')

      const cashTotal = cashPayments.reduce((sum, p) => sum + Number(p.amount) + Number(p.tip_amount || 0), 0)
      const cardTotal = cardPayments.reduce((sum, p) => sum + Number(p.amount) + Number(p.tip_amount || 0), 0)
      const tipsTotal = payments.reduce((sum, p) => sum + Number(p.tip_amount || 0), 0)

      // Group by seller
      const sellerMap = new Map<string, { seller_id: string; seller_name: string; revenue: number; tips: number; count: number }>()
      for (const payment of payments) {
        const sellerId = payment.processed_by || 'unknown'
        const sellerName = payment.seller?.name || 'Unknown'

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, { seller_id: sellerId, seller_name: sellerName, revenue: 0, tips: 0, count: 0 })
        }
        const seller = sellerMap.get(sellerId)!
        seller.revenue += Number(payment.amount) + Number(payment.tip_amount || 0)
        seller.tips += Number(payment.tip_amount || 0)
        seller.count += 1
      }

      setStats({
        totalRevenue,
        cashTotal,
        cardTotal,
        tipsTotal,
        paymentCount: payments.length,
        sellerStats: Array.from(sellerMap.values()).sort((a, b) => b.tips - a.tips)
      })
    }

    setLoading(false)
  }, [restaurantId, date])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}

// Hook to mark a tab as paid and free the table
export function useMarkTabPaid() {
  const [loading, setLoading] = useState(false)

  const markTabPaid = useCallback(async (tabId: string) => {
    setLoading(true)
    const supabase = getSupabase()

    // Get tab to find table_id
    const { data: tab } = await supabase
      .from('cafe_tabs')
      .select('table_id')
      .eq('id', tabId)
      .single()

    if (!tab) {
      setLoading(false)
      throw new Error('Tab not found')
    }

    // Update tab status
    const { error: tabError } = await supabase
      .from('cafe_tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', tabId)

    if (tabError) {
      setLoading(false)
      throw tabError
    }

    // Free the table
    await supabase
      .from('cafe_tables')
      .update({
        status: 'available',
        current_tab_id: null
      })
      .eq('id', tab.table_id)

    setLoading(false)
    return true
  }, [])

  return { markTabPaid, loading }
}

// Hook to create a refund
export function useCreateRefund() {
  const [loading, setLoading] = useState(false)

  const createRefund = useCallback(async (data: {
    original_transaction_id: string
    amount: number
    processed_by: string
    notes?: string
  }) => {
    setLoading(true)
    const supabase = getSupabase()

    // Get original transaction to find tab_id
    const { data: original } = await supabase
      .from('cafe_transactions')
      .select('tab_id, payment_method')
      .eq('id', data.original_transaction_id)
      .single()

    if (!original) {
      setLoading(false)
      throw new Error('Original transaction not found')
    }

    const { data: transaction, error } = await supabase
      .from('cafe_transactions')
      .insert({
        tab_id: original.tab_id,
        type: 'refund',
        amount: -Math.abs(data.amount), // Negative amount for refund
        tip_amount: 0,
        payment_method: original.payment_method,
        processed_by: data.processed_by,
        reference_transaction_id: data.original_transaction_id,
        notes: data.notes || 'Refund'
      })
      .select()
      .single()

    setLoading(false)
    if (error) throw error
    return transaction
  }, [])

  return { createRefund, loading }
}
