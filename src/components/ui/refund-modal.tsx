'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface Payment {
  id: string
  amount: number
  tip_amount: number
  payment_method: 'card' | 'cash' | null
  tab?: {
    table?: {
      number: string
    }
  }
  seller?: {
    name: string
  }
  created_at: string
}

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
  onConfirm: (amount: number) => Promise<void>
  loading: boolean
}

export function RefundModal({
  isOpen,
  onClose,
  payment,
  onConfirm,
  loading
}: RefundModalProps) {
  const [refundAmount, setRefundAmount] = useState('')
  const [useFullAmount, setUseFullAmount] = useState(true)

  if (!isOpen || !payment) return null

  const totalPaid = Number(payment.amount) + Number(payment.tip_amount || 0)
  const amountToRefund = useFullAmount ? totalPaid : (parseFloat(refundAmount) || 0)
  const isValidAmount = amountToRefund > 0 && amountToRefund <= totalPaid

  const handleConfirm = async () => {
    if (!isValidAmount) return
    await onConfirm(amountToRefund)
    setRefundAmount('')
    setUseFullAmount(true)
  }

  const handleClose = () => {
    setRefundAmount('')
    setUseFullAmount(true)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Refund Payment</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Payment Info */}
            <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Table</span>
                <span className="text-[var(--foreground)] font-medium">
                  {payment.tab?.table?.number || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Original Amount</span>
                <span className="text-[var(--foreground)]">${Number(payment.amount).toFixed(2)}</span>
              </div>
              {Number(payment.tip_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Tip</span>
                  <span className="text-purple-400">${Number(payment.tip_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--card-border)]">
                <span className="text-[var(--foreground)]">Total Paid</span>
                <span className="text-[var(--foreground)]">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Method</span>
                <span className="text-[var(--foreground)] capitalize">{payment.payment_method}</span>
              </div>
            </div>

            {/* Refund Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Refund Amount
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setUseFullAmount(true)}
                  className={`w-full py-3 px-4 rounded-xl border-2 transition-colors text-left ${
                    useFullAmount
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-red-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Full Refund</span>
                    <span className="font-bold">${totalPaid.toFixed(2)}</span>
                  </div>
                </button>

                <button
                  onClick={() => setUseFullAmount(false)}
                  className={`w-full py-3 px-4 rounded-xl border-2 transition-colors text-left ${
                    !useFullAmount
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-red-500/50'
                  }`}
                >
                  <span className="font-medium">Partial Refund</span>
                </button>

                {!useFullAmount && (
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">$</span>
                    <Input
                      type="number"
                      min="0.01"
                      max={totalPaid}
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="pl-8"
                      placeholder={`Max: ${totalPaid.toFixed(2)}`}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">
                This will record a refund of <strong>${amountToRefund.toFixed(2)}</strong>.
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!isValidAmount || loading}
                className="flex-1 !bg-red-500 hover:!bg-red-600"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refund ${amountToRefund.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
