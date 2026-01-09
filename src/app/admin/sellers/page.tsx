'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useAllSellers } from '@/lib/supabase/hooks'
import { ListRow, ListAvatar } from '@/components/ui/list-row'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Search, UserPlus, ShoppingCart, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { Seller } from '@/types'

export default function SellersPage() {
  const { sellers, loading, createSeller, updateSeller } = useAllSellers()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingSeller, setEditingSeller] = useState<(Seller & { totalSales: number; itemsSold: number }) | null>(null)
  const [sellerName, setSellerName] = useState('')
  const [sellerPin, setSellerPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateDialog = () => {
    setEditingSeller(null)
    setSellerName('')
    setSellerPin('')
    setShowDialog(true)
  }

  const openEditDialog = (seller: Seller & { totalSales: number; itemsSold: number }) => {
    setEditingSeller(seller)
    setSellerName(seller.name)
    setSellerPin('')
    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!sellerName.trim()) return
    if (!editingSeller && !sellerPin.trim()) return

    setIsSubmitting(true)
    try {
      if (editingSeller) {
        await updateSeller(editingSeller.id, { name: sellerName })
      } else {
        await createSeller(sellerName, sellerPin)
      }
      setShowDialog(false)
    } catch (err) {
      console.error('Failed to save seller:', err)
      toast.error('Failed to save seller. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && seller.itemsSold > 0
    if (filter === 'inactive') return matchesSearch && seller.itemsSold === 0
    return matchesSearch
  })

  const filterOptions = [
    { id: 'all', label: 'All', count: sellers.length },
    { id: 'active', label: 'Active', count: sellers.filter(s => s.itemsSold > 0).length },
    { id: 'inactive', label: 'Inactive', count: sellers.filter(s => s.itemsSold === 0).length },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Sellers</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage seller accounts and performance</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <UserPlus className="w-4 h-4" />
          Add Seller
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 focus:shadow-[0_0_15px_rgba(201,169,98,0.1)] transition-all"
        />
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={setFilter}
        />
      </motion.div>

      {/* Sellers List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted-foreground)]">Loading sellers...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted-foreground)]">No sellers found</p>
          </div>
        ) : (
          filteredSellers.map((seller, index) => (
            <ListRow
              key={seller.id}
              index={index}
              onClick={() => openEditDialog(seller)}
              avatar={<ListAvatar fallback={seller.name} size="md" />}
              title={seller.name}
              code={seller.id.slice(0, 8).toUpperCase()}
              badges={[
                seller.itemsSold > 0
                  ? { label: 'Active', variant: 'success' as const }
                  : { label: 'Inactive', variant: 'muted' as const },
                ...(index < 3 ? [{ label: `#${index + 1} Top Seller`, variant: 'gold' as const }] : []),
              ]}
              subtitle={`Member since ${new Date(seller.created_at).toLocaleDateString()}`}
              stat={{
                icon: <ShoppingCart className="w-4 h-4" />,
                value: seller.itemsSold,
                color: 'teal',
              }}
              rightContent={
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Sales</p>
                  <p className="text-lg font-bold text-[var(--gold-400)]">
                    ${seller.totalSales.toFixed(2)}
                  </p>
                </div>
              }
            />
          ))
        )}
      </div>

      {/* Add/Edit Seller Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingSeller ? 'Edit Seller' : 'Add New Seller'}
            </h2>
            <button
              onClick={() => setShowDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Seller Name
              </label>
              <Input
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Enter seller name"
              />
            </div>

            {!editingSeller && (
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  PIN Code
                </label>
                <Input
                  type="password"
                  value={sellerPin}
                  onChange={(e) => setSellerPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !sellerName.trim() || (!editingSeller && !sellerPin.trim())}
            >
              {isSubmitting ? 'Saving...' : editingSeller ? 'Save Changes' : 'Create Seller'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
