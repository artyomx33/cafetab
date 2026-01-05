'use client'

import { use, useState } from 'react'
import { motion } from 'motion/react'
import { useGroupByCode, useTab } from '@/lib/supabase/hooks'
import { ShoppingBag, CreditCard, CheckCircle } from 'lucide-react'
import { IconBox } from '@/components/ui/icon-box'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{
    code: string
  }>
}

export default function TabPage({ params }: PageProps) {
  const { code } = use(params)
  const { group, tab, loading, error } = useGroupByCode(code)
  const { markPaid } = useTab(group?.id || '')
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  const handlePay = async () => {
    if (!tab || isPaying) return
    setIsPaying(true)
    try {
      await markPaid()
      setIsPaid(true)
    } catch (err) {
      console.error('Payment failed:', err)
      alert('Payment failed. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !group || !tab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Group not found</h1>
          <p className="text-[var(--muted-foreground)]">The code you entered is invalid.</p>
        </motion.div>
      </div>
    )
  }

  const hasItems = tab.tab_items.length > 0

  // Calculate subtotal
  const subtotal = tab.tab_items.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="glass px-6 py-8 border-b border-[var(--card-border)]">
        <div className="max-w-2xl mx-auto">
          <motion.h1
            className="text-3xl font-bold text-gradient-gold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            GolfTab
          </motion.h1>
          <motion.p
            className="text-lg text-[var(--foreground)] mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {group.name}
          </motion.p>
          <motion.p
            className="text-sm text-[var(--muted-foreground)] mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Code: {group.client_code}
          </motion.p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {!hasItems ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <IconBox color="gold" size="xl" className="mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </IconBox>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
              No items yet
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Your tab is empty. Items will appear here once your seller adds them.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Items List */}
            <motion.div
              className="card-glass rounded-xl overflow-hidden divide-y divide-[var(--card-border)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {tab.tab_items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="px-6 py-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--foreground)] text-lg">
                        {item.product?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        ${item.unit_price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg text-[var(--foreground)]">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Total */}
            <motion.div
              className="card-glass rounded-xl px-6 py-6 glow-gold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-[var(--foreground)]">
                  Total
                </span>
                <span className="text-3xl font-bold text-gradient-gold font-serif">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </motion.div>

            {/* Payment Section */}
            {isPaid ? (
              <motion.div
                className="card-glass rounded-xl px-6 py-6 text-center glow-teal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <IconBox color="teal" size="lg" className="mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </IconBox>
                <p className="font-semibold text-lg text-[var(--foreground)]">
                  Tab Paid!
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Thank you for your purchase
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="card-glass rounded-xl px-6 py-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  size="large"
                  className="w-full gap-3"
                  onClick={handlePay}
                  disabled={isPaying}
                >
                  <IconBox color="teal" size="sm">
                    <CreditCard className="w-4 h-4" />
                  </IconBox>
                  {isPaying ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-3">
                  Tap to confirm payment to your seller
                </p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
