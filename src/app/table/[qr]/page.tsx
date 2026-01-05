'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useSendNotification } from '@/lib/supabase/hooks'
import { Coffee, Receipt, CreditCard, Bell, Phone } from 'lucide-react'

export default function ClientHub() {
  const params = useParams()
  const router = useRouter()
  const qrCode = params.qr as string
  const { table, tab, loading, error } = useTableByQR(qrCode)
  const { sendNotification, loading: notifying } = useSendNotification()

  const handleRequestBill = async () => {
    if (!table) return
    try {
      await sendNotification('bill_request', table.id, `Table ${table.number} requests the bill`)
      alert('Bill request sent to staff!')
    } catch (err) {
      alert('Failed to send request. Please try again.')
    }
  }

  const handleCallServer = async () => {
    if (!table) return
    try {
      await sendNotification('server_call', table.id, `Table ${table.number} needs assistance`)
      alert('Server has been notified!')
    } catch (err) {
      alert('Failed to call server. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E2723] mx-auto mb-4" />
          <p className="text-[#3E2723]">Loading your table...</p>
        </div>
      </div>
    )
  }

  if (error || !table) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-[#3E2723] mb-2">Table Not Found</h1>
          <p className="text-gray-600">
            This QR code doesn't seem to be valid. Please scan the QR code at your table.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
        <div className="inline-block bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white rounded-full w-20 h-20 flex items-center justify-center mb-4">
          <Coffee size={40} />
        </div>
        <h1 className="text-3xl font-bold text-[#3E2723] mb-2">Welcome!</h1>
        <p className="text-xl text-gray-600 mb-1">Table {table.number}</p>
        {table.section && (
          <p className="text-sm text-gray-500">{table.section} Section</p>
        )}

        {/* Tab Status */}
        {tab && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Current Total:</span>
              <span className="text-3xl font-bold text-[#3E2723]">
                ${tab.total.toFixed(2)}
              </span>
            </div>
            {tab.type === 'prepaid' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Prepaid Balance:</span>
                  <span className="font-semibold text-[#E07A5F]">
                    ${tab.balance.toFixed(2)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] transition-all duration-500"
                    style={{ width: `${Math.max(0, (tab.balance / tab.prepaid_amount) * 100)}%` }}
                  />
                </div>
                {tab.balance < tab.prepaid_amount * 0.2 && (
                  <p className="text-xs text-orange-600 mt-2">
                    Low balance - consider topping up!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => router.push(`/table/${qrCode}/menu`)}
          className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Coffee size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">View Menu & Order</div>
              <div className="text-sm text-white/80">Browse our selection</div>
            </div>
          </div>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {tab && (
          <>
            <button
              onClick={() => router.push(`/table/${qrCode}/tab`)}
              className="w-full bg-white text-[#3E2723] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between border-2 border-[#3E2723]"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-[#3E2723]/10 rounded-xl p-3">
                  <Receipt size={28} className="text-[#3E2723]" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">View My Tab</div>
                  <div className="text-sm text-gray-600">See all items</div>
                </div>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => router.push(`/table/${qrCode}/pay`)}
              className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <CreditCard size={28} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Pay & Leave</div>
                  <div className="text-sm text-white/80">Settle your tab</div>
                </div>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={handleRequestBill}
          disabled={notifying}
          className="bg-white text-[#3E2723] rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Bell size={24} className="mx-auto mb-2" />
          <div className="text-sm font-semibold">Request Bill</div>
        </button>

        <button
          onClick={handleCallServer}
          disabled={notifying}
          className="bg-white text-[#3E2723] rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Phone size={24} className="mx-auto mb-2" />
          <div className="text-sm font-semibold">Call Server</div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Enjoying your experience?</p>
        <p className="mt-1">Scan the QR code again to return here anytime</p>
      </div>
    </div>
  )
}
