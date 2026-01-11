'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CreditCard, Banknote, DollarSign, Receipt } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { useCreatePayment, useTabTransactions, useMarkTabPaid } from '@/lib/supabase/hooks'
import { useToast } from './toast'
import type { Tab, Seller } from '@/types'

interface CloseTabModalProps {
  isOpen: boolean
  onClose: () => void
  tab: Tab
  seller: Seller
  onPaymentComplete: () => void
}

export function CloseTabModal({
  isOpen,
  onClose,
  tab,
  seller,
  onPaymentComplete
}: CloseTabModalProps) {
  const toast = useToast()
  const { createPayment, loading: paymentLoading } = useCreatePayment()
  const { paidAmount, refresh: refreshTransactions } = useTabTransactions(tab?.id || null)
  const { markTabPaid } = useMarkTabPaid()

  const [tipAmount, setTipAmount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | null>(null)
  const [customTipMode, setCustomTipMode] = useState(false)

  const subtotal = tab?.total || 0
  const remainingBalance = subtotal - paidAmount
  const tipValue = parseFloat(tipAmount) || 0
  const totalWithTip = remainingBalance + tipValue

  const tipPresets = [
    { label: 'No Tip', percent: 0 },
    { label: '10%', percent: 10 },
    { label: '15%', percent: 15 },
    { label: '20%', percent: 20 },
  ]

  const handleTipPreset = (percent: number) => {
    const tip = (remainingBalance * percent) / 100
    setTipAmount(tip.toFixed(2))
    setCustomTipMode(false)
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (remainingBalance <= 0) {
      toast.error('Tab is already fully paid')
      return
    }

    try {
      await createPayment({
        tab_id: tab.id,
        amount: remainingBalance,
        tip_amount: tipValue,
        payment_method: paymentMethod,
        processed_by: seller.id
      })

      // Check if tab is now fully paid (this payment covers the remaining balance)
      const newPaidAmount = paidAmount + remainingBalance
      if (newPaidAmount >= subtotal) {
        // Mark tab as paid and free the table
        await markTabPaid(tab.id)
        toast.success(`Tab closed! Collected $${totalWithTip.toFixed(2)} (${paymentMethod})`)
      } else {
        toast.success(`Partial payment of $${totalWithTip.toFixed(2)} recorded (${paymentMethod})`)
      }

      // Refresh to check if fully paid
      await refreshTransactions()
      onPaymentComplete()
    } catch (err) {
      console.error('Payment failed:', err)
      toast.error('Failed to record payment. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[var(--gold-500)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Close Tab</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Bill Summary */}
            <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Tab Total</span>
                <span className="text-[var(--foreground)]">${subtotal.toFixed(2)}</span>
              </div>
              {paidAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Already Paid</span>
                  <span className="text-green-500">-${paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--card-border)]">
                <span className="text-[var(--foreground)]">Remaining</span>
                <span className="text-[var(--gold-500)]">${remainingBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Tip Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Add Tip
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {tipPresets.map((preset) => (
                  <button
                    key={preset.percent}
                    onClick={() => handleTipPreset(preset.percent)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      !customTipMode && tipAmount === ((remainingBalance * preset.percent) / 100).toFixed(2)
                        ? 'bg-[var(--gold-500)] text-white'
                        : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomTipMode(true)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    customTipMode
                      ? 'bg-[var(--gold-500)] text-white'
                      : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80'
                  }`}
                >
                  Custom
                </button>
                {customTipMode && (
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10 text-[var(--gold-500)]'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-green-500/10 text-green-500'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-green-500/50'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="font-medium">Cash</span>
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-[var(--gold-500)]/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--foreground)] font-medium">Total to Collect</span>
                <span className="text-2xl font-bold text-[var(--gold-500)]">
                  ${totalWithTip.toFixed(2)}
                </span>
              </div>
              {tipValue > 0 && (
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Includes ${tipValue.toFixed(2)} tip for {seller.name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!paymentMethod || paymentLoading || remainingBalance <= 0}
                className="flex-1"
              >
                {paymentLoading ? 'Processing...' : 'Complete Payment'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
