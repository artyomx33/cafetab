'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { OrderTicket } from '@/components/ui/order-ticket'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { OrderStatus } from '@/types'
import { ExternalLink, Volume2, VolumeX, RefreshCw, Maximize2 } from 'lucide-react'

interface OrderTicketData {
  orderId: string
  tableNumber: string
  status: OrderStatus
  createdAt: string
  notes: string | null
  items: Array<{
    productName: string
    quantity: number
    notes: string | null
    categoryId?: string
    modifiers?: Array<{
      name: string
      priceAdjustment: number
      quantity: number
    }>
  }>
}

type FilterType = 'all' | 'bar' | 'kitchen'

export default function AdminKitchenPage() {
  const [orders, setOrders] = useState<OrderTicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [barCategoryId, setBarCategoryId] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch bar category ID
  useEffect(() => {
    const fetchBarCategory = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('cafe_categories')
        .select('id')
        .or('name.ilike.%drink%,name.ilike.%bar%,name.ilike.%beverage%')
        .limit(1)
        .single()

      if (data) {
        setBarCategoryId(data.id)
      }
    }

    fetchBarCategory()
  }, [])

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: ordersData, error } = await supabase
        .from('cafe_orders')
        .select(`
          id,
          tab_id,
          status,
          notes,
          created_at,
          cafe_tabs!inner (
            table_id,
            cafe_tables!cafe_tabs_table_id_fkey (
              number
            )
          ),
          cafe_order_items (
            quantity,
            notes,
            cafe_products!inner (
              name,
              category_id
            )
          )
        `)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      if (ordersData) {
        const transformedOrders: OrderTicketData[] = ordersData.map((order: any) => ({
          orderId: order.id,
          tableNumber: order.cafe_tabs.cafe_tables.number,
          status: order.status as OrderStatus,
          createdAt: order.created_at,
          notes: order.notes,
          items: order.cafe_order_items.map((item: any) => ({
            productName: item.cafe_products.name,
            quantity: item.quantity,
            notes: item.notes,
            categoryId: item.cafe_products.category_id,
            modifiers: [],
          })),
        }))

        // Check if there are new orders
        const newOrderCount = transformedOrders.filter(o => o.status === 'pending').length
        const oldOrderCount = orders.filter(o => o.status === 'pending').length
        if (newOrderCount > oldOrderCount && soundEnabled) {
          playNotificationSound()
        }

        setOrders(transformedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [orders, soundEnabled])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchOrders])

  // Auto-archive: Mark ready orders as served after 5 minutes
  useEffect(() => {
    const autoArchiveInterval = setInterval(async () => {
      const now = new Date()
      const readyToArchive = orders.filter(order => {
        if (order.status !== 'ready') return false
        const orderTime = new Date(order.createdAt)
        const minutesSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60)
        // Auto-archive after 5 minutes of being ready (roughly PREP_TIME + 5)
        return minutesSinceOrder >= 17 // ~12 min prep + 5 min wait
      })

      // Silently mark as served (assumed picked up)
      for (const order of readyToArchive) {
        await handleServeOrder(order.orderId)
      }
    }, 60000) // Check every minute

    return () => clearInterval(autoArchiveInterval)
  }, [orders])

  // Handle order status updates
  const handleStartOrder = async (orderId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_orders')
        .update({ status: 'preparing' })
        .eq('id', orderId)

      if (error) {
        console.error('Error starting order:', error)
        return
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: 'preparing' as OrderStatus } : order
        )
      )
    } catch (error) {
      console.error('Error starting order:', error)
    }
  }

  const handleMarkReady = async (orderId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_orders')
        .update({
          status: 'ready',
          prepared_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error marking order ready:', error)
        return
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: 'ready' as OrderStatus } : order
        )
      )

      if (soundEnabled) {
        playNotificationSound()
      }
    } catch (error) {
      console.error('Error marking order ready:', error)
    }
  }

  const handleServeOrder = async (orderId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_orders')
        .update({
          status: 'served',
          served_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error serving order:', error)
        return
      }

      setOrders((prev) => prev.filter((order) => order.orderId !== orderId))
    } catch (error) {
      console.error('Error serving order:', error)
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

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true

    if (filter === 'bar') {
      return barCategoryId && order.items.some((item) => item.categoryId === barCategoryId)
    }

    if (filter === 'kitchen') {
      return order.items.some((item) => item.categoryId !== barCategoryId)
    }

    return true
  })

  // Group orders by status
  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending')
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing')
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Kitchen Display</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Real-time order management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => fetchOrders()}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-[var(--muted-foreground)] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <a
              href="/seller/orders"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-[var(--gold-500)] text-[var(--charcoal-900)] rounded-lg text-sm font-medium hover:bg-[var(--gold-400)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full View
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="default"
            className={filter === 'all' ? '' : 'bg-[var(--charcoal-800)] text-white hover:bg-[var(--charcoal-700)]'}
          >
            All Orders ({orders.length})
          </Button>
          <Button
            onClick={() => setFilter('bar')}
            variant={filter === 'bar' ? 'primary' : 'ghost'}
            size="default"
            className={filter === 'bar' ? '' : 'bg-[var(--charcoal-800)] text-white hover:bg-[var(--charcoal-700)]'}
          >
            Bar Only
          </Button>
          <Button
            onClick={() => setFilter('kitchen')}
            variant={filter === 'kitchen' ? 'primary' : 'ghost'}
            size="default"
            className={filter === 'kitchen' ? '' : 'bg-[var(--charcoal-800)] text-white hover:bg-[var(--charcoal-700)]'}
          >
            Kitchen Only
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--muted-foreground)]">Loading orders...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-[var(--muted-foreground)]">All caught up!</div>
            <div className="text-[var(--muted-foreground)] mt-2">No pending orders</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                Pending
              </div>
              <div className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                {pendingOrders.length}
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              {pendingOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                  onStart={() => handleStartOrder(order.orderId)}
                />
              ))}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                No pending orders
              </div>
            )}
          </div>

          {/* Preparing Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Preparing
              </div>
              <div className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                {preparingOrders.length}
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              {preparingOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                  onDone={() => handleMarkReady(order.orderId)}
                />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                No orders being prepared
              </div>
            )}
          </div>

          {/* Ready Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                Ready
              </div>
              <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                {readyOrders.length}
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              {readyOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                  onServe={() => handleServeOrder(order.orderId)}
                />
              ))}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                No orders ready
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Statistics */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-[var(--charcoal-800)] rounded-xl p-4 border border-[var(--charcoal-700)]">
          <div className="text-3xl font-bold text-white">{orders.length}</div>
          <div className="text-sm text-[var(--muted-foreground)]">Active Orders</div>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="text-3xl font-bold text-yellow-400">{pendingOrders.length}</div>
          <div className="text-sm text-yellow-400/70">Pending</div>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="text-3xl font-bold text-blue-400">{preparingOrders.length}</div>
          <div className="text-sm text-blue-400/70">Preparing</div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="text-3xl font-bold text-green-400">{readyOrders.length}</div>
          <div className="text-sm text-green-400/70">Ready</div>
        </div>
      </div>
    </div>
  )
}
