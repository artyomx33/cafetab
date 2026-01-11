'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useClientTab } from '@/lib/supabase/hooks'
import { ArrowLeft, Receipt, Clock, CheckCircle, Flame, Truck } from 'lucide-react'

// Status badge info based on item status
interface StatusInfo {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
}

function getStatusInfo(itemStatus: string | null, prepTime: number, orderTime: string): StatusInfo {
  // If we have an actual item status, use it
  if (itemStatus === 'delivered') {
    return {
      label: 'Delivered',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <Truck className="w-3 h-3" />,
    }
  }

  if (itemStatus === 'ready') {
    return {
      label: 'Ready!',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: <CheckCircle className="w-3 h-3" />,
    }
  }

  if (itemStatus === 'pending') {
    // Calculate ETA based on prep_time
    const orderDate = new Date(orderTime)
    const now = new Date()
    const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60)
    const remaining = Math.max(0, Math.ceil(prepTime - minutesSinceOrder))

    if (remaining <= 2) {
      return {
        label: 'Almost ready',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: <Flame className="w-3 h-3" />,
      }
    }

    return {
      label: `~${remaining}min`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: <Clock className="w-3 h-3" />,
    }
  }

  // Fallback for items without status (e.g., added by seller directly)
  const orderDate = new Date(orderTime)
  const now = new Date()
  const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60)

  if (minutesSinceOrder >= prepTime + 5) {
    return {
      label: 'Served',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="w-3 h-3" />,
    }
  }

  if (minutesSinceOrder >= prepTime - 2) {
    return {
      label: 'Ready!',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: <CheckCircle className="w-3 h-3" />,
    }
  }

  const remaining = Math.ceil(prepTime - minutesSinceOrder)
  return {
    label: `~${remaining}min`,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: <Clock className="w-3 h-3" />,
  }
}

export default function ViewTab() {
  const params = useParams()
  const router = useRouter()
  const qrCode = params.qr as string
  const { table, tab: basicTab } = useTableByQR(qrCode)
  const { tab, loading } = useClientTab(basicTab?.id || null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E2723] mx-auto mb-4" />
          <p className="text-[#3E2723]">Loading your tab...</p>
        </div>
      </div>
    )
  }

  if (!tab || !table) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4">🧾</div>
          <h1 className="text-2xl font-bold text-[#3E2723] mb-2">No Active Tab</h1>
          <p className="text-gray-600 mb-6">
            You don't have any items on your tab yet. Start by ordering from the menu!
          </p>
          <button
            onClick={() => router.push(`/table/${qrCode}/menu`)}
            className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            View Menu
          </button>
        </div>
      </div>
    )
  }

  // Sort items newest first, then group by order/time
  const sortedItems = [...tab.tab_items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const groupedItems = sortedItems.reduce((groups, item) => {
    const date = new Date(item.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, typeof tab.tab_items>)

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-[#3E2723]" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#3E2723]">My Tab</h1>
            <p className="text-sm text-gray-600">Table {table.number}</p>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="p-6">
        {/* Tab Summary */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white rounded-full w-16 h-16 flex items-center justify-center">
              <Receipt size={32} />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-gray-600 mb-2">Current Total</div>
            <div className="text-5xl font-bold text-[#3E2723] mb-4">
              ${tab.total.toFixed(2)}
            </div>

            {tab.type === 'prepaid' && (
              <div className="bg-gradient-to-r from-[#FFF8E7] to-[#F5EBD7] rounded-2xl p-4 border-2 border-[#E07A5F]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-700">Prepaid Amount:</span>
                  <span className="font-bold text-[#3E2723]">
                    ${tab.prepaid_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-700">Spent:</span>
                  <span className="font-bold text-gray-600">
                    ${tab.total.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-[#E07A5F] pt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-700">Remaining Balance:</span>
                    <span className="text-2xl font-bold text-[#E07A5F]">
                      ${tab.balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(0, (tab.balance / tab.prepaid_amount) * 100)}%` }}
                  >
                    <span className="text-xs text-white font-bold">
                      {Math.round((tab.balance / tab.prepaid_amount) * 100)}%
                    </span>
                  </div>
                </div>

                {tab.balance < tab.prepaid_amount * 0.2 && tab.balance > 0 && (
                  <div className="mt-3 text-center text-sm text-orange-600 font-semibold">
                    ⚠️ Low balance - consider topping up soon
                  </div>
                )}

                {tab.balance <= 0 && (
                  <div className="mt-3 text-center text-sm text-red-600 font-semibold">
                    ❌ Balance depleted - please top up or pay at counter
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            {tab.tab_items.length} {tab.tab_items.length === 1 ? 'item' : 'items'} ordered
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#3E2723] mb-4">Order History</h2>

          {Object.entries(groupedItems).map(([date, items]) => (
            <div key={date} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white px-4 py-3">
                <div className="text-sm font-semibold">{date}</div>
              </div>

              <div className="p-4">
                {items.map(item => {
                  // Get item status and prep_time for accurate ETA
                  const itemStatus = (item as { item_status?: string | null }).item_status || null
                  const prepTime = item.product?.prep_time || 10
                  const statusInfo = getStatusInfo(itemStatus, prepTime, item.created_at)

                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-[#3E2723]">
                            {item.product?.name || 'Unknown Item'}
                          </span>
                          {/* Status Badge - uses actual item status from kitchen */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </div>
                        {item.product?.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {item.product.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-[#3E2723]">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => router.push(`/table/${qrCode}/menu`)}
            className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Order More Items
          </button>

          <button
            onClick={() => router.push(`/table/${qrCode}/pay`)}
            className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Pay & Close Tab
          </button>
        </div>
      </div>
    </div>
  )
}
