// Database types matching Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: Seller
        Insert: SellerInsert
        Update: SellerUpdate
      }
      groups: {
        Row: Group
        Insert: GroupInsert
        Update: GroupUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
      }
      tabs: {
        Row: Tab
        Insert: TabInsert
        Update: TabUpdate
      }
      tab_items: {
        Row: TabItem
        Insert: TabItemInsert
        Update: TabItemUpdate
      }
    }
  }
}

// Seller types
export interface Seller {
  id: string
  name: string
  pin_hash: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export type SellerInsert = Omit<Seller, 'id' | 'created_at'>
export type SellerUpdate = Partial<SellerInsert>

// Group types
export interface Group {
  id: string
  name: string
  client_code: string
  status: 'active' | 'closed'
  created_at: string
  created_by: string | null
}

export type GroupInsert = Omit<Group, 'id' | 'created_at'>
export type GroupUpdate = Partial<GroupInsert>

// Category types
export interface Category {
  id: string
  name: string
  sort_order: number
  is_visible: boolean
  created_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// Product types
export interface Product {
  id: string
  category_id: string
  name: string
  price: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductUpdate = Partial<ProductInsert>

// Tab types
export interface Tab {
  id: string
  group_id: string
  status: 'open' | 'paid'
  total: number
  paid_at: string | null
  created_at: string
}

export type TabInsert = Omit<Tab, 'id' | 'created_at'>
export type TabUpdate = Partial<TabInsert>

// TabItem types
export interface TabItem {
  id: string
  tab_id: string
  product_id: string
  quantity: number
  unit_price: number
  seller_id: string
  created_at: string
}

export type TabItemInsert = Omit<TabItem, 'id' | 'created_at'>
export type TabItemUpdate = Partial<TabItemInsert>

// Extended types with relations
export interface TabWithItems extends Tab {
  tab_items: (TabItem & {
    product: Product
  })[]
}

export interface ProductWithCategory extends Product {
  category: Category
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface GroupWithCategories extends Group {
  categories: (Category & {
    products: Product[]
  })[]
}
