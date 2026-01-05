// NEW HOOKS TO ADD TO hooks.ts

// Order hooks (for kitchen display)
export function useOrders(status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled') {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    let query = supabase
      .from('cafe_orders')
      .select(`
        *,
        cafe_order_items (
          *,
          cafe_products (*)
        ),
        cafe_tabs (
          cafe_tables (number)
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data } = await query

    if (data) {
      const formatted = data.map((order: any) => ({
        id: order.id,
        tab_id: order.tab_id,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        prepared_at: order.prepared_at,
        served_at: order.served_at,
        order_items: order.cafe_order_items?.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes,
          created_at: item.created_at,
          product: item.cafe_products
        })) || [],
        table_number: order.cafe_tabs?.cafe_tables?.number || 'Unknown'
      }))
      setOrders(formatted)
    }
    setLoading(false)
  }, [status])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled') => {
    const updateData: any = { status: newStatus }

    if (newStatus === 'ready') {
      updateData.prepared_at = new Date().toISOString()
    } else if (newStatus === 'served') {
      updateData.served_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('cafe_orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw error
    refresh()
  }, [refresh])

  return { orders, loading, refresh, updateOrderStatus }
}

// Notification hooks
export function useNotifications(sellerId?: string) {
  const [notifications, setNotifications] = useState<NotificationWithTable[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    let query = supabase
      .from('cafe_notifications')
      .select(`
        *,
        cafe_tables (*)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (sellerId) {
      query = query.or(`seller_id.eq.${sellerId},seller_id.is.null`)
    }

    const { data } = await query

    if (data) {
      const formatted = data.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        table_id: notif.table_id,
        seller_id: notif.seller_id,
        message: notif.message,
        read: notif.read,
        created_at: notif.created_at,
        table: notif.cafe_tables
      }))
      setNotifications(formatted)
    }
    setLoading(false)
  }, [sellerId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('cafe_notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
    refresh()
  }, [refresh])

  const markAllAsRead = useCallback(async () => {
    let query = supabase
      .from('cafe_notifications')
      .update({ read: true })
      .eq('read', false)

    if (sellerId) {
      query = query.or(`seller_id.eq.${sellerId},seller_id.is.null`)
    }

    const { error } = await query

    if (error) throw error
    refresh()
  }, [sellerId, refresh])

  return { notifications, loading, refresh, markAsRead, markAllAsRead }
}
