'use client'

import { create } from 'zustand'
import { RestaurantTable, RestaurantCategory, RestaurantProduct } from '@/config/restaurants/types'

// Demo table with tab info
export interface DemoTable extends RestaurantTable {
  status: 'available' | 'occupied' | 'reserved'
  current_tab?: DemoTab | null
}

export interface DemoTab {
  id: string
  table_id: string
  type: 'regular' | 'prepaid'
  status: 'open' | 'paid'
  total: number
  items: DemoTabItem[]
  created_at: string
}

export interface DemoTabItem {
  id: string
  product: RestaurantProduct
  quantity: number
  unit_price: number
  created_at: string
}

export interface DemoOrder {
  id: string
  tab_id: string
  table_number: string
  status: 'pending' | 'preparing' | 'ready' | 'served'
  items: DemoOrderItem[]
  created_at: string
}

export interface DemoOrderItem {
  id: string
  product: RestaurantProduct
  quantity: number
  notes?: string
}

// Generate unique ID
function generateId(): string {
  return 'demo-' + Math.random().toString(36).substr(2, 9)
}

interface DemoStoreState {
  // Restaurant slug for the current demo
  restaurantSlug: string | null

  // Tables state
  tables: DemoTable[]

  // Orders state
  orders: DemoOrder[]

  // Actions
  initializeRestaurant: (slug: string, tables: RestaurantTable[]) => void
  getTableByQR: (qrCode: string) => DemoTable | undefined
  openTab: (tableId: string, type: 'regular' | 'prepaid', sellerId: string) => DemoTab
  addToTab: (tabId: string, product: RestaurantProduct, quantity: number) => void
  closeTab: (tabId: string) => void

  // Order actions
  createOrder: (tabId: string, tableNumber: string, items: { product: RestaurantProduct; quantity: number; notes?: string }[]) => DemoOrder
  updateOrderStatus: (orderId: string, status: DemoOrder['status']) => void

  // Reset demo
  resetDemo: (slug: string, tables: RestaurantTable[]) => void
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  restaurantSlug: null,
  tables: [],
  orders: [],

  initializeRestaurant: (slug, tables) => {
    const currentSlug = get().restaurantSlug
    if (currentSlug === slug) return // Already initialized

    set({
      restaurantSlug: slug,
      tables: tables.map(t => ({
        ...t,
        status: 'available' as const,
        current_tab: null,
      })),
      orders: [],
    })
  },

  getTableByQR: (qrCode) => {
    return get().tables.find(t => t.qr_code === qrCode)
  },

  openTab: (tableId, type, _sellerId) => {
    const newTab: DemoTab = {
      id: generateId(),
      table_id: tableId,
      type,
      status: 'open',
      total: 0,
      items: [],
      created_at: new Date().toISOString(),
    }

    set(state => ({
      tables: state.tables.map(t =>
        t.id === tableId
          ? { ...t, status: 'occupied' as const, current_tab: newTab }
          : t
      ),
    }))

    return newTab
  },

  addToTab: (tabId, product, quantity) => {
    set(state => ({
      tables: state.tables.map(t => {
        if (t.current_tab?.id !== tabId) return t

        const newItem: DemoTabItem = {
          id: generateId(),
          product,
          quantity,
          unit_price: product.price,
          created_at: new Date().toISOString(),
        }

        const updatedItems = [...t.current_tab.items, newItem]
        const newTotal = updatedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

        return {
          ...t,
          current_tab: {
            ...t.current_tab,
            items: updatedItems,
            total: newTotal,
          },
        }
      }),
    }))
  },

  closeTab: (tabId) => {
    set(state => ({
      tables: state.tables.map(t => {
        if (t.current_tab?.id !== tabId) return t
        return {
          ...t,
          status: 'available' as const,
          current_tab: null,
        }
      }),
    }))
  },

  createOrder: (tabId, tableNumber, items) => {
    const newOrder: DemoOrder = {
      id: generateId(),
      tab_id: tabId,
      table_number: tableNumber,
      status: 'pending',
      items: items.map(item => ({
        id: generateId(),
        product: item.product,
        quantity: item.quantity,
        notes: item.notes,
      })),
      created_at: new Date().toISOString(),
    }

    set(state => ({
      orders: [...state.orders, newOrder],
    }))

    return newOrder
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: status === 'served'
        ? state.orders.filter(o => o.id !== orderId)
        : state.orders.map(o =>
            o.id === orderId ? { ...o, status } : o
          ),
    }))
  },

  resetDemo: (slug, tables) => {
    set({
      restaurantSlug: slug,
      tables: tables.map(t => ({
        ...t,
        status: 'available' as const,
        current_tab: null,
      })),
      orders: [],
    })
  },
}))
