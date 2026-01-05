'use client'

import { useState, useEffect, useCallback } from 'react'
import { mockDb, verifyMockPin, resetMockStore } from './data'
import type { Seller, Group, Tab, TabItem, Product, Category } from '@/types'

// Types
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

// Seller hooks
export function useVerifyPin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (pin: string): Promise<Seller | null> => {
    setLoading(true)
    setError(null)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 300))

    const seller = verifyMockPin(pin)
    if (!seller) {
      setError('Invalid PIN')
    }

    setLoading(false)
    return seller
  }, [])

  return { verify, loading, error }
}

// Groups hooks
export function useActiveGroups() {
  const [groups, setGroups] = useState<GroupWithTab[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const data = mockDb.getActiveGroups()
    setGroups(data)
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
    await new Promise(r => setTimeout(r, 200))
    const group = mockDb.createGroup(name, sellerId)
    setLoading(false)
    return group
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

    const g = mockDb.getGroupByCode(code)
    if (g) {
      setGroup(g)
      const t = mockDb.getTabByGroupId(g.id)
      setTab(t)
      setError(null)
    } else {
      setError('Group not found')
    }
    setLoading(false)
  }, [code])

  return { group, tab, loading, error }
}

// Categories & Products hooks
export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = mockDb.getCategories()
    setCategories(data)
    setLoading(false)
  }, [])

  return { categories, loading }
}

// Tab hooks
export function useTab(groupId: string) {
  const [tab, setTab] = useState<TabWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const data = mockDb.getTabByGroupId(groupId)
    setTab(data)
    setLoading(false)
  }, [groupId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, sellerId: string) => {
    if (!tab) return null
    await new Promise(r => setTimeout(r, 100))
    const item = mockDb.addItemToTab(tab.id, productId, quantity, sellerId)
    refresh()
    return item
  }, [tab, refresh])

  const removeItem = useCallback(async (itemId: string) => {
    await new Promise(r => setTimeout(r, 100))
    mockDb.removeItemFromTab(itemId)
    refresh()
  }, [refresh])

  const markPaid = useCallback(async () => {
    if (!tab) return false
    await new Promise(r => setTimeout(r, 200))
    const success = mockDb.markTabPaid(tab.id)
    refresh()
    return success
  }, [tab, refresh])

  return { tab, loading, refresh, addItem, removeItem, markPaid }
}

// Admin hooks
export function useDashboardStats() {
  const [stats, setStats] = useState({ totalSales: 0, activeGroups: 0, itemsSold: 0 })
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; itemsSold: number; totalSales: number }[]>([])
  const [activity, setActivity] = useState<{ id: string; productName: string; quantity: number; total: number; sellerName: string; groupName: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setStats(mockDb.getDashboardStats())
    setLeaderboard(mockDb.getSellerLeaderboard())
    setActivity(mockDb.getRecentActivity())
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

  const refresh = useCallback(() => {
    setGroups(mockDb.getAllGroups())
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

  const refresh = useCallback(() => {
    setProducts(mockDb.getAllProducts())
    setCategories(mockDb.getAllCategories())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createProduct = useCallback(async (data: { name: string; price: number; category_id: string }) => {
    await new Promise(r => setTimeout(r, 150))
    const product = mockDb.createProduct(data)
    refresh()
    return product
  }, [refresh])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    await new Promise(r => setTimeout(r, 150))
    const product = mockDb.updateProduct(id, data)
    refresh()
    return product
  }, [refresh])

  const deleteProduct = useCallback(async (id: string) => {
    await new Promise(r => setTimeout(r, 150))
    mockDb.deleteProduct(id)
    refresh()
  }, [refresh])

  const createCategory = useCallback(async (name: string) => {
    await new Promise(r => setTimeout(r, 150))
    const category = mockDb.createCategory(name)
    refresh()
    return category
  }, [refresh])

  return { products, categories, loading, refresh, createProduct, updateProduct, deleteProduct, createCategory }
}

export function useAllSellers() {
  const [sellers, setSellers] = useState<(Seller & { totalSales: number; itemsSold: number })[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const allSellers = mockDb.getAllSellers()
    const leaderboard = mockDb.getSellerLeaderboard()

    // Merge sellers with their stats from leaderboard
    const sellersWithStats = allSellers.map(seller => {
      const stats = leaderboard.find(l => l.id === seller.id)
      return {
        ...seller,
        totalSales: stats?.totalSales || 0,
        itemsSold: stats?.itemsSold || 0,
      }
    })

    setSellers(sellersWithStats)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createSeller = useCallback(async (name: string, pin: string) => {
    await new Promise(r => setTimeout(r, 150))
    const seller = mockDb.createSeller(name, pin)
    refresh()
    return seller
  }, [refresh])

  const updateSeller = useCallback(async (id: string, data: Partial<Seller>) => {
    await new Promise(r => setTimeout(r, 150))
    const seller = mockDb.updateSeller(id, data)
    refresh()
    return seller
  }, [refresh])

  return { sellers, loading, refresh, createSeller, updateSeller }
}

// Reset hook for demo
export function useResetDemo() {
  const reset = useCallback(() => {
    resetMockStore()
    window.location.reload()
  }, [])

  return { reset }
}
