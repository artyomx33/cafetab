'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useSellerStore } from '@/stores/seller-store'
import { useTableById, useTabByTableId, useOpenTab } from '@/lib/supabase/hooks'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { ArrowLeft, Plus } from 'lucide-react'

export default function TableDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const tableId = params.tableId as string

  const { restaurant, slug, formatPrice, loading: restaurantLoading } = useRestaurant()
  const { seller, isLoggedIn } = useSellerStore()

  // Database hooks
  const { table, loading: tableLoading } = useTableById(tableId)
  const { tab, loading: tabLoading } = useTabByTableId(tableId)
  const { openTab, loading: openingTab } = useOpenTab()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTabType, setSelectedTabType] = useState<'regular' | 'prepaid'>('regular')
  const [prepaidAmount, setPrepaidAmount] = useState('')
  const [error, setError] = useState('')

  const isLoading = restaurantLoading || tableLoading || tabLoading

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(`/${slug}/seller`)
    }
  }, [isLoggedIn, isLoading, router, slug])

  const handleOpenTab = async () => {
    if (!seller || !table) return

    // Validate prepaid amount if prepaid tab
    if (selectedTabType === 'prepaid') {
      const amount = parseFloat(prepaidAmount)
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid prepaid amount')
        return
      }
    }

    setError('')

    try {
      const amount = selectedTabType === 'prepaid' ? parseFloat(prepaidAmount) : undefined
      await openTab(tableId, selectedTabType, seller.id, amount)
      router.push(`/${slug}/seller/tables/${tableId}/tab`)
    } catch {
      setError('Failed to open tab. Please try again.')
    }
  }

  const handleViewTab = () => {
    router.push(`/${slug}/seller/tables/${tableId}/tab`)
  }

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--muted-foreground)]">Loading...</p>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="p-6">
        <p className="text-center text-[var(--muted-foreground)]">Table not found</p>
        <Button
          variant="ghost"
          onClick={() => router.push(`/${slug}/seller/tables`)}
          className="mt-4 mx-auto block"
        >
          Back to Tables
        </Button>
      </div>
    )
  }

  const hasActiveTab = table.status === 'occupied' && tab

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${slug}/seller/tables`)}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Table {table.number}
            </h1>
            {table.section && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {table.section}
              </p>
            )}
          </div>
          <Badge variant={table.status === 'available' ? 'active' : table.status === 'occupied' ? 'paid' : 'closed'}>
            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
          </Badge>
        </div>
      </motion.div>

      {/* Table Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Current Tab Info */}
        {hasActiveTab ? (
          <Card className="card-glass p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--foreground)]">
              Active Tab
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Type</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {tab.type === 'prepaid' ? 'Prepaid' : 'Regular'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Current Total</span>
                <span className="text-2xl font-bold text-gradient-gold font-serif">
                  {formatPrice(tab.total)}
                </span>
              </div>
              {tab.type === 'prepaid' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-foreground)]">Prepaid Amount</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatPrice(tab.prepaid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--card-border)]">
                    <span className="text-[var(--muted-foreground)]">Balance</span>
                    <span className={`text-xl font-bold ${tab.balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      {formatPrice(tab.balance)}
                    </span>
                  </div>
                </>
              )}
              <div className="pt-4">
                <Button
                  onClick={handleViewTab}
                  className="w-full"
                  size="large"
                >
                  View & Manage Tab
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="card-glass p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--foreground)]">
              No Active Tab
            </h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              This table is available. Open a new tab to get started.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full"
              size="large"
            >
              <Plus className="w-5 h-5 mr-2" />
              Open Tab
            </Button>
          </Card>
        )}

        {/* QR Code Info */}
        <Card className="card-glass p-6">
          <h3 className="text-lg font-bold mb-4 text-[var(--foreground)]">
            QR Code
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] font-mono break-all">
            {table.qr_code}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Customers can scan this or enter at: /{slug}/table/{table.qr_code}
          </p>
        </Card>
      </motion.div>

      {/* Open Tab Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          title="Open New Tab"
          description="Choose tab type"
        >
          <DialogClose onClick={() => setIsDialogOpen(false)} />

          <div className="space-y-4">
            {/* Tab Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Tab Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTabType('regular')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTabType === 'regular'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] bg-[#1A1A1E]'
                  }`}
                >
                  <div className="font-semibold text-[var(--foreground)]">Regular</div>
                  <div className="text-sm text-[var(--muted-foreground)] mt-1">
                    Pay at the end
                  </div>
                </button>
                <button
                  onClick={() => setSelectedTabType('prepaid')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTabType === 'prepaid'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] bg-[#1A1A1E]'
                  }`}
                >
                  <div className="font-semibold text-[var(--foreground)]">Prepaid</div>
                  <div className="text-sm text-[var(--muted-foreground)] mt-1">
                    Load balance first
                  </div>
                </button>
              </div>
            </div>

            {/* Prepaid Amount Input */}
            {selectedTabType === 'prepaid' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                  Initial Amount ({restaurant?.currency_symbol || '$'})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={prepaidAmount}
                  onChange={(e) => setPrepaidAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleOpenTab()
                    }
                  }}
                />
              </div>
            )}

            {error && (
              <motion.div
                className="badge-error rounded-lg px-4 py-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedTabType('regular')
                  setPrepaidAmount('')
                  setError('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOpenTab}
                disabled={openingTab || (selectedTabType === 'prepaid' && !prepaidAmount)}
                className="flex-1"
              >
                {openingTab ? 'Opening...' : 'Open Tab'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
