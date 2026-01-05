'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui'
import { IconBox } from '@/components/ui/icon-box'
import { useSellerStore } from '@/stores'
import { useTab } from '@/lib/supabase/hooks'
import { ArrowLeft, Receipt, CheckCircle } from 'lucide-react'

export default function ViewTabPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const { isLoggedIn } = useSellerStore()
  const { tab, loading, markPaid } = useTab(groupId)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/seller')
    }
  }, [isLoggedIn, router])

  async function handleMarkPaid() {
    if (!tab) return
    const success = await markPaid()
    if (success) {
      router.push('/seller/groups')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!tab) {
    return (
      <div className="p-4">
        <p className="text-center text-[var(--muted-foreground)]">Tab not found</p>
      </div>
    )
  }

  const isPaid = tab.status === 'paid'

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gradient-gold">
            View Tab
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Group #{groupId.slice(0, 6)}
          </p>
        </div>
        <Badge variant={isPaid ? 'paid' : 'active'}>
          {isPaid ? 'Paid' : 'Open'}
        </Badge>
      </motion.div>

      {/* Tab Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-glass mb-4">
          <div className="p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
              <IconBox color="gold" size="sm">
                <Receipt className="w-4 h-4" />
              </IconBox>
              <span className="font-semibold text-[var(--foreground)]">
                Tab Items
              </span>
            </div>
          </div>

          {tab.tab_items.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              No items yet
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {tab.tab_items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="p-4 flex justify-between items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {item.product?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      ${item.unit_price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gradient-gold">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Total */}
      <motion.div
        className="card-glass rounded-xl mb-4 glow-gold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 flex justify-between items-center">
          <span className="text-lg text-[var(--foreground)]">Total</span>
          <span className="text-3xl font-bold text-gradient-gold font-serif">${tab.total.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Actions */}
      {!isPaid && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[var(--card-border)] shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => router.push(`/seller/groups/${groupId}`)}
            >
              Add More Items
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleMarkPaid}
              disabled={tab.tab_items.length === 0}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Paid
            </Button>
          </div>
        </motion.div>
      )}

      {isPaid && (
        <motion.div
          className="badge-success rounded-lg p-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">This tab has been paid</p>
          {tab.paid_at && (
            <p className="text-sm mt-1 opacity-80">
              {new Date(tab.paid_at).toLocaleString()}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
