// Mock data store using localStorage for demo purposes
// This allows the app to work fully without Supabase

import type { Seller, Group, Category, Product, Tab, TabItem } from '@/types'

const STORAGE_KEY = 'golftab_mock_data'

// Types for our mock store
export interface MockStore {
  sellers: Seller[]
  groups: Group[]
  categories: Category[]
  products: Product[]
  tabs: Tab[]
  tabItems: (TabItem & { product?: Product })[]
  initialized: boolean
}

// Generate a UUID-like ID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash a PIN (simple mock hash)
function hashPin(pin: string): string {
  return `hashed_${pin}`
}

// Initial demo data
function getInitialData(): MockStore {
  const now = new Date().toISOString()

  // Sellers
  const sellers: Seller[] = [
    { id: generateId(), name: 'Mike Johnson', pin_hash: hashPin('1234'), avatar_url: null, is_active: true, created_at: now },
    { id: generateId(), name: 'Sarah Williams', pin_hash: hashPin('5678'), avatar_url: null, is_active: true, created_at: now },
    { id: generateId(), name: 'Tom Garcia', pin_hash: hashPin('0000'), avatar_url: null, is_active: true, created_at: now },
  ]

  // Categories
  const categories: Category[] = [
    { id: generateId(), name: 'Drinks', sort_order: 1, is_visible: true, created_at: now },
    { id: generateId(), name: 'Food', sort_order: 2, is_visible: true, created_at: now },
    { id: generateId(), name: 'Snacks', sort_order: 3, is_visible: true, created_at: now },
  ]

  // Products
  const products: Product[] = [
    // Drinks
    { id: generateId(), category_id: categories[0].id, name: 'Heineken', price: 5.00, image_url: null, is_active: true, sort_order: 1, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Corona', price: 6.00, image_url: null, is_active: true, sort_order: 2, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Craft IPA', price: 7.50, image_url: null, is_active: true, sort_order: 3, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Water', price: 2.00, image_url: null, is_active: true, sort_order: 4, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Gatorade', price: 3.50, image_url: null, is_active: true, sort_order: 5, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Soda', price: 2.50, image_url: null, is_active: true, sort_order: 6, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Iced Tea', price: 3.00, image_url: null, is_active: true, sort_order: 7, created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Red Bull', price: 4.50, image_url: null, is_active: true, sort_order: 8, created_at: now },
    // Food
    { id: generateId(), category_id: categories[1].id, name: 'Hot Dog', price: 4.50, image_url: null, is_active: true, sort_order: 1, created_at: now },
    { id: generateId(), category_id: categories[1].id, name: 'Burger', price: 8.00, image_url: null, is_active: true, sort_order: 2, created_at: now },
    { id: generateId(), category_id: categories[1].id, name: 'Club Sandwich', price: 9.50, image_url: null, is_active: true, sort_order: 3, created_at: now },
    { id: generateId(), category_id: categories[1].id, name: 'Chicken Wrap', price: 7.50, image_url: null, is_active: true, sort_order: 4, created_at: now },
    // Snacks
    { id: generateId(), category_id: categories[2].id, name: 'Chips', price: 2.00, image_url: null, is_active: true, sort_order: 1, created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Peanuts', price: 3.00, image_url: null, is_active: true, sort_order: 2, created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Candy Bar', price: 2.50, image_url: null, is_active: true, sort_order: 3, created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Trail Mix', price: 4.00, image_url: null, is_active: true, sort_order: 4, created_at: now },
  ]

  // Demo groups with tabs
  const group1Id = generateId()
  const group2Id = generateId()
  const group3Id = generateId()

  const groups: Group[] = [
    { id: group1Id, name: 'Morning Foursome', client_code: '847291', status: 'active', created_at: now, created_by: sellers[0].id },
    { id: group2Id, name: 'Smith Wedding Party', client_code: '123456', status: 'active', created_at: now, created_by: sellers[1].id },
    { id: group3Id, name: 'Corporate Outing', client_code: '555777', status: 'active', created_at: now, created_by: sellers[0].id },
  ]

  const tab1Id = generateId()
  const tab2Id = generateId()
  const tab3Id = generateId()

  const tabs: Tab[] = [
    { id: tab1Id, group_id: group1Id, status: 'open', total: 27.50, paid_at: null, created_at: now },
    { id: tab2Id, group_id: group2Id, status: 'open', total: 89.00, paid_at: null, created_at: now },
    { id: tab3Id, group_id: group3Id, status: 'open', total: 45.00, paid_at: null, created_at: now },
  ]

  // Tab items with product references
  const tabItems: (TabItem & { product?: Product })[] = [
    // Group 1 items
    { id: generateId(), tab_id: tab1Id, product_id: products[0].id, quantity: 3, unit_price: 5.00, seller_id: sellers[0].id, created_at: now, product: products[0] },
    { id: generateId(), tab_id: tab1Id, product_id: products[3].id, quantity: 2, unit_price: 2.00, seller_id: sellers[0].id, created_at: now, product: products[3] },
    { id: generateId(), tab_id: tab1Id, product_id: products[8].id, quantity: 1, unit_price: 4.50, seller_id: sellers[0].id, created_at: now, product: products[8] },
    // Group 2 items
    { id: generateId(), tab_id: tab2Id, product_id: products[1].id, quantity: 6, unit_price: 6.00, seller_id: sellers[1].id, created_at: now, product: products[1] },
    { id: generateId(), tab_id: tab2Id, product_id: products[9].id, quantity: 4, unit_price: 8.00, seller_id: sellers[1].id, created_at: now, product: products[9] },
    { id: generateId(), tab_id: tab2Id, product_id: products[12].id, quantity: 5, unit_price: 2.00, seller_id: sellers[1].id, created_at: now, product: products[12] },
    // Group 3 items
    { id: generateId(), tab_id: tab3Id, product_id: products[2].id, quantity: 4, unit_price: 7.50, seller_id: sellers[2].id, created_at: now, product: products[2] },
    { id: generateId(), tab_id: tab3Id, product_id: products[4].id, quantity: 4, unit_price: 3.50, seller_id: sellers[2].id, created_at: now, product: products[4] },
  ]

  return {
    sellers,
    groups,
    categories,
    products,
    tabs,
    tabItems,
    initialized: true,
  }
}

// Get mock store from localStorage or initialize
export function getMockStore(): MockStore {
  if (typeof window === 'undefined') {
    return getInitialData()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored) as MockStore
      if (data.initialized) {
        return data
      }
    } catch {
      // Invalid data, reinitialize
    }
  }

  const initial = getInitialData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

// Save mock store to localStorage
export function saveMockStore(store: MockStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Reset to initial demo data
export function resetMockStore(): MockStore {
  const initial = getInitialData()
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  }
  return initial
}

// Helper to verify PIN
export function verifyMockPin(pin: string): Seller | null {
  const store = getMockStore()
  const hash = hashPin(pin)
  return store.sellers.find(s => s.pin_hash === hash && s.is_active) || null
}

// CRUD Operations

export const mockDb = {
  // Sellers
  getSellers: () => getMockStore().sellers.filter(s => s.is_active),
  getSellerById: (id: string) => getMockStore().sellers.find(s => s.id === id) || null,

  // Groups
  getActiveGroups: () => {
    const store = getMockStore()
    return store.groups.filter(g => g.status === 'active').map(group => {
      const tab = store.tabs.find(t => t.group_id === group.id)
      const items = tab ? store.tabItems.filter(i => i.tab_id === tab.id) : []
      return { ...group, tab, itemCount: items.length }
    })
  },

  getGroupByCode: (code: string) => {
    const store = getMockStore()
    return store.groups.find(g => g.client_code === code) || null
  },

  getGroupById: (id: string) => {
    const store = getMockStore()
    return store.groups.find(g => g.id === id) || null
  },

  createGroup: (name: string, sellerId?: string) => {
    const store = getMockStore()
    const now = new Date().toISOString()
    const group: Group = {
      id: generateId(),
      name,
      client_code: generateCode(),
      status: 'active',
      created_at: now,
      created_by: sellerId || null,
    }
    const tab: Tab = {
      id: generateId(),
      group_id: group.id,
      status: 'open',
      total: 0,
      paid_at: null,
      created_at: now,
    }
    store.groups.push(group)
    store.tabs.push(tab)
    saveMockStore(store)
    return group
  },

  closeGroup: (groupId: string) => {
    const store = getMockStore()
    const group = store.groups.find(g => g.id === groupId)
    if (group) {
      group.status = 'closed'
      saveMockStore(store)
    }
    return !!group
  },

  // Categories & Products
  getCategories: () => {
    const store = getMockStore()
    return store.categories
      .filter(c => c.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(category => ({
        ...category,
        products: store.products
          .filter(p => p.category_id === category.id && p.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
      }))
  },

  getProducts: () => getMockStore().products.filter(p => p.is_active),

  // Tabs
  getTabByGroupId: (groupId: string) => {
    const store = getMockStore()
    const tab = store.tabs.find(t => t.group_id === groupId)
    if (!tab) return null
    const items = store.tabItems.filter(i => i.tab_id === tab.id)
    return { ...tab, tab_items: items }
  },

  addItemToTab: (tabId: string, productId: string, quantity: number, sellerId: string) => {
    const store = getMockStore()
    const tab = store.tabs.find(t => t.id === tabId)
    const product = store.products.find(p => p.id === productId)
    if (!tab || !product) return null

    // Check if item already exists
    const existingItem = store.tabItems.find(
      i => i.tab_id === tabId && i.product_id === productId
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      const newItem: TabItem & { product?: Product } = {
        id: generateId(),
        tab_id: tabId,
        product_id: productId,
        quantity,
        unit_price: product.price,
        seller_id: sellerId,
        created_at: new Date().toISOString(),
        product,
      }
      store.tabItems.push(newItem)
    }

    // Update tab total
    const tabItems = store.tabItems.filter(i => i.tab_id === tabId)
    tab.total = tabItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

    saveMockStore(store)
    return existingItem || store.tabItems[store.tabItems.length - 1]
  },

  removeItemFromTab: (itemId: string) => {
    const store = getMockStore()
    const itemIndex = store.tabItems.findIndex(i => i.id === itemId)
    if (itemIndex === -1) return false

    const item = store.tabItems[itemIndex]
    const tab = store.tabs.find(t => t.id === item.tab_id)

    store.tabItems.splice(itemIndex, 1)

    // Update tab total
    if (tab) {
      const tabItems = store.tabItems.filter(i => i.tab_id === tab.id)
      tab.total = tabItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
    }

    saveMockStore(store)
    return true
  },

  markTabPaid: (tabId: string) => {
    const store = getMockStore()
    const tab = store.tabs.find(t => t.id === tabId)
    if (!tab) return false

    tab.status = 'paid'
    tab.paid_at = new Date().toISOString()

    // Also close the group
    const group = store.groups.find(g => g.id === tab.group_id)
    if (group) {
      group.status = 'closed'
    }

    saveMockStore(store)
    return true
  },

  // Admin stats
  getDashboardStats: () => {
    const store = getMockStore()
    const today = new Date().toISOString().split('T')[0]

    const paidTabs = store.tabs.filter(t => t.status === 'paid')
    const totalSales = paidTabs.reduce((sum, t) => sum + t.total, 0)

    // Add open tabs too for demo
    const openTabs = store.tabs.filter(t => t.status === 'open')
    const openTotal = openTabs.reduce((sum, t) => sum + t.total, 0)

    const activeGroups = store.groups.filter(g => g.status === 'active').length
    const itemsSold = store.tabItems.reduce((sum, i) => sum + i.quantity, 0)

    return {
      totalSales: totalSales + openTotal,
      activeGroups,
      itemsSold,
    }
  },

  getSellerLeaderboard: () => {
    const store = getMockStore()

    return store.sellers
      .filter(s => s.is_active)
      .map(seller => {
        const sellerItems = store.tabItems.filter(i => i.seller_id === seller.id)
        const totalItems = sellerItems.reduce((sum, i) => sum + i.quantity, 0)
        const totalSales = sellerItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)

        return {
          id: seller.id,
          name: seller.name,
          itemsSold: totalItems,
          totalSales,
        }
      })
      .sort((a, b) => b.totalSales - a.totalSales)
  },

  getRecentActivity: () => {
    const store = getMockStore()

    return store.tabItems
      .slice(-10)
      .reverse()
      .map(item => {
        const seller = store.sellers.find(s => s.id === item.seller_id)
        const tab = store.tabs.find(t => t.id === item.tab_id)
        const group = tab ? store.groups.find(g => g.id === tab.group_id) : null

        return {
          id: item.id,
          productName: item.product?.name || 'Unknown',
          quantity: item.quantity,
          total: item.unit_price * item.quantity,
          sellerName: seller?.name || 'Unknown',
          groupName: group?.name || 'Unknown',
          createdAt: item.created_at,
        }
      })
  },

  // Products management
  createProduct: (data: { name: string; price: number; category_id: string }) => {
    const store = getMockStore()
    const product: Product = {
      id: generateId(),
      category_id: data.category_id,
      name: data.name,
      price: data.price,
      image_url: null,
      is_active: true,
      sort_order: store.products.length + 1,
      created_at: new Date().toISOString(),
    }
    store.products.push(product)
    saveMockStore(store)
    return product
  },

  updateProduct: (id: string, data: Partial<Product>) => {
    const store = getMockStore()
    const product = store.products.find(p => p.id === id)
    if (product) {
      Object.assign(product, data)
      saveMockStore(store)
    }
    return product
  },

  deleteProduct: (id: string) => {
    const store = getMockStore()
    const index = store.products.findIndex(p => p.id === id)
    if (index !== -1) {
      store.products.splice(index, 1)
      saveMockStore(store)
      return true
    }
    return false
  },

  // Sellers management
  createSeller: (name: string, pin: string) => {
    const store = getMockStore()
    const seller: Seller = {
      id: generateId(),
      name,
      pin_hash: hashPin(pin),
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    store.sellers.push(seller)
    saveMockStore(store)
    return seller
  },

  updateSeller: (id: string, data: Partial<Seller>) => {
    const store = getMockStore()
    const seller = store.sellers.find(s => s.id === id)
    if (seller) {
      Object.assign(seller, data)
      saveMockStore(store)
    }
    return seller
  },

  // Categories management
  createCategory: (name: string) => {
    const store = getMockStore()
    const category: Category = {
      id: generateId(),
      name,
      sort_order: store.categories.length + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
    }
    store.categories.push(category)
    saveMockStore(store)
    return category
  },

  getAllGroups: () => {
    const store = getMockStore()
    return store.groups.map(group => {
      const tab = store.tabs.find(t => t.group_id === group.id)
      return { ...group, total: tab?.total || 0 }
    })
  },

  getAllCategories: () => getMockStore().categories,

  getAllProducts: () => getMockStore().products,

  getAllSellers: () => getMockStore().sellers,
}

export { generateId, generateCode, hashPin }
