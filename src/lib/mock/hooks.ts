'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMockStore, saveMockStore, generateId, resetMockStore } from './data'
import type { Seller, Tab, TabItem, Product, Category, Table } from '@/types'

// Types
export interface TabWithItems extends Tab {
  tab_items: (TabItem & { product?: Product })[]
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface TableWithTab extends Table {
  tab?: Tab
  itemCount: number
}

// Verify PIN
function verifyMockPin(pin: string): Seller | null {
  const store = getMockStore()
  return store.sellers.find(s => s.pin_hash === pin && s.is_active) || null
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

// Tables hooks
export function useActiveTables() {
  const [tables, setTables] = useState<TableWithTab[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const store = getMockStore()
    const tablesWithTabs = store.tables.map(table => {
      const tab = store.tabs.find(t => t.table_id === table.id && t.status === 'open')
      const itemCount = tab ? store.tabItems.filter(ti => ti.tab_id === tab.id).length : 0
      return { ...table, tab, itemCount }
    })
    setTables(tablesWithTabs)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { tables, loading, refresh }
}

export function useCreateTab() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (
    tableId: string,
    sellerId?: string,
    type: 'regular' | 'prepaid' = 'regular',
    prepaidAmount: number = 0
  ): Promise<Tab> => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 200))

    const store = getMockStore()
    const now = new Date().toISOString()

    const tab: Tab = {
      id: generateId(),
      table_id: tableId,
      type,
      status: 'open',
      total: 0,
      prepaid_amount: type === 'prepaid' ? prepaidAmount : 0,
      balance: type === 'prepaid' ? prepaidAmount : 0,
      tip: 0,
      paid_at: null,
      created_by: sellerId || null,
      created_at: now,
    }

    store.tabs.push(tab)

    // Update table to occupied
    const tableIdx = store.tables.findIndex(t => t.id === tableId)
    if (tableIdx !== -1) {
      store.tables[tableIdx].status = 'occupied'
      store.tables[tableIdx].current_tab_id = tab.id
    }

    saveMockStore(store)
    setLoading(false)
    return tab
  }, [])

  return { create, loading }
}

export function useTableByQRCode(qrCode: string) {
  const [table, setTable] = useState<Table | null>(null)
  const [tab, setTab] = useState<TabWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!qrCode) {
      setLoading(false)
      return
    }

    const store = getMockStore()
    const t = store.tables.find(tbl => tbl.qr_code === qrCode)

    if (t) {
      setTable(t)

      if (t.current_tab_id) {
        const tabData = store.tabs.find(tb => tb.id === t.current_tab_id)
        if (tabData) {
          const items = store.tabItems.filter(ti => ti.tab_id === tabData.id)
          setTab({
            ...tabData,
            tab_items: items.map(item => ({
              ...item,
              product: store.products.find(p => p.id === item.product_id)
            }))
          })
        }
      }
      setError(null)
    } else {
      setError('Table not found')
    }
    setLoading(false)
  }, [qrCode])

  return { table, tab, loading, error }
}

// Products hooks
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const store = getMockStore()
    setProducts(store.products.filter(p => p.is_active))
    setLoading(false)
  }, [])

  return { products, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const store = getMockStore()
    setCategories(store.categories.filter(c => c.is_visible))
    setLoading(false)
  }, [])

  return { categories, loading }
}

export function useCategoriesWithProducts() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const store = getMockStore()
    const cats = store.categories
      .filter(c => c.is_visible)
      .map(cat => ({
        ...cat,
        products: store.products.filter(p => p.category_id === cat.id && p.is_active)
      }))
    setCategories(cats)
    setLoading(false)
  }, [])

  return { categories, loading }
}

// Tab hooks
export function useTab(tabId: string) {
  const [tab, setTab] = useState<TabWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!tabId) return

    const store = getMockStore()
    const t = store.tabs.find(tb => tb.id === tabId)

    if (t) {
      const items = store.tabItems.filter(ti => ti.tab_id === tabId)
      setTab({
        ...t,
        tab_items: items.map(item => ({
          ...item,
          product: store.products.find(p => p.id === item.product_id)
        }))
      })
    }
    setLoading(false)
  }, [tabId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, sellerId?: string) => {
    const store = getMockStore()
    const product = store.products.find(p => p.id === productId)
    if (!product) return

    const now = new Date().toISOString()
    const item: TabItem = {
      id: generateId(),
      tab_id: tabId,
      product_id: productId,
      seller_id: sellerId || null,
      order_id: null,
      quantity,
      unit_price: product.price,
      created_at: now,
    }

    store.tabItems.push(item)

    // Update tab total
    const tabIdx = store.tabs.findIndex(t => t.id === tabId)
    if (tabIdx !== -1) {
      const total = store.tabItems
        .filter(ti => ti.tab_id === tabId)
        .reduce((sum, ti) => sum + ti.quantity * ti.unit_price, 0)
      store.tabs[tabIdx].total = total
    }

    saveMockStore(store)
    refresh()
  }, [tabId, refresh])

  const closeTab = useCallback(async () => {
    const store = getMockStore()
    const tabIdx = store.tabs.findIndex(t => t.id === tabId)

    if (tabIdx !== -1) {
      store.tabs[tabIdx].status = 'paid'
      store.tabs[tabIdx].paid_at = new Date().toISOString()

      // Update table to available
      const tableIdx = store.tables.findIndex(t => t.current_tab_id === tabId)
      if (tableIdx !== -1) {
        store.tables[tableIdx].status = 'available'
        store.tables[tableIdx].current_tab_id = null
      }

      saveMockStore(store)
      refresh()
    }
  }, [tabId, refresh])

  return { tab, loading, refresh, addItem, closeTab }
}

// Reset hook
export function useResetMockData() {
  return useCallback(() => {
    resetMockStore()
    window.location.reload()
  }, [])
}
