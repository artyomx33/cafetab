'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './client'
import type { Seller, Group, Tab, TabItem, Product, Category } from '@/types'

// Types matching mock hooks interface
export interface TabWithItems extends Tab {
  tab_items: (TabItem & { product?: Product })[]
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface GroupWithTab extends Group {
  tab?: Tab
  itemCount: number
}

const supabase = createClient()

// Seller hooks
export function useVerifyPin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (pin: string): Promise<Seller | null> => {
    setLoading(true)
    setError(null)

    const pinHash = `hashed_${pin}`
    const { data, error: err } = await supabase
      .from('golf_sellers')
      .select('*')
      .eq('pin_hash', pinHash)
      .eq('is_active', true)
      .single()

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

// Groups hooks
export function useActiveGroups() {
  const [groups, setGroups] = useState<GroupWithTab[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data: groupsData } = await supabase
      .from('golf_groups')
      .select(`
        *,
        golf_tabs (*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (groupsData) {
      const enriched = await Promise.all(
        groupsData.map(async (g) => {
          const tab = g.golf_tabs?.[0]
          let itemCount = 0
          if (tab) {
            const { count } = await supabase
              .from('golf_tab_items')
              .select('*', { count: 'exact', head: true })
              .eq('tab_id', tab.id)
            itemCount = count || 0
          }
          return {
            id: g.id,
            name: g.name,
            client_code: g.client_code,
            status: g.status,
            created_at: g.created_at,
            created_by: g.created_by,
            tab: tab ? {
              id: tab.id,
              group_id: tab.group_id,
              status: tab.status,
              total: tab.total,
              paid_at: tab.paid_at,
              created_at: tab.created_at
            } : undefined,
            itemCount
          }
        })
      )
      setGroups(enriched)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { groups, loading, refresh }
}

export function useCreateGroup() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (name: string, sellerId?: string): Promise<Group> => {
    setLoading(true)

    // Generate 6-digit client code
    const clientCode = Math.floor(100000 + Math.random() * 900000).toString()

    const { data: group, error } = await supabase
      .from('golf_groups')
      .insert({
        name,
        client_code: clientCode,
        status: 'active',
        created_by: sellerId || null
      })
      .select()
      .single()

    if (error) throw error

    // Create tab for group
    await supabase
      .from('golf_tabs')
      .insert({
        group_id: group.id,
        status: 'open',
        total: 0
      })

    setLoading(false)
    return group as Group
  }, [])

  return { create, loading }
}

export function useGroupByCode(code: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [tab, setTab] = useState<TabWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code || code.length !== 6) {
      setLoading(false)
      return
    }

    const fetchGroup = async () => {
      const { data: g, error: err } = await supabase
        .from('golf_groups')
        .select('*')
        .eq('client_code', code)
        .single()

      if (err || !g) {
        setError('Group not found')
        setLoading(false)
        return
      }

      setGroup(g as Group)

      // Get tab with items
      const { data: tabData } = await supabase
        .from('golf_tabs')
        .select(`
          *,
          golf_tab_items (
            *,
            golf_products (*)
          )
        `)
        .eq('group_id', g.id)
        .single()

      if (tabData) {
        const tabWithItems: TabWithItems = {
          id: tabData.id,
          group_id: tabData.group_id,
          status: tabData.status,
          total: tabData.total,
          paid_at: tabData.paid_at,
          created_at: tabData.created_at,
          tab_items: tabData.golf_tab_items?.map((item: TabItem & { golf_products: Product }) => ({
            id: item.id,
            tab_id: item.tab_id,
            product_id: item.product_id,
            seller_id: item.seller_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            created_at: item.created_at,
            product: item.golf_products
          })) || []
        }
        setTab(tabWithItems)
      }

      setError(null)
      setLoading(false)
    }

    fetchGroup()
  }, [code])

  return { group, tab, loading, error }
}

// Categories & Products hooks
export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('golf_categories')
        .select(`
          *,
          golf_products (*)
        `)
        .eq('is_visible', true)
        .order('sort_order')

      if (data) {
        const formatted = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          sort_order: cat.sort_order,
          is_visible: cat.is_visible,
          created_at: cat.created_at,
          products: (cat.golf_products || [])
            .filter((p: Product) => p.is_active)
            .sort((a: Product, b: Product) => a.sort_order - b.sort_order)
        }))
        setCategories(formatted)
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return { categories, loading }
}

// Tab hooks
export function useTab(groupId: string) {
  const [tab, setTab] = useState<TabWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data: tabData } = await supabase
      .from('golf_tabs')
      .select(`
        *,
        golf_tab_items (
          *,
          golf_products (*)
        )
      `)
      .eq('group_id', groupId)
      .single()

    if (tabData) {
      const tabWithItems: TabWithItems = {
        id: tabData.id,
        group_id: tabData.group_id,
        status: tabData.status,
        total: tabData.total,
        paid_at: tabData.paid_at,
        created_at: tabData.created_at,
        tab_items: tabData.golf_tab_items?.map((item: TabItem & { golf_products: Product }) => ({
          id: item.id,
          tab_id: item.tab_id,
          product_id: item.product_id,
          seller_id: item.seller_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          product: item.golf_products
        })) || []
      }
      setTab(tabWithItems)
    }
    setLoading(false)
  }, [groupId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, sellerId: string) => {
    if (!tab) return null

    // Get product price
    const { data: product } = await supabase
      .from('golf_products')
      .select('price')
      .eq('id', productId)
      .single()

    if (!product) return null

    const { data: item, error } = await supabase
      .from('golf_tab_items')
      .insert({
        tab_id: tab.id,
        product_id: productId,
        seller_id: sellerId,
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
    await supabase
      .from('golf_tab_items')
      .delete()
      .eq('id', itemId)

    refresh()
  }, [refresh])

  const markPaid = useCallback(async () => {
    if (!tab) return false

    const { error } = await supabase
      .from('golf_tabs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', tab.id)

    // Also close the group
    await supabase
      .from('golf_groups')
      .update({ status: 'closed' })
      .eq('id', tab.group_id)

    refresh()
    return !error
  }, [tab, refresh])

  return { tab, loading, refresh, addItem, removeItem, markPaid }
}

// Admin hooks
export function useDashboardStats() {
  const [stats, setStats] = useState({ totalSales: 0, activeGroups: 0, itemsSold: 0 })
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; itemsSold: number; totalSales: number }[]>([])
  const [activity, setActivity] = useState<{ id: string; productName: string; quantity: number; total: number; sellerName: string; groupName: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    // Get active groups count
    const { count: activeGroups } = await supabase
      .from('golf_groups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total sales from ALL tabs (both open and paid)
    const { data: allTabs } = await supabase
      .from('golf_tabs')
      .select('total')

    const totalSales = allTabs?.reduce((sum, t) => sum + Number(t.total), 0) || 0

    // Get items sold count
    const { count: itemsSold } = await supabase
      .from('golf_tab_items')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalSales,
      activeGroups: activeGroups || 0,
      itemsSold: itemsSold || 0
    })

    // Get seller leaderboard
    const { data: sellers } = await supabase
      .from('golf_sellers')
      .select('id, name')
      .eq('is_active', true)

    if (sellers) {
      const sellerStats = await Promise.all(
        sellers.map(async (seller) => {
          const { data: items } = await supabase
            .from('golf_tab_items')
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

    // Get recent activity
    const { data: recentItems } = await supabase
      .from('golf_tab_items')
      .select(`
        id,
        quantity,
        unit_price,
        created_at,
        golf_products (name),
        golf_sellers (name),
        golf_tabs (golf_groups (name))
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentItems) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activityData = recentItems.map((item: any) => ({
        id: item.id,
        productName: item.golf_products?.name || 'Unknown',
        quantity: item.quantity,
        total: item.quantity * Number(item.unit_price),
        sellerName: item.golf_sellers?.name || 'Unknown',
        groupName: item.golf_tabs?.golf_groups?.name || 'Unknown',
        createdAt: item.created_at
      }))
      setActivity(activityData)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, leaderboard, activity, loading, refresh }
}

export function useAllGroups() {
  const [groups, setGroups] = useState<(Group & { total: number })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('golf_groups')
      .select(`
        *,
        golf_tabs (total)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupsWithTotal = data.map((g: any) => ({
        ...g,
        total: g.golf_tabs?.[0]?.total || 0
      }))
      setGroups(groupsWithTotal)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { groups, loading, refresh }
}

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data: productsData } = await supabase
      .from('golf_products')
      .select('*')
      .order('sort_order')

    const { data: categoriesData } = await supabase
      .from('golf_categories')
      .select('*')
      .order('sort_order')

    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createProduct = useCallback(async (data: { name: string; price: number; category_id: string }) => {
    const { data: product, error } = await supabase
      .from('golf_products')
      .insert({
        ...data,
        is_active: true,
        sort_order: 0
      })
      .select()
      .single()

    if (error) throw error
    refresh()
    return product
  }, [refresh])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const { data: product, error } = await supabase
      .from('golf_products')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    refresh()
    return product
  }, [refresh])

  const deleteProduct = useCallback(async (id: string) => {
    await supabase
      .from('golf_products')
      .delete()
      .eq('id', id)

    refresh()
  }, [refresh])

  const createCategory = useCallback(async (name: string) => {
    const { data: category, error } = await supabase
      .from('golf_categories')
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

export function useAllSellers() {
  const [sellers, setSellers] = useState<(Seller & { totalSales: number; itemsSold: number })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data: sellersData } = await supabase
      .from('golf_sellers')
      .select('*')
      .order('created_at', { ascending: false })

    if (sellersData) {
      const sellersWithStats = await Promise.all(
        sellersData.map(async (seller) => {
          const { data: items } = await supabase
            .from('golf_tab_items')
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
    const { data: seller, error } = await supabase
      .from('golf_sellers')
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
    const { data: seller, error } = await supabase
      .from('golf_sellers')
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
