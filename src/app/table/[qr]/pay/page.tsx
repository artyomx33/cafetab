'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useClientTab } from '@/lib/supabase/hooks'
import { useToast } from '@/components/ui/toast'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CreditCard, DollarSign, AlertCircle, Users, User, Minus, Plus, X, Check } from 'lucide-react'

// Split bill modes
type SplitMode = 'full' | 'split' | 'custom'

// Tip presets with visual feedback colors
const TIP_PRESETS = [
  { label: 'No tip', value: 0, emoji: '' },
  { label: '15%', value: 0.15, emoji: '' },
  { label: '20%', value: 0.20, emoji: '' },
  { label: '25%', value: 0.25, emoji: '' },
]

export default function Checkout() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const qrCode = params.qr as string
  const { table, tab: basicTab } = useTableByQR(qrCode)
  const { tab, loading } = useClientTab(basicTab?.id || null)

  // Tip state
  const [tipPercent, setTipPercent] = useState(0.15)
  const [customTipAmount, setCustomTipAmount] = useState('')
  const [isCustomTip, setIsCustomTip] = useState(false)

  // Split bill state
  const [splitMode, setSplitMode] = useState<SplitMode>('full')
  const [splitCount, setSplitCount] = useState(2)
  const [customPayAmount, setCustomPayAmount] = useState('')

  // UI state
  const [processing, setProcessing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'pay' | 'refund'>('pay')

  const handleTipSelect = (value: number) => {
    setIsCustomTip(false)
    setTipPercent(value)
    setCustomTipAmount('')
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTipAmount(value)
    setIsCustomTip(true)
  }

  // Calculate amounts
  const subtotal = tab?.total || 0
  const tipAmount = isCustomTip
    ? (parseFloat(customTipAmount) || 0)
    : subtotal * tipPercent
  const fullTotal = subtotal + tipAmount

  // Calculate what user pays based on split mode
  const userPayAmount = (() => {
    switch (splitMode) {
      case 'split':
        return fullTotal / splitCount
      case 'custom':
        return parseFloat(customPayAmount) || 0
      default:
        return fullTotal
    }
  })()

  const handlePayNow = () => {
    setConfirmAction('pay')
    setShowConfirmModal(true)
  }

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false)
    setProcessing(true)
    // Placeholder for Stripe integration
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.info('Payment functionality will be integrated with Stripe soon!')
    setProcessing(false)
  }

  const handleRefund = () => {
    if (!tab) return
    setConfirmAction('refund')
    setShowConfirmModal(true)
  }

  const handleConfirmRefund = async () => {
    setShowConfirmModal(false)
    setProcessing(true)
    // Placeholder for refund flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Refund request sent! Staff will process your refund shortly.')
    setProcessing(false)
    router.push(`/table/${qrCode}`)
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
    <div className="min-h-screen pb-6 bg-gradient-to-b from-[#FFF8E7] to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-[#3E2723]" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[#3E2723]">Table {table.number}</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6">
        {/* HERO TOTAL - The Moment of Truth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center"
        >
          <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Your Total</p>
          <motion.div
            key={userPayAmount}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-[#3E2723] mb-2"
          >
            ${userPayAmount.toFixed(2)}
          </motion.div>
          {splitMode !== 'full' && (
            <p className="text-sm text-gray-500">
              of ${fullTotal.toFixed(2)} total
            </p>
          )}
          {tipAmount > 0 && (
            <p className="text-sm text-[#E07A5F] mt-1">
              Includes ${tipAmount.toFixed(2)} tip
            </p>
          )}
        </motion.div>

        {/* Prepaid Warning */}
        {isPrepaid && tab.balance <= 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Balance Depleted</h3>
              <p className="text-sm text-red-700">
                Your prepaid balance has been fully used. Please see staff.
              </p>
            </div>
          </div>
        )}

        {/* Split Bill Options */}
        {!isPrepaid && subtotal > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Split the Bill?</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSplitMode('full')}
                className={`py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                  splitMode === 'full'
                    ? 'bg-[#3E2723] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User size={20} />
                <span className="text-xs">Full Bill</span>
              </button>
              <button
                onClick={() => setSplitMode('split')}
                className={`py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                  splitMode === 'split'
                    ? 'bg-[#3E2723] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={20} />
                <span className="text-xs">Split Evenly</span>
              </button>
              <button
                onClick={() => setSplitMode('custom')}
                className={`py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                  splitMode === 'custom'
                    ? 'bg-[#3E2723] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign size={20} />
                <span className="text-xs">Custom</span>
              </button>
            </div>

            {/* Split Evenly Controls */}
            <AnimatePresence>
              {splitMode === 'split' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-[#3E2723]">{splitCount}</span>
                      <p className="text-xs text-gray-500">people</p>
                    </div>
                    <button
                      onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    ${(fullTotal / splitCount).toFixed(2)} per person
                  </p>
                </motion.div>
              )}

              {splitMode === 'custom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="text-sm text-gray-600 mb-2 block">Amount to pay:</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        value={customPayAmount}
                        onChange={(e) => setCustomPayAmount(e.target.value)}
                        placeholder="0.00"
                        max={fullTotal}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-[#3E2723] focus:outline-none"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {parseFloat(customPayAmount) > fullTotal && (
                      <p className="text-xs text-red-500 mt-1">Amount exceeds total bill</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tip Selection */}
        {!isPrepaid && subtotal > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Add a Tip</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TIP_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleTipSelect(preset.value)}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    !isCustomTip && tipPercent === preset.value
                      ? 'bg-[#E07A5F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom tip input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={customTipAmount}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                onFocus={() => setIsCustomTip(true)}
                placeholder="Custom tip amount"
                className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl text-base focus:outline-none transition-colors ${
                  isCustomTip && customTipAmount
                    ? 'border-[#E07A5F] bg-orange-50'
                    : 'border-gray-200 focus:border-[#E07A5F]'
                }`}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Bill Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-[#E07A5F]">
                <span>Tip ({isCustomTip ? 'custom' : `${(tipPercent * 100).toFixed(0)}%`})</span>
                <span className="font-medium">${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-[#3E2723]">${fullTotal.toFixed(2)}</span>
            </div>
            {splitMode !== 'full' && (
              <div className="bg-[#FFF8E7] rounded-lg p-2 flex justify-between">
                <span className="font-semibold text-[#3E2723]">You Pay</span>
                <span className="font-bold text-[#3E2723]">${userPayAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {isPrepaid && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-gradient-to-r from-[#FFF8E7] to-[#F5EBD7] rounded-xl p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Prepaid Balance:</span>
                  <span className="font-bold text-[#E07A5F]">${tab.balance.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] transition-all"
                    style={{ width: `${Math.max(0, (tab.balance / tab.prepaid_amount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button - The Moment of Truth */}
        <div className="space-y-3">
          {!isPrepaid && (
            <motion.button
              onClick={handlePayNow}
              disabled={processing || userPayAmount <= 0}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={24} />
                  Pay ${userPayAmount.toFixed(2)}
                </>
              )}
            </motion.button>
          )}

          {isPrepaid && hasBalance && (
            <motion.button
              onClick={handleRefund}
              disabled={processing}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Close Tab & Refund $${tab.balance.toFixed(2)}`}
            </motion.button>
          )}

          {isPrepaid && !hasBalance && (
            <div className="bg-gray-100 text-gray-600 py-4 rounded-xl text-center font-semibold">
              Balance fully used - no refund needed
            </div>
          )}

          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="w-full text-[#3E2723] py-3 text-sm hover:underline"
          >
            Back to menu
          </button>
        </div>

        {/* Payment Coming Soon Note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Stripe integration coming soon</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            >
              {confirmAction === 'pay' ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#3E2723] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3E2723] mb-2">Confirm Payment</h2>
                    <p className="text-gray-600">You're about to pay</p>
                    <p className="text-4xl font-bold text-[#3E2723] mt-2">${userPayAmount.toFixed(2)}</p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleConfirmPayment}
                      className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="w-full text-gray-500 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#E07A5F] rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3E2723] mb-2">Close Tab?</h2>
                    <p className="text-gray-600">You'll receive a refund of</p>
                    <p className="text-4xl font-bold text-[#E07A5F] mt-2">${tab?.balance.toFixed(2)}</p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleConfirmRefund}
                      className="w-full bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Close & Refund
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="w-full text-gray-500 py-2"
                    >
                      Keep Tab Open
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
