'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useClientTab } from '@/lib/supabase/hooks'
import { ArrowLeft, CreditCard, DollarSign, AlertCircle } from 'lucide-react'

const TIP_OPTIONS = [
  { label: '10%', value: 0.10 },
  { label: '15%', value: 0.15 },
  { label: '20%', value: 0.20 },
  { label: 'Custom', value: -1 },
]

export default function Checkout() {
  const params = useParams()
  const router = useRouter()
  const qrCode = params.qr as string
  const { table, tab: basicTab } = useTableByQR(qrCode)
  const { tab, loading } = useClientTab(basicTab?.id || null)

  const [selectedTip, setSelectedTip] = useState(0.15)
  const [customTip, setCustomTip] = useState('')
  const [showCustomTip, setShowCustomTip] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleTipSelect = (value: number) => {
    if (value === -1) {
      setShowCustomTip(true)
      setSelectedTip(0)
    } else {
      setShowCustomTip(false)
      setSelectedTip(value)
      setCustomTip('')
    }
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value)
    const amount = parseFloat(value)
    if (!isNaN(amount) && amount >= 0) {
      setSelectedTip(amount)
    }
  }

  const subtotal = tab?.total || 0
  const tipAmount = showCustomTip
    ? (parseFloat(customTip) || 0)
    : subtotal * selectedTip
  const total = subtotal + tipAmount

  const handlePayNow = async () => {
    setProcessing(true)
    // Placeholder for Stripe integration
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Payment functionality will be integrated with Stripe soon!')
    setProcessing(false)
  }

  const handleRefund = async () => {
    if (!tab) return
    const confirmRefund = confirm(
      `Close tab and request refund of $${tab.balance.toFixed(2)}?`
    )
    if (confirmRefund) {
      setProcessing(true)
      // Placeholder for refund flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Refund request sent! Staff will process your refund shortly.')
      setProcessing(false)
      router.push(`/table/${qrCode}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E2723] mx-auto mb-4" />
          <p className="text-[#3E2723]">Loading checkout...</p>
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
            You don't have any items to pay for.
          </p>
          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isPrepaid = tab.type === 'prepaid'
  const hasBalance = isPrepaid && tab.balance > 0

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
            <h1 className="text-xl font-bold text-[#3E2723]">Checkout</h1>
            <p className="text-sm text-gray-600">Table {table.number}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-6">
        {/* Prepaid Warning */}
        {isPrepaid && tab.balance <= 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Balance Depleted</h3>
              <p className="text-sm text-red-700">
                Your prepaid balance has been fully used. Please see staff to top up or pay the remaining amount.
              </p>
            </div>
          </div>
        )}

        {/* Bill Summary */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-[#3E2723] mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            Bill Summary
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold text-[#3E2723]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {isPrepaid && (
              <div className="bg-gradient-to-r from-[#FFF8E7] to-[#F5EBD7] rounded-xl p-3 border border-[#E07A5F]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Prepaid Amount:</span>
                  <span className="font-semibold">
                    ${tab.prepaid_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Remaining Balance:</span>
                  <span className="font-bold text-[#E07A5F]">
                    ${tab.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Add Tip:</span>
                <DollarSign size={20} className="text-[#E07A5F]" />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {TIP_OPTIONS.map(option => (
                  <button
                    key={option.label}
                    onClick={() => handleTipSelect(option.value)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      (option.value === -1 && showCustomTip) ||
                      (option.value !== -1 && selectedTip === option.value && !showCustomTip)
                        ? 'bg-[#3E2723] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {showCustomTip && (
                <div className="mb-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      value={customTip}
                      onChange={(e) => handleCustomTipChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-[#3E2723] focus:outline-none"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Tip Amount:</span>
                <span className="font-semibold">${tipAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#3E2723] pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-700">Total:</span>
              <span className="text-4xl font-bold text-[#3E2723]">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Payment Integration Coming Soon</p>
              <p>
                Stripe payment processing will be integrated shortly. For now, please pay at the counter or request assistance from staff.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isPrepaid && (
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={24} />
                  Pay ${total.toFixed(2)} Now
                </>
              )}
            </button>
          )}

          {isPrepaid && hasBalance && (
            <button
              onClick={handleRefund}
              disabled={processing}
              className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Close Tab & Get Refund ($${tab.balance.toFixed(2)})`}
            </button>
          )}

          {isPrepaid && !hasBalance && (
            <div className="bg-gray-100 text-gray-600 py-4 rounded-xl text-center font-semibold">
              No refund available - balance fully used
            </div>
          )}

          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="w-full bg-white text-[#3E2723] py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-95 border-2 border-[#3E2723]"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Call a server from the main page</p>
        </div>
      </div>
    </div>
  )
}
