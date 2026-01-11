'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useSendNotification } from '@/lib/supabase/hooks'
import { useDemoStore } from '@/stores/demo-store'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useToast } from '@/components/ui/toast'
import { Coffee, Receipt, CreditCard, Bell, Phone, UserCheck, Wallet, Clock } from 'lucide-react'

export default function ClientHub() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const qrCode = params.qr as string
  const restaurantSlug = params.restaurant as string

  const { restaurant, slug, usesDatabase, formatPrice, getTableByQR, getTables } = useRestaurant()

  // Database mode hooks
  const { table: dbTable, tab: dbTab, loading: dbLoading, error: dbError } = useTableByQR(usesDatabase ? qrCode : '')
  const { sendNotification, loading: notifying } = useSendNotification()

  // Demo mode store
  const { tables: demoTables, initializeRestaurant, openTab } = useDemoStore()

  const [tabRequested, setTabRequested] = useState(false)
  const [depositMode, setDepositMode] = useState(false)

  // Initialize demo store
  useEffect(() => {
    if (!usesDatabase) {
      initializeRestaurant(slug, getTables())
    }
  }, [usesDatabase, slug, getTables, initializeRestaurant])

  // Get table based on mode
  const demoTable = !usesDatabase ? demoTables.find(t => t.qr_code === qrCode) : null
  const table = usesDatabase ? dbTable : demoTable
  const tab = usesDatabase ? dbTab : demoTable?.current_tab
  const loading = usesDatabase ? dbLoading : false
  const error = usesDatabase ? dbError : (!demoTable ? 'Table not found' : null)

  const handleRequestBill = async () => {
    if (!table) return
    if (usesDatabase) {
      try {
        await sendNotification('bill_request', table.id, `Table ${table.number} requests the bill`)
        toast.success('Bill request sent to staff!')
      } catch {
        toast.error('Failed to send request. Please try again.')
      }
    } else {
      toast.success('Bill request sent! (Demo mode)')
    }
  }

  const handleCallServer = async () => {
    if (!table) return
    if (usesDatabase) {
      try {
        await sendNotification('server_call', table.id, `Table ${table.number} needs assistance`)
        toast.success('Server has been notified!')
      } catch {
        toast.error('Failed to call server. Please try again.')
      }
    } else {
      toast.success('Server notified! (Demo mode)')
    }
  }

  const handleRequestTab = async () => {
    if (!table) return
    if (usesDatabase) {
      try {
        await sendNotification('server_call', table.id, `Table ${table.number} requests to open a tab`)
        setTabRequested(true)
      } catch {
        toast.error('Failed to send request. Please try again.')
      }
    } else {
      // Demo mode - auto-open tab
      openTab(table.id, 'regular', 'demo-seller')
      toast.success('Tab opened! You can now order.')
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
          <p className="text-gray-600 mb-4">
            This QR code doesn't seem to be valid. Please scan the QR code at your table.
          </p>
          <button
            onClick={() => router.push(`/${slug}`)}
            className="text-[#3E2723] underline"
          >
            Back to {restaurant.name}
          </button>
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
        <p className="text-lg text-gray-600 mb-1">{restaurant.name}</p>
        <p className="text-xl text-gray-600 mb-1">Table {table.number}</p>
        {table.section && (
          <p className="text-sm text-gray-500">{table.section} Section</p>
        )}

        {!usesDatabase && (
          <span className="inline-block mt-3 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
            Demo Mode
          </span>
        )}

        {/* Tab Status */}
        {tab && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Current Total:</span>
              <span className="text-3xl font-bold text-[#3E2723]">
                {formatPrice(tab.total)}
              </span>
            </div>
            {tab.type === 'prepaid' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Prepaid Balance:</span>
                  <span className="font-semibold text-[#E07A5F]">
                    {formatPrice((tab as any).balance || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* No Tab - Show tab opening options */}
        {!tab && !tabRequested && !depositMode && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#3E2723] mb-4 text-center">
              Open a Tab to Start Ordering
            </h2>
            <p className="text-gray-600 text-center text-sm mb-6">
              Choose how you'd like to open your tab
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRequestTab}
                disabled={notifying}
                className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-lg p-2">
                    <UserCheck size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{usesDatabase ? 'Request Tab' : 'Open Tab'}</div>
                    <div className="text-xs text-white/80">
                      {usesDatabase ? 'Staff will approve your tab' : 'Start ordering now (Demo)'}
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {usesDatabase && (
                <button
                  onClick={() => setDepositMode(true)}
                  className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Wallet size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Open with Deposit</div>
                      <div className="text-xs text-white/80">Pay upfront at the bar</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => router.push(`/${slug}/table/${qrCode}/menu`)}
              className="w-full mt-4 text-[#3E2723] underline text-sm"
            >
              Browse menu first →
            </button>
          </div>
        )}

        {/* Tab Requested - Waiting for approval */}
        {!tab && tabRequested && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-[#3E2723]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Clock size={40} className="text-[#3E2723]" />
            </div>
            <h2 className="text-xl font-bold text-[#3E2723] mb-2">
              Tab Request Sent!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              A staff member will approve your tab shortly.<br />
              This page will update automatically.
            </p>
            <div className="animate-pulse flex justify-center space-x-1">
              <div className="w-2 h-2 bg-[#3E2723] rounded-full"></div>
              <div className="w-2 h-2 bg-[#3E2723] rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-[#3E2723] rounded-full animation-delay-400"></div>
            </div>
          </div>
        )}

        {/* Deposit Mode - Instructions */}
        {!tab && depositMode && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="bg-gradient-to-br from-[#E07A5F] to-[#F4A261] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#3E2723] mb-2 text-center">
              Open Tab with Deposit
            </h2>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-[#3E2723] mb-2">How it works:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-[#3E2723] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Go to the bar and tell the staff your table number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#3E2723] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>Pay your deposit (card or cash)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#3E2723] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Staff will activate your tab instantly</span>
                </li>
              </ol>
            </div>

            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">Your table:</span>
              <div className="text-3xl font-bold text-[#3E2723]">{table.number}</div>
            </div>

            <button
              onClick={() => setDepositMode(false)}
              className="w-full text-gray-500 text-sm underline"
            >
              ← Back to options
            </button>
          </div>
        )}

        {/* Has Tab - Show normal actions */}
        {tab && (
          <>
            <button
              onClick={() => router.push(`/${slug}/table/${qrCode}/menu`)}
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

            <button
              onClick={() => router.push(`/${slug}/table/${qrCode}/tab`)}
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
              onClick={() => router.push(`/${slug}/table/${qrCode}/pay`)}
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

      {/* Quick Actions - only show when tab is open */}
      {tab && (
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
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Enjoying your experience at {restaurant.name}?</p>
        <p className="mt-1">Scan the QR code again to return here anytime</p>
      </div>
    </div>
  )
}
