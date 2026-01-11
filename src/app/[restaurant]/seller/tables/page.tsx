'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { TableCard } from '@/components/ui/table-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { useSellerStore } from '@/stores/seller-store'
import { useTables, useCreateTable } from '@/lib/supabase/hooks'
import { useDemoStore } from '@/stores/demo-store'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Plus } from 'lucide-react'

export default function SellerTablesPage() {
  const router = useRouter()
  const { restaurant, slug, usesDatabase, getTables } = useRestaurant()
  const { seller, isLoggedIn } = useSellerStore()

  // Database mode hooks
  const { tables: dbTables, loading: dbLoading, refresh: dbRefresh } = useTables()
  const { create, loading: isCreating } = useCreateTable()

  // Demo mode store
  const { tables: demoTables, initializeRestaurant } = useDemoStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newTableSection, setNewTableSection] = useState('Main')
  const [error, setError] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('All')

  // Initialize demo store
  useEffect(() => {
    if (!usesDatabase) {
      initializeRestaurant(slug, getTables())
    }
  }, [usesDatabase, slug, getTables, initializeRestaurant])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/${slug}/seller`)
    }
  }, [isLoggedIn, router, slug])

  const isLoading = usesDatabase ? dbLoading : false
  const tables = usesDatabase ? dbTables : demoTables

  const handleCreateTable = async () => {
    if (!newTableNumber.trim()) {
      setError('Table number is required')
      return
    }

    if (!usesDatabase) {
      setError('Cannot create tables in demo mode')
      return
    }

    setError('')

    try {
      await create(newTableNumber, newTableSection)
      dbRefresh()
      setIsDialogOpen(false)
      setNewTableNumber('')
      setNewTableSection('Main')
    } catch {
      setError('Failed to create table. Please try again.')
    }
  }

  const handleTableClick = (tableId: string) => {
    router.push(`/${slug}/seller/tables/${tableId}`)
  }

  if (!isLoggedIn) {
    return null
  }

  // Get unique sections from tables
  const allSections = new Set(tables.map(t => t.section || 'Other'))
  const sections = ['All', ...Array.from(allSections)]

  // Filter tables by section
  const filteredTables = selectedSection === 'All'
    ? tables
    : tables.filter(t => (t.section || 'Other') === selectedSection)

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Tables
          </h2>
          {!usesDatabase && (
            <span className="px-2 py-1 text-xs bg-[var(--teal-500)]/20 text-[var(--teal-400)] rounded-full">
              Demo Mode
            </span>
          )}
        </div>

        {/* Create Table Button - Only for database mode */}
        {usesDatabase && seller && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-4"
          >
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="large"
              className="w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Table
            </Button>
          </motion.div>
        )}

        {/* Section Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedSection === section
                  ? 'bg-[var(--gold-500)] text-[var(--background)]'
                  : 'bg-[#1A1A1E] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[var(--muted-foreground)]">Loading tables...</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <motion.div
          className="flex items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[var(--muted-foreground)]">
            {selectedSection === 'All'
              ? 'No tables found.'
              : `No tables in ${selectedSection} section.`
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TableCard
                tableNumber={table.number}
                section={table.section || undefined}
                status={table.status}
                currentTabTotal={table.current_tab?.total}
                onClick={() => handleTableClick(table.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Table Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          title="Create New Table"
          description="Enter table details"
        >
          <DialogClose onClick={() => setIsDialogOpen(false)} />

          <div className="space-y-4">
            <Input
              placeholder="Table number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTable()
                }
              }}
            />

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Section
              </label>
              <select
                value={newTableSection}
                onChange={(e) => setNewTableSection(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="Inside">Inside</option>
                <option value="Bar">Bar</option>
                <option value="Patio">Patio</option>
                <option value="Main">Main</option>
              </select>
            </div>

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
                  setNewTableNumber('')
                  setNewTableSection('Main')
                  setError('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTable}
                disabled={isCreating || !newTableNumber.trim()}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
