'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/contexts/RestaurantContext'
import {
  Volume2, VolumeX, RefreshCw, Maximize2, ChevronLeft, ChevronRight,
  Clock, CheckCircle, Flame, Coffee, ChefHat, Truck
} from 'lucide-react'

// Types for item-level management
interface OrderItemData {
  id: string
  productId: string
  productName: string
  prepTime: number
  quantity: number
  notes: string | null
  status: 'pending' | 'ready' | 'delivered'
  readyAt: string | null
  createdAt: string
}

interface OrderData {
  orderId: string
  tableNumber: string
  createdAt: string
  items: OrderItemData[]
}

// Table grouping - groups multiple orders by table
interface TableGroup {
  tableNumber: string
  oldestOrder: string
  orders: {
    orderId: string
    createdAt: string
    items: OrderItemData[]
  }[]
}

// Heat indicator based on prep_time ratio
function getHeatLevel(waitMinutes: number, prepTime: number): { color: string; bgColor: string; label: string } {
  const ratio = waitMinutes / prepTime

  if (ratio >= 1.5) {
    return { color: 'text-red-500', bgColor: 'bg-red-500/20', label: 'OVERDUE' }
  }
  if (ratio >= 1.0) {
    return { color: 'text-orange-500', bgColor: 'bg-orange-500/20', label: 'Due' }
  }
  if (ratio >= 0.7) {
    return { color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'Soon' }
  }
  return { color: 'text-green-500', bgColor: 'bg-green-500/10', label: '' }
}

// Calculate minutes since order
function getMinutesSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
}

// Format time ago
function formatTimeAgo(dateStr: string): string {
  const minutes = getMinutesSince(dateStr)
  if (minutes < 1) return 'Just now'
  if (minutes === 1) return '1m ago'
  return `${minutes}m ago`
}

type ViewMode = 'split' | 'quick' | 'kitchen'

