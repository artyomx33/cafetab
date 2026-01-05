'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from '@/lib/supabase/hooks'
import { ListRow } from '@/components/ui/list-row'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, Plus, Utensils, X, QrCode } from 'lucide-react'
import type { Table, TableStatus } from '@/types'

export default function TablesPage() {
  const { tables, loading, refresh } = useTables()
  const { create: createTable } = useCreateTable()
  const { update: updateTable } = useUpdateTable()
  const { deleteTable } = useDeleteTable()

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Create/Edit dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [tableSection, setTableSection] = useState('')
  const [tableStatus, setTableStatus] = useState<TableStatus>('available')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // QR Code dialog state
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const openCreateDialog = () => {
    setEditingTable(null)
    setTableNumber('')
    setTableSection('')
    setTableStatus('available')
    setShowDialog(true)
  }

  const openEditDialog = (table: Table) => {
    setEditingTable(table)
    setTableNumber(table.number)
    setTableSection(table.section || '')
    setTableStatus(table.status)
    setShowDialog(true)
  }

  const openQRDialog = (table: Table) => {
    setSelectedTable(table)
    setShowQRDialog(true)
  }

  const handleSubmit = async () => {
    if (!tableNumber.trim()) return

    setIsSubmitting(true)
    try {
      if (editingTable) {
        await updateTable(editingTable.id, {
          number: tableNumber,
          section: tableSection || null,
          status: tableStatus
        })
      } else {
        await createTable(tableNumber, tableSection || undefined)
      }
      setShowDialog(false)
      refresh()
    } catch (err) {
      console.error('Failed to save table:', err)
      alert('Failed to save table. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (table: Table) => {
    if (table.current_tab_id) {
      alert('Cannot delete table with active tab')
      return
    }

    if (!confirm(`Are you sure you want to delete Table ${table.number}?`)) {
      return
    }

    try {
      await deleteTable(table.id)
      refresh()
    } catch (err) {
      console.error('Failed to delete table:', err)
      alert('Failed to delete table. Please try again.')
    }
  }

  // Filter tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.section && table.section.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filter === 'all') return matchesSearch
    if (filter === 'available') return matchesSearch && table.status === 'available'
    if (filter === 'occupied') return matchesSearch && table.status === 'occupied'
    return matchesSearch
  })

  const filterOptions = [
    { id: 'all', label: 'All', count: tables.length },
    { id: 'available', label: 'Available', count: tables.filter(t => t.status === 'available').length },
    { id: 'occupied', label: 'Occupied', count: tables.filter(t => t.status === 'occupied').length },
  ]

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', variant: 'success' as const }
      case 'occupied':
        return { label: 'Occupied', variant: 'gold' as const }
      case 'reserved':
        return { label: 'Reserved', variant: 'muted' as const }
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Tables</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage restaurant tables</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          Add Table
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
          placeholder="Search tables or sections..."
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

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-[var(--muted-foreground)]">Loading tables...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-[var(--muted-foreground)]">No tables found</p>
          </div>
        ) : (
          filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              className="card-glass rounded-xl p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              {/* Table Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--teal-500)] to-[var(--teal-600)] flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Table {table.number}</h3>
                    {table.section && (
                      <p className="text-sm text-[var(--muted-foreground)]">{table.section}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                  table.status === 'available'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : table.status === 'occupied'
                    ? 'bg-[var(--gold-500)]/20 text-[var(--gold-400)] border-[var(--gold-500)]/30'
                    : 'bg-[var(--charcoal-700)]/50 text-[var(--muted-foreground)] border-[var(--charcoal-600)]/30'
                }`}>
                  {table.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openQRDialog(table)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
                <button
                  onClick={() => openEditDialog(table)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table)}
                  disabled={!!table.current_tab_id}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Table Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingTable ? 'Edit Table' : 'Add New Table'}
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
                Table Number
              </label>
              <Input
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g., 1, A1, Patio-5"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Section (Optional)
              </label>
              <Input
                value={tableSection}
                onChange={(e) => setTableSection(e.target.value)}
                placeholder="e.g., Main Floor, Patio, Bar"
              />
            </div>

            {editingTable && (
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Status
                </label>
                <select
                  value={tableStatus}
                  onChange={(e) => setTableStatus(e.target.value as TableStatus)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 transition-all"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
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
              disabled={isSubmitting || !tableNumber.trim()}
            >
              {isSubmitting ? 'Saving...' : editingTable ? 'Save Changes' : 'Create Table'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Table {selectedTable?.number} QR Code
            </h2>
            <button
              onClick={() => setShowQRDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {selectedTable && (
            <div className="space-y-4">
              <div className="flex justify-center p-6 bg-white rounded-xl">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">QR Code Display</p>
                  <p className="text-sm text-gray-500">Install qrcode.react to display QR codes</p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">npm install qrcode.react</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  QR Code: <span className="font-mono text-white">{selectedTable.qr_code}</span>
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(selectedTable.qr_code)
                  alert('QR code copied to clipboard!')
                }}
              >
                Copy QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
