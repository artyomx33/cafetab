'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useDailyPaymentStats, usePaymentHistory, useSellers, useCreateRefund } from '@/lib/supabase/hooks'
import { useToast } from '@/components/ui/toast'
import { RefundModal } from '@/components/ui/refund-modal'
import { DollarSign, CreditCard, Banknote, TrendingUp, Users, Calendar, Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

export default function PaymentsPage() {
  const { restaurantId, formatPrice, loading: restaurantLoading } = useRestaurant()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showSellerStats, setShowSellerStats] = useState(true)
  const [methodFilter, setMethodFilter] = useState<'all' | 'card' | 'cash'>('all')
  const [sellerFilter, setSellerFilter] = useState<string | null>(null)

  const { stats, loading: statsLoading, refresh: refreshStats } = useDailyPaymentStats(restaurantId || '', selectedDate)
  const { sellers } = useSellers(restaurantId || undefined)
  const { createRefund, loading: refundLoading } = useCreateRefund()
  const toast = useToast()
  const [refundPayment, setRefundPayment] = useState<typeof payments[0] | null>(null)

  // Build date filters
  const startOfDay = `${selectedDate}T00:00:00`
  const endOfDay = `${selectedDate}T23:59:59`

  const { payments, loading: paymentsLoading, refresh: refreshPayments } = usePaymentHistory(restaurantId || '', {
    date_from: startOfDay,
    date_to: endOfDay,
    payment_method: methodFilter === 'all' ? null : methodFilter,
    seller_id: sellerFilter
  })

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const handleRefundClick = (payment: typeof payments[0]) => {
    setRefundPayment(payment)
  }

  const handleRefundConfirm = async (amount: number) => {
    if (!refundPayment) return

    try {
      const sellerId = refundPayment.processed_by || sellers[0]?.id
      if (!sellerId) {
        toast.error('No seller available to process refund')
        return
      }

      await createRefund({
        original_transaction_id: refundPayment.id,
        amount: amount,
        processed_by: sellerId,
        notes: `Refund for payment on Table ${refundPayment.tab?.table?.number || 'N/A'}`
      })

      toast.success(`Refunded $${amount.toFixed(2)}`)
      setRefundPayment(null)
      refreshPayments()
      refreshStats()
    } catch (err) {
      console.error('Refund failed:', err)
      toast.error('Failed to process refund')
    }
  }

  if (restaurantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Track revenue, tips, and payment history</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[var(--card)] rounded-xl p-1">
          <button
            onClick={() => handleDateChange(-1)}
            className="px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
          >
            ←
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="text-[var(--foreground)] font-medium">{formatDate(selectedDate)}</span>
          </div>
          <button
            onClick={() => handleDateChange(1)}
            disabled={selectedDate === new Date().toISOString().split('T')[0]}
            className="px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Total Revenue */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--gold-500)]/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[var(--gold-500)]" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {statsLoading ? '...' : formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {stats.paymentCount} payment{stats.paymentCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Cash */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Cash</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {statsLoading ? '...' : formatPrice(stats.cashTotal)}
          </p>
        </div>

        {/* Card */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Card</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {statsLoading ? '...' : formatPrice(stats.cardTotal)}
          </p>
        </div>

        {/* Tips */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Total Tips</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {statsLoading ? '...' : formatPrice(stats.tipsTotal)}
          </p>
        </div>
      </motion.div>

      {/* Seller Tips Breakdown */}
      <motion.div
        className="card-glass rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={() => setShowSellerStats(!showSellerStats)}
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--muted)]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[var(--gold-500)]" />
            <span className="font-semibold text-white">Seller Performance</span>
            {stats.sellerStats.length > 0 && (
              <span className="text-sm text-[var(--muted-foreground)]">
                Top: {stats.sellerStats[0]?.seller_name} ({formatPrice(stats.sellerStats[0]?.tips)} tips)
              </span>
            )}
          </div>
          {showSellerStats ? (
            <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
          )}
        </button>

        {showSellerStats && (
          <div className="border-t border-[var(--card-border)]">
            {stats.sellerStats.length === 0 ? (
              <div className="p-6 text-center text-[var(--muted-foreground)]">
                No payments recorded yet
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Seller</th>
                    <th className="text-center p-4 text-sm font-medium text-[var(--muted-foreground)]">Bills</th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Revenue</th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Tips</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sellerStats.map((seller, idx) => (
                    <tr
                      key={seller.seller_id}
                      className={`border-b border-[var(--card-border)]/50 ${idx === 0 ? 'bg-[var(--gold-500)]/5' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {idx === 0 && <span className="text-[var(--gold-500)]">👑</span>}
                          <span className="text-white font-medium">{seller.seller_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-[var(--foreground)]">{seller.count}</td>
                      <td className="p-4 text-right text-[var(--foreground)]">{formatPrice(seller.revenue)}</td>
                      <td className="p-4 text-right">
                        <span className="text-purple-400 font-semibold">{formatPrice(seller.tips)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      <motion.div
        className="card-glass rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Filters */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Payment History
          </h2>
          <div className="flex items-center gap-2">
            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as 'all' | 'card' | 'cash')}
              className="bg-[var(--muted)] text-[var(--foreground)] text-sm rounded-lg px-3 py-2 border-none focus:ring-1 focus:ring-[var(--gold-500)]"
            >
              <option value="all">All Methods</option>
              <option value="card">Card Only</option>
              <option value="cash">Cash Only</option>
            </select>

            {/* Seller Filter */}
            <select
              value={sellerFilter || ''}
              onChange={(e) => setSellerFilter(e.target.value || null)}
              className="bg-[var(--muted)] text-[var(--foreground)] text-sm rounded-lg px-3 py-2 border-none focus:ring-1 focus:ring-[var(--gold-500)]"
            >
              <option value="">All Sellers</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {paymentsLoading ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Time</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Table</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Amount</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Tip</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Total</th>
                  <th className="text-center p-4 text-sm font-medium text-[var(--muted-foreground)]">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Seller</th>
                  <th className="text-center p-4 text-sm font-medium text-[var(--muted-foreground)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--muted)]/20">
                    <td className="p-4 text-[var(--foreground)]">{formatTime(payment.created_at)}</td>
                    <td className="p-4 text-[var(--foreground)]">
                      {payment.tab?.table?.number || '-'}
                    </td>
                    <td className="p-4 text-right text-[var(--foreground)]">
                      {formatPrice(Number(payment.amount))}
                    </td>
                    <td className="p-4 text-right">
                      {Number(payment.tip_amount) > 0 ? (
                        <span className="text-purple-400">{formatPrice(Number(payment.tip_amount))}</span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-semibold text-white">
                      {formatPrice(Number(payment.amount) + Number(payment.tip_amount || 0))}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        payment.payment_method === 'card'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {payment.payment_method === 'card' ? (
                          <CreditCard className="w-3 h-3" />
                        ) : (
                          <Banknote className="w-3 h-3" />
                        )}
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--foreground)]">
                      {payment.seller?.name || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRefundClick(payment)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Refund this payment"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Refund
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={!!refundPayment}
        onClose={() => setRefundPayment(null)}
        payment={refundPayment}
        onConfirm={handleRefundConfirm}
        loading={refundLoading}
      />
    </div>
  )
}