export default function AdminKitchenPage() {
  const { restaurantId, restaurant, loading: restaurantLoading } = useRestaurant()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch orders with item-level data, filtered by restaurant
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return

    try {
      const supabase = createClient()
      const { data: ordersData, error } = await supabase
        .from('cafe_orders')
        .select(`
          id,
          created_at,
          cafe_tabs!inner (
            cafe_tables!cafe_tabs_table_id_fkey!inner (
              number,
              restaurant_id
            )
          ),
          cafe_order_items (
            id,
            product_id,
            quantity,
            notes,
            status,
            ready_at,
            created_at,
            cafe_products!inner (
              name,
              prep_time
            )
          )
        `)
        .eq('cafe_tabs.cafe_tables.restaurant_id', restaurantId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      if (ordersData) {
        const transformedOrders: OrderData[] = ordersData
          .map((order: any) => ({
            orderId: order.id,
            tableNumber: order.cafe_tabs.cafe_tables.number,
            createdAt: order.created_at,
            items: order.cafe_order_items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.cafe_products.name,
              prepTime: item.cafe_products.prep_time || 10,
              quantity: item.quantity,
              notes: item.notes,
              status: item.status || 'pending',
              readyAt: item.ready_at,
              createdAt: item.created_at || order.created_at,
            })),
          }))
          // Filter out orders where all items are delivered
          .filter(order => order.items.some((item: OrderItemData) => item.status !== 'delivered'))

        setOrders(transformedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  // Initial fetch
  useEffect(() => {
    if (restaurantId) {
      fetchOrders()
    }
  }, [restaurantId, fetchOrders])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Mark item as ready
  const handleMarkItemReady = async (itemId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_order_items')
        .update({
          status: 'ready',
          ready_at: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) {
        console.error('Error marking item ready:', error)
        return
      }

      // Update local state
      setOrders(prev => prev.map(order => ({
        ...order,
        items: order.items.map(item =>
          item.id === itemId
            ? { ...item, status: 'ready' as const, readyAt: new Date().toISOString() }
            : item
        )
      })))

      if (soundEnabled) playNotificationSound()
    } catch (error) {
      console.error('Error marking item ready:', error)
    }
  }

  // Mark item as delivered
  const handleMarkItemDelivered = async (itemId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_order_items')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) {
        console.error('Error marking item delivered:', error)
        return
      }

      // Update local state
      setOrders(prev => prev
        .map(order => ({
          ...order,
          items: order.items.map(item =>
            item.id === itemId
              ? { ...item, status: 'delivered' as const }
              : item
          )
        }))
        // Remove orders where all items are delivered
        .filter(order => order.items.some(item => item.status !== 'delivered'))
      )
    } catch (error) {
      console.error('Error marking item delivered:', error)
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {})
    } catch (error) {}
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Group orders by table for Quick column (only quick items)
  const getQuickByTable = (): TableGroup[] => {
    const byTable: Record<string, TableGroup> = {}

    orders.forEach(order => {
      const quickItems = order.items.filter(
        item => item.prepTime <= 3 && item.status !== 'delivered'
      )
      if (quickItems.length === 0) return

      if (!byTable[order.tableNumber]) {
        byTable[order.tableNumber] = {
          tableNumber: order.tableNumber,
          oldestOrder: order.createdAt,
          orders: []
        }
      }

      byTable[order.tableNumber].orders.push({
        orderId: order.orderId,
        createdAt: order.createdAt,
        items: quickItems
      })

      // Track oldest order time
      if (new Date(order.createdAt) < new Date(byTable[order.tableNumber].oldestOrder)) {
        byTable[order.tableNumber].oldestOrder = order.createdAt
      }
    })

    return Object.values(byTable).sort((a, b) =>
      new Date(a.oldestOrder).getTime() - new Date(b.oldestOrder).getTime()
    )
  }

  // Group orders by table for Kitchen column
  const getKitchenByTable = (): TableGroup[] => {
    const byTable: Record<string, TableGroup> = {}

    orders.forEach(order => {
      if (!byTable[order.tableNumber]) {
        byTable[order.tableNumber] = {
          tableNumber: order.tableNumber,
          oldestOrder: order.createdAt,
          orders: []
        }
      }

      byTable[order.tableNumber].orders.push({
        orderId: order.orderId,
        createdAt: order.createdAt,
        items: order.items
      })

      if (new Date(order.createdAt) < new Date(byTable[order.tableNumber].oldestOrder)) {
        byTable[order.tableNumber].oldestOrder = order.createdAt
      }
    })

    return Object.values(byTable)
      .filter(table => table.orders.some(o => o.items.some(i => i.status !== 'delivered')))
      .sort((a, b) =>
        new Date(a.oldestOrder).getTime() - new Date(b.oldestOrder).getTime()
      )
  }

  const quickTables = getQuickByTable()
  const kitchenTables = getKitchenByTable()

  const quickItemCount = quickTables.reduce((sum, table) =>
    sum + table.orders.reduce((oSum, o) => oSum + o.items.length, 0), 0
  )
  const kitchenPendingCount = orders.reduce((sum, o) =>
    sum + o.items.filter(i => i.status === 'pending').length, 0
  )

  // Mark all ready items for a TABLE as delivered
  const handleDeliverAllReadyForTable = async (tableNumber: string) => {
    const tableOrders = orders.filter(o => o.tableNumber === tableNumber)
    const readyItems = tableOrders.flatMap(o => o.items.filter(i => i.status === 'ready'))
    for (const item of readyItems) {
      await handleMarkItemDelivered(item.id)
    }
  }

  // Mark all ready quick items for a TABLE as delivered
  const handleDeliverAllQuickForTable = async (tableNumber: string) => {
    const tableOrders = orders.filter(o => o.tableNumber === tableNumber)
    const readyQuickItems = tableOrders.flatMap(o =>
      o.items.filter(i => i.status === 'ready' && i.prepTime <= 3)
    )
    for (const item of readyQuickItems) {
      await handleMarkItemDelivered(item.id)
    }
  }

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Loading kitchen...</div>
      </div>
    )
  }

  return (
    <div className="p-4 h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              {restaurant?.name} - Item-level status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={fetchOrders}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-[var(--muted-foreground)]">All caught up!</div>
            <div className="text-[var(--muted-foreground)] mt-2">No active orders</div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100%-5rem)]">
          {/* Quick Column */}
          <motion.div
            className={`bg-[var(--charcoal-800)] rounded-xl border border-[var(--charcoal-700)] overflow-hidden flex flex-col ${
              viewMode === 'kitchen' ? 'hidden' : viewMode === 'quick' ? 'flex-1' : 'w-1/2'
            }`}
            layout
          >
            <div
              className="bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => setViewMode(viewMode === 'quick' ? 'split' : 'quick')}
            >
              <div className="flex items-center gap-2">
                {viewMode === 'quick' && <ChevronLeft className="w-5 h-5 text-white/80" />}
                <Coffee className="w-5 h-5 text-white" />
                <span className="font-bold text-white">QUICK</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {quickItemCount}
                </span>
              </div>
              {viewMode === 'split' && (
                <button
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                  onClick={(e) => { e.stopPropagation(); setViewMode('kitchen') }}
                >
                  Kitchen ({kitchenPendingCount}) <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {quickTables.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                    <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No quick items
                  </div>
                ) : (
                  quickTables.map(table => {
                    const waitMinutes = getMinutesSince(table.oldestOrder)
                    const heat = getHeatLevel(waitMinutes, 3)
                    const allItems = table.orders.flatMap(o => o.items)
                    const readyItems = allItems.filter(i => i.status === 'ready')
                    const pendingItems = allItems.filter(i => i.status === 'pending')

                    return (
                      <motion.div
                        key={table.tableNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`bg-[var(--charcoal-900)] rounded-lg border ${heat.color === 'text-red-500' ? 'border-red-500/50' : 'border-[var(--charcoal-700)]'}`}
                      >
                        <div className={`px-3 py-2 border-b border-[var(--charcoal-700)] flex items-center justify-between ${heat.bgColor} rounded-t-lg`}>
                          <span className="font-bold text-white">Table {table.tableNumber}</span>
                          <span className={`text-xs font-medium ${heat.color}`}>
                            {formatTimeAgo(table.oldestOrder)}
                            {heat.label && ` • ${heat.label}`}
                          </span>
                        </div>

                        <div className="p-2 space-y-1">
                          {readyItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-green-500/10">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-400 text-sm">
                                  {item.quantity > 1 && <span className="opacity-70">{item.quantity}× </span>}
                                  {item.productName}
                                </span>
                              </div>
                              <button
                                onClick={() => handleMarkItemDelivered(item.id)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors"
                              >
                                Deliver
                              </button>
                            </div>
                          ))}

                          {pendingItems.map(item => {
                            const itemWait = getMinutesSince(item.createdAt)
                            const itemHeat = getHeatLevel(itemWait, item.prepTime)

                            return (
                              <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 bg-cyan-500/5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border-2 ${itemHeat.color === 'text-red-500' ? 'border-red-500' : itemHeat.color === 'text-orange-500' ? 'border-orange-500' : 'border-cyan-500'}`} />
                                  <span className="text-cyan-300 text-sm">
                                    {item.quantity > 1 && <span className="opacity-70">{item.quantity}× </span>}
                                    {item.productName}
                                  </span>
                                  <span className={`text-xs ${itemHeat.color}`}>
                                    {formatTimeAgo(item.createdAt)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleMarkItemReady(item.id)}
                                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded transition-colors"
                                >
                                  Ready
                                </button>
                              </div>
                            )
                          })}
                        </div>

                        {readyItems.length > 1 && (
                          <div className="px-2 pb-2">
                            <button
                              onClick={() => handleDeliverAllQuickForTable(table.tableNumber)}
                              className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white text-sm font-bold rounded transition-colors"
                            >
                              Deliver All ({readyItems.length})
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Kitchen Column */}
          <motion.div
            className={`bg-[var(--charcoal-800)] rounded-xl border border-[var(--charcoal-700)] overflow-hidden flex flex-col ${
              viewMode === 'quick' ? 'hidden' : viewMode === 'kitchen' ? 'flex-1' : 'w-1/2'
            }`}
            layout
          >
            <div
              className="bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => setViewMode(viewMode === 'kitchen' ? 'split' : 'kitchen')}
            >
              {viewMode === 'split' && (
                <button
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                  onClick={(e) => { e.stopPropagation(); setViewMode('quick') }}
                >
                  <ChevronLeft className="w-4 h-4" /> Quick ({quickItemCount})
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <ChefHat className="w-5 h-5 text-white" />
                <span className="font-bold text-white">KITCHEN</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {kitchenPendingCount}
                </span>
                {viewMode === 'kitchen' && <ChevronRight className="w-5 h-5 text-white/80" />}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {kitchenTables.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No orders in kitchen
                  </div>
                ) : (
                  kitchenTables.map(table => {
                    const waitMinutes = getMinutesSince(table.oldestOrder)
                    const allItems = table.orders.flatMap(o => o.items)
                    const maxPrepTime = Math.max(...allItems.map(i => i.prepTime), 10)
                    const heat = getHeatLevel(waitMinutes, maxPrepTime)
                    const allReadyItems = allItems.filter(i => i.status === 'ready')

                    return (
                      <motion.div
                        key={table.tableNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`bg-[var(--charcoal-900)] rounded-lg border ${heat.color === 'text-red-500' ? 'border-red-500/50' : 'border-[var(--charcoal-700)]'}`}
                      >
                        <div className={`px-3 py-2 border-b border-[var(--charcoal-700)] flex items-center justify-between ${heat.bgColor} rounded-t-lg`}>
                          <span className="font-bold text-white">Table {table.tableNumber}</span>
                          <span className={`text-xs font-medium ${heat.color}`}>
                            {formatTimeAgo(table.oldestOrder)}
                            {heat.label && ` • ${heat.label}`}
                          </span>
                        </div>

                        <div className="p-2 space-y-2">
                          {table.orders.map((order, orderIdx) => {
                            const deliveredItems = order.items.filter(i => i.status === 'delivered')
                            const readyItems = order.items.filter(i => i.status === 'ready')
                            const pendingItems = order.items.filter(i => i.status === 'pending')

                            return (
                              <div key={order.orderId}>
                                {table.orders.length > 1 && (
                                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-[var(--muted-foreground)]">
                                    <Clock className="w-3 h-3" />
                                    <span>Order {formatTimeAgo(order.createdAt)}</span>
                                  </div>
                                )}

                                <div className="space-y-1">
                                  {deliveredItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded opacity-50">
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-500 text-sm line-through">
                                          {item.quantity > 1 && <span>{item.quantity}× </span>}
                                          {item.productName}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">Delivered</span>
                                    </div>
                                  ))}

                                  {readyItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-green-500/10">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-green-400 text-sm">
                                          {item.quantity > 1 && <span className="opacity-70">{item.quantity}× </span>}
                                          {item.productName}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleMarkItemDelivered(item.id)}
                                        className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors"
                                      >
                                        Deliver
                                      </button>
                                    </div>
                                  ))}

                                  {pendingItems.map(item => {
                                    const itemWait = getMinutesSince(item.createdAt)
                                    const itemHeat = getHeatLevel(itemWait, item.prepTime)

                                    return (
                                      <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded-full border-2 ${itemHeat.color === 'text-red-500' ? 'border-red-500' : itemHeat.color === 'text-orange-500' ? 'border-orange-500' : 'border-[var(--charcoal-600)]'}`} />
                                          <span className="text-white text-sm">
                                            {item.quantity > 1 && <span className="text-[var(--muted-foreground)]">{item.quantity}× </span>}
                                            {item.productName}
                                          </span>
                                          <span className={`text-xs ${itemHeat.color}`}>{item.prepTime}m</span>
                                        </div>
                                        <button
                                          onClick={() => handleMarkItemReady(item.id)}
                                          className={`px-2 py-1 ${itemHeat.color === 'text-red-500' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'} text-white text-xs font-medium rounded transition-colors`}
                                        >
                                          Ready
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>

                                {orderIdx < table.orders.length - 1 && (
                                  <div className="border-t border-[var(--charcoal-700)] mt-2" />
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {allReadyItems.length > 1 && (
                          <div className="px-2 pb-2">
                            <button
                              onClick={() => handleDeliverAllReadyForTable(table.tableNumber)}
                              className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-bold rounded transition-colors"
                            >
                              Deliver All ({allReadyItems.length})
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Stats Bar */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <div className="bg-[var(--charcoal-800)] rounded-lg p-3 border border-[var(--charcoal-700)]">
          <div className="text-2xl font-bold text-white">{kitchenTables.length}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Active Tables</div>
        </div>
        <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
          <div className="text-2xl font-bold text-cyan-400">{quickTables.length}</div>
          <div className="text-xs text-cyan-400/70">Quick ({quickItemCount} items)</div>
        </div>
        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-400">{kitchenPendingCount}</div>
          <div className="text-xs text-amber-400/70">Items Cooking</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="text-2xl font-bold text-green-400">
            {orders.reduce((sum, o) => sum + o.items.filter(i => i.status === 'ready').length, 0)}
          </div>
          <div className="text-xs text-green-400/70">Ready to Serve</div>
        </div>
      </div>
    </div>
  )
}
