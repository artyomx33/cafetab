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
export type PriceType = 'fixed' | 'ask_server' | 'market'

export interface Product {
  id: string
  category_id: string
  name: string
  price: number
  description: string | null
  notes: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  price_type: PriceType
  prep_time: number // Expected prep time in minutes. Quick items <= 3
  created_at: string
  // Runtime field - computed when fetching categories
  has_modifiers?: boolean
}

export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductUpdate = Partial<ProductInsert>

// ============================================
// MODIFIER TYPES
// ============================================
export type ModifierGroupType = 'single' | 'multi'

export interface ModifierGroup {
  id: string
  name: string
  type: ModifierGroupType
  is_required: boolean
  min_select: number
  max_select: number | null
  sort_order: number
  created_at: string
}

export type ModifierGroupInsert = Omit<ModifierGroup, 'id' | 'created_at'>
export type ModifierGroupUpdate = Partial<ModifierGroupInsert>

export interface Modifier {
  id: string
  group_id: string
  name: string
  price_adjustment: number
  is_default: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export type ModifierInsert = Omit<Modifier, 'id' | 'created_at'>
export type ModifierUpdate = Partial<ModifierInsert>

export interface ProductModifierGroup {
  id: string
  product_id: string
  modifier_group_id: string
  sort_order: number
  created_at: string
}

export type ProductModifierGroupInsert = Omit<ProductModifierGroup, 'id' | 'created_at'>

export interface OrderItemModifier {
  id: string
  order_item_id: string
  modifier_id: string
  quantity: number
  price_adjustment: number
  created_at: string
}

export type OrderItemModifierInsert = Omit<OrderItemModifier, 'id' | 'created_at'>

export interface TabItemModifier {
  id: string
  tab_item_id: string
  modifier_id: string
  quantity: number
  price_adjustment: number
  created_at: string
}

export type TabItemModifierInsert = Omit<TabItemModifier, 'id' | 'created_at'>

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
  restaurant_id: string
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
export type ItemStatus = 'pending' | 'ready' | 'delivered'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  notes: string | null
  status: ItemStatus
  ready_at: string | null
  delivered_at: string | null
  created_at: string
}

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at' | 'ready_at' | 'delivered_at'>
export type OrderItemUpdate = Partial<Omit<OrderItem, 'id' | 'created_at'>>

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
  payment_method: 'card' | 'cash' | null
  processed_by: string | null
  notes: string | null
  tip_amount: number
  stripe_payment_id: string | null
  reference_transaction_id: string | null
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

// Modifier group with its options
export interface ModifierGroupWithModifiers extends ModifierGroup {
  modifiers: Modifier[]
}

// Product with all its modifier groups and options
export interface ProductWithModifiers extends Product {
  modifier_groups: ModifierGroupWithModifiers[]
}

// Order item with selected modifiers
export interface OrderItemWithModifiers extends OrderItem {
  product: Product
  modifiers: (OrderItemModifier & { modifier: Modifier })[]
}

// Tab item with selected modifiers
export interface TabItemWithModifiers extends TabItem {
  product: Product
  modifiers: (TabItemModifier & { modifier: Modifier })[]
}

// Full order with items and their modifiers
export interface OrderWithItemsAndModifiers extends Order {
  order_items: OrderItemWithModifiers[]
}

// Cart item for client ordering (before submission)
export interface CartItem {
  product: Product
  quantity: number
  selectedModifiers: SelectedModifier[]
  notes: string
  totalPrice: number
}

export interface SelectedModifier {
  modifier: Modifier
  quantity: number
}

export interface NotificationWithTable extends Notification {
  table: Table
}

// ============================================
// PROMOTION TYPES
// ============================================
export type PromotionType = 'percent_off' | 'buy_x_get_y'
export type PromotionScope = 'category' | 'items' | 'order'
export type PromotionScheduleType = 'always' | 'time_window' | 'day_of_week' | 'date_range'

export interface Promotion {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  type: PromotionType
  value: number // percentage (20 = 20%) or Y quantity for buy_x_get_y
  buy_quantity: number | null // X in "buy X get Y" (null for percent_off)
  scope: PromotionScope
  badge_text: string | null
  is_active: boolean
  created_at: string
}

export type PromotionInsert = Omit<Promotion, 'id' | 'created_at'>
export type PromotionUpdate = Partial<PromotionInsert>

export interface PromotionTarget {
  id: string
  promotion_id: string
  category_id: string | null
  product_id: string | null
  created_at: string
}

export type PromotionTargetInsert = Omit<PromotionTarget, 'id' | 'created_at'>

export interface PromotionSchedule {
  id: string
  promotion_id: string
  type: PromotionScheduleType
  days_of_week: number[] | null // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string | null // HH:MM format
  end_time: string | null
  start_date: string | null // YYYY-MM-DD format
  end_date: string | null
  created_at: string
}

export type PromotionScheduleInsert = Omit<PromotionSchedule, 'id' | 'created_at'>

// Promotion with targets and schedules
export interface PromotionWithDetails extends Promotion {
  targets: PromotionTarget[]
  schedules: PromotionSchedule[]
}

// Active promotion for a product (computed at runtime)
export interface ActivePromotion {
  id: string
  name: string
  type: PromotionType
  value: number
  buy_quantity: number | null
  badge_text: string | null
  discounted_price?: number // Pre-calculated discounted price
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
      cafe_modifier_groups: {
        Row: ModifierGroup
        Insert: ModifierGroupInsert
        Update: ModifierGroupUpdate
      }
      cafe_modifiers: {
        Row: Modifier
        Insert: ModifierInsert
        Update: ModifierUpdate
      }
      cafe_product_modifier_groups: {
        Row: ProductModifierGroup
        Insert: ProductModifierGroupInsert
        Update: Partial<ProductModifierGroupInsert>
      }
      cafe_order_item_modifiers: {
        Row: OrderItemModifier
        Insert: OrderItemModifierInsert
        Update: Partial<OrderItemModifierInsert>
      }
      cafe_tab_item_modifiers: {
        Row: TabItemModifier
        Insert: TabItemModifierInsert
        Update: Partial<TabItemModifierInsert>
      }
    }
  }
}
