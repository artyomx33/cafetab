'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useDemoStore } from '@/stores/demo-store'
import { Card } from '@/components/ui'
import { UtensilsCrossed, QrCode } from 'lucide-react'

export default function AdminTablesPage() {
  const { restaurant, slug, usesDatabase, formatPrice, getTables } = useRestaurant()

  // Demo mode store
  const { tables: demoTables, initializeRestaurant } = useDemoStore()

  // Initialize demo store
  useEffect(() => {
    if (!usesDatabase) {
      initializeRestaurant(slug, getTables())
    }
  }, [usesDatabase, slug, getTables, initializeRestaurant])

  const tables = usesDatabase ? [] : demoTables
  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const availableCount = tables.filter(t => t.status === 'available').length

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Tables</h1>
        <p className="text-[var(--muted-foreground)]">
          {tables.length} tables • {availableCount} available • {occupiedCount} occupied
        </p>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`card-glass p-6 ${
              table.status === 'occupied'
                ? 'border-l-4 border-l-[var(--gold-500)]'
                : 'border-l-4 border-l-[var(--teal-500)]'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Table {table.number}</h3>
                  {table.section && (
                    <p className="text-sm text-[var(--muted-foreground)]">{table.section}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  table.status === 'occupied'
                    ? 'bg-[var(--gold-500)]/20 text-[var(--gold-400)]'
                    : 'bg-[var(--teal-500)]/20 text-[var(--teal-400)]'
                }`}>
                  {table.status}
                </span>
              </div>

              {table.current_tab && (
                <div className="mb-4 p-3 bg-[var(--charcoal-800)] rounded-lg">
                  <p className="text-sm text-[var(--muted-foreground)]">Current Tab</p>
                  <p className="text-xl font-bold text-gradient-gold">
                    {formatPrice(table.current_tab.total)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {table.current_tab.items.length} items
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <QrCode className="w-4 h-4" />
                <code className="font-mono">{table.qr_code}</code>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">
            {usesDatabase ? 'No tables found in database' : 'No tables configured'}
          </p>
        </div>
      )}
    </div>
  )
}
