// Mock data store using localStorage for demo purposes
// This allows the app to work fully without Supabase

import type { Seller, Table, Category, Product, Tab, TabItem } from '@/types'

const STORAGE_KEY = 'cafetab_mock_data'

// Types for our mock store
export interface MockStore {
  sellers: Seller[]
  tables: Table[]
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

// Generate a QR code
function generateQRCode(): string {
  return `CT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

// Hash a PIN (simple mock hash)
function hashPin(pin: string): string {
  return pin // In real app, this would be hashed
}

// Initial demo data
function getInitialData(): MockStore {
  const now = new Date().toISOString()

  // Sellers
  const sellers: Seller[] = [
    { id: generateId(), name: 'Admin', pin_hash: hashPin('0000'), avatar_url: null, is_active: true, created_at: now },
    { id: generateId(), name: 'Server 1', pin_hash: hashPin('1111'), avatar_url: null, is_active: true, created_at: now },
    { id: generateId(), name: 'Server 2', pin_hash: hashPin('2222'), avatar_url: null, is_active: true, created_at: now },
  ]

  // Tables
  const tables: Table[] = [
    { id: generateId(), number: '1', qr_code: generateQRCode(), status: 'available', section: 'Main', current_tab_id: null, created_at: now },
    { id: generateId(), number: '2', qr_code: generateQRCode(), status: 'available', section: 'Main', current_tab_id: null, created_at: now },
    { id: generateId(), number: '3', qr_code: generateQRCode(), status: 'available', section: 'Main', current_tab_id: null, created_at: now },
    { id: generateId(), number: 'B1', qr_code: generateQRCode(), status: 'available', section: 'Bar', current_tab_id: null, created_at: now },
    { id: generateId(), number: 'P1', qr_code: generateQRCode(), status: 'available', section: 'Patio', current_tab_id: null, created_at: now },
  ]

  // Categories
  const categories: Category[] = [
    { id: generateId(), name: 'Appetizers', sort_order: 0, is_visible: true, created_at: now },
    { id: generateId(), name: 'Main Course', sort_order: 1, is_visible: true, created_at: now },
    { id: generateId(), name: 'Drinks', sort_order: 2, is_visible: true, created_at: now },
    { id: generateId(), name: 'Desserts', sort_order: 3, is_visible: true, created_at: now },
  ]

  // Products
  const products: Product[] = [
    { id: generateId(), category_id: categories[0].id, name: 'Spring Rolls', price: 8.00, description: 'Crispy vegetable spring rolls', notes: null, image_url: null, is_active: true, sort_order: 0, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[0].id, name: 'Soup of the Day', price: 6.00, description: 'Ask server for today\'s selection', notes: null, image_url: null, is_active: true, sort_order: 1, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[1].id, name: 'Grilled Chicken', price: 18.00, description: 'With seasonal vegetables', notes: null, image_url: null, is_active: true, sort_order: 0, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[1].id, name: 'Fish & Chips', price: 16.00, description: 'Beer-battered cod with fries', notes: null, image_url: null, is_active: true, sort_order: 1, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Beer', price: 5.00, description: 'Draft beer', notes: null, image_url: null, is_active: true, sort_order: 0, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Wine', price: 8.00, description: 'House wine', notes: null, image_url: null, is_active: true, sort_order: 1, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[2].id, name: 'Soft Drink', price: 3.00, description: 'Coke, Sprite, or Fanta', notes: null, image_url: null, is_active: true, sort_order: 2, price_type: 'fixed', created_at: now },
    { id: generateId(), category_id: categories[3].id, name: 'Tiramisu', price: 7.00, description: 'Classic Italian dessert', notes: null, image_url: null, is_active: true, sort_order: 0, price_type: 'fixed', created_at: now },
  ]

  return {
    sellers,
    tables,
    categories,
    products,
    tabs: [],
    tabItems: [],
    initialized: true,
  }
}

// Get store from localStorage or initialize
export function getMockStore(): MockStore {
  if (typeof window === 'undefined') {
    return getInitialData()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.initialized) {
        return parsed
      }
    } catch {
      // Invalid JSON, reinitialize
    }
  }

  const initial = getInitialData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

// Save store to localStorage
export function saveMockStore(store: MockStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Reset store to initial data
export function resetMockStore(): MockStore {
  const initial = getInitialData()
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  }
  return initial
}

// Helper to generate IDs for new items
export { generateId, generateQRCode }
