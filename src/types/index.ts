// CafeTab Database Types
// All tables use cafe_ prefix in Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// SELLER TYPES
// ============================================
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

// ============================================
// CATEGORY TYPES
// ============================================
export interface Category {
  id: string
  name: string
  sort_order: number
  is_visible: boolean
  created_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// ============================================
// PRODUCT TYPES
// ============================================
export interface Product {
  id: string
  category_id: string
  name: string
  price: number
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductUpdate = Partial<ProductInsert>

// ============================================
// TABLE TYPES (NEW - replaces Groups)
// ============================================
export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface Table {
  id: string
  number: string
  qr_code: string
  status: TableStatus
  section: string | null
  current_tab_id: string | null
  created_at: string
}

export type TableInsert = Omit<Table, 'id' | 'created_at' | 'qr_code'> & { qr_code?: string }
export type TableUpdate = Partial<TableInsert>

// ============================================
// TAB TYPES (Enhanced with prepaid)
// ============================================
export type TabType = 'regular' | 'prepaid'
export type TabStatus = 'open' | 'paid' | 'refund_pending'

export interface Tab {
  id: string
  table_id: string
  type: TabType
  status: TabStatus
  total: number
  prepaid_amount: number
  balance: number
  tip: number
  paid_at: string | null
  created_by: string | null
  created_at: string
}

export type TabInsert = Omit<Tab, 'id' | 'created_at' | 'total' | 'balance'> & {
  total?: number
  balance?: number
}
export type TabUpdate = Partial<Omit<TabInsert, 'table_id'>>

// ============================================
// ORDER TYPES (NEW - for kitchen flow)
// ============================================
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'

export interface Order {
  id: string
  tab_id: string
  status: OrderStatus
  notes: string | null
  created_at: string
  prepared_at: string | null
  served_at: string | null
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'prepared_at' | 'served_at'>
export type OrderUpdate = Partial<OrderInsert>

// ============================================
// ORDER ITEM TYPES (NEW)
// ============================================
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  notes: string | null
  created_at: string
}

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>
export type OrderItemUpdate = Partial<OrderItemInsert>

// ============================================
// TAB ITEM TYPES
// ============================================
export interface TabItem {
  id: string
  tab_id: string
  product_id: string
  seller_id: string | null
  order_id: string | null
  quantity: number
  unit_price: number
  created_at: string
}

export type TabItemInsert = Omit<TabItem, 'id' | 'created_at'>
export type TabItemUpdate = Partial<TabItemInsert>

// ============================================
// NOTIFICATION TYPES (NEW)
// ============================================
export type NotificationType = 'order' | 'bill_request' | 'server_call' | 'payment' | 'refund_request' | 'low_balance'

export interface Notification {
  id: string
  type: NotificationType
  table_id: string
  seller_id: string | null
  message: string
  read: boolean
  created_at: string
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>
export type NotificationUpdate = Partial<NotificationInsert>

// ============================================
// TRANSACTION TYPES (NEW)
// ============================================
export type TransactionType = 'load' | 'spend' | 'refund' | 'tip' | 'payment'

export interface Transaction {
  id: string
  tab_id: string
  type: TransactionType
  amount: number
  payment_method: string | null
  processed_by: string | null
  notes: string | null
  created_at: string
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>
export type TransactionUpdate = Partial<TransactionInsert>

// ============================================
// VENUE SETTINGS TYPES (NEW)
// ============================================
export interface VenueSettings {
  id: string
  client_can_order: boolean
  client_can_pay: boolean
  require_prepay: boolean
  notify_on_every_order: boolean
  default_tip_options: number[]
  created_at: string
  updated_at: string
}

export type VenueSettingsUpdate = Partial<Omit<VenueSettings, 'id' | 'created_at' | 'updated_at'>>

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export interface TableWithTab extends Table {
  current_tab?: Tab | null
}

export interface TabWithItems extends Tab {
  tab_items: (TabItem & {
    product: Product
  })[]
}

export interface TabWithTable extends Tab {
  table: Table
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: Product
  })[]
}

export interface ProductWithCategory extends Product {
  category: Category
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface NotificationWithTable extends Notification {
  table: Table
}

// ============================================
// DATABASE TYPE (for Supabase client)
// ============================================
export interface Database {
  public: {
    Tables: {
      cafe_sellers: {
        Row: Seller
        Insert: SellerInsert
        Update: SellerUpdate
      }
      cafe_categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      cafe_products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
      }
      cafe_tables: {
        Row: Table
        Insert: TableInsert
        Update: TableUpdate
      }
      cafe_tabs: {
        Row: Tab
        Insert: TabInsert
        Update: TabUpdate
      }
      cafe_tab_items: {
        Row: TabItem
        Insert: TabItemInsert
        Update: TabItemUpdate
      }
      cafe_orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      cafe_order_items: {
        Row: OrderItem
        Insert: OrderItemInsert
        Update: OrderItemUpdate
      }
      cafe_notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      cafe_transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      cafe_venue_settings: {
        Row: VenueSettings
        Insert: Omit<VenueSettings, 'id' | 'created_at' | 'updated_at'>
        Update: VenueSettingsUpdate
      }
    }
  }
}
