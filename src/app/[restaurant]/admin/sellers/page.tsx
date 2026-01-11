'use client'

import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card } from '@/components/ui'
import { Users, Key } from 'lucide-react'

export default function AdminSellersPage() {
  const { restaurant, usesDatabase, getSellers } = useRestaurant()

  const sellers = getSellers()

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Staff</h1>
        <p className="text-[var(--muted-foreground)]">
          {sellers.length} staff members
        </p>
      </motion.div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellers.map((seller, index) => (
          <motion.div
            key={seller.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-glass p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center text-xl font-bold text-[var(--charcoal-900)]">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{seller.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {seller.name.toLowerCase().includes('admin') ? 'Administrator' : 'Server'}
                  </p>
                </div>
              </div>

              {!usesDatabase && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] bg-[var(--charcoal-800)] rounded-lg p-3">
                  <Key className="w-4 h-4" />
                  <span>PIN: {seller.pin}</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {sellers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No staff configured</p>
        </div>
      )}

      {!usesDatabase && (
        <motion.div
          className="mt-8 p-6 bg-[var(--charcoal-800)] rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold mb-2">Demo Mode</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Use these PINs to log in as staff at the seller portal.
          </p>
        </motion.div>
      )}
    </div>
  )
}
