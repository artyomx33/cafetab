'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, useSellers, useOpenTab } from '@/lib/supabase/hooks'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SellerSelectModal } from '@/components/ui/seller-select-modal'
import { TabTypeModal } from '@/components/ui/tab-type-modal'
import { OrderDrawer } from '@/components/ui/order-drawer'
import { CloseTabModal } from '@/components/ui/close-tab-modal'
import { Search, Plus, Utensils, X, QrCode, ShoppingCart, Receipt } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useToast } from '@/components/ui/toast'
import { computeTableStatus, getStatusPulseClass, type TableStatusInput } from '@/lib/utils/table-status'
import type { Table, TableStatus, Seller, Tab, TableWithTab } from '@/types'

export default function AdminTablesPage() {
  const { restaurantId, slug, formatPrice, loading: restaurantLoading } = useRestaurant()
  const { tables, loading, refresh } = useTables(restaurantId || undefined)
  const { create: createTable } = useCreateTable()
  const { update: updateTable } = useUpdateTable()
  const { deleteTable } = useDeleteTable()
  const { sellers, loading: sellersLoading } = useSellers(restaurantId || undefined)
  const { openTab } = useOpenTab()
  const toast = useToast()

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

  // Order flow state
  const [orderTable, setOrderTable] = useState<Table | null>(null)
  const [showSellerModal, setShowSellerModal] = useState(false)
  const [showOrderDrawer, setShowOrderDrawer] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [orderTab, setOrderTab] = useState<Tab | null>(null)

  // Tab type modal state (for new tabs)
  const [showTabTypeModal, setShowTabTypeModal] = useState(false)
  const [pendingTable, setPendingTable] = useState<Table | null>(null)
  const [pendingSeller, setPendingSeller] = useState<Seller | null>(null)

  // Close tab modal state
  const [showCloseTabModal, setShowCloseTabModal] = useState(false)
  const [closeTabTable, setCloseTabTable] = useState<TableWithTab | null>(null)
  const [closeTabSeller, setCloseTabSeller] = useState<Seller | null>(null)
  const [isClosingTab, setIsClosingTab] = useState(false)

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
      toast.error('Failed to save table. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (table: Table) => {
    if (table.current_tab_id) {
      toast.error('Cannot delete table with active tab')
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
      toast.error('Failed to delete table. Please try again.')
    }
  }

  // Order flow handlers
  const handleTableClick = (table: Table) => {
    setOrderTable(table)
    setShowSellerModal(true)
  }

  const handleSellerSelect = async (seller: Seller) => {
    if (!orderTable) return

    setSelectedSeller(seller)
    setShowSellerModal(false)

    // If we're closing a tab, show the close tab modal instead
    if (isClosingTab && closeTabTable) {
      setCloseTabSeller(seller)
      setShowCloseTabModal(true)
      setIsClosingTab(false)
      setOrderTable(null)
      return
    }

    try {
      // Check if table already has an open tab
      if (orderTable.current_tab_id) {
        // Fetch the existing tab
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: existingTab } = await supabase
          .from('cafe_tabs')
          .select('*')
          .eq('id', orderTable.current_tab_id)
          .single()

        if (existingTab) {
          setOrderTab(existingTab as Tab)
          setShowOrderDrawer(true)
          return
        }
      }

      // New table - ask for tab type first
      setPendingTable(orderTable)
      setPendingSeller(seller)
      setShowTabTypeModal(true)
    } catch (err) {
      console.error('Failed to check tab:', err)
      toast.error('Failed to start order. Please try again.')
    }
  }

  const handleTabTypeSelect = async (type: 'regular' | 'prepaid', amount?: number) => {
    if (!pendingTable || !pendingSeller) return

    try {
      const newTab = await openTab(pendingTable.id, type, pendingSeller.id, amount)
      setOrderTab(newTab)
      setOrderTable(pendingTable)
      setSelectedSeller(pendingSeller)
      setShowTabTypeModal(false)
      setShowOrderDrawer(true)
      setPendingTable(null)
      setPendingSeller(null)
      refresh()
    } catch (err) {
      console.error('Failed to open tab:', err)
      toast.error('Failed to start order. Please try again.')
    }
  }

  const handleOrderComplete = () => {
    setShowOrderDrawer(false)
    setOrderTable(null)
    setSelectedSeller(null)
    setOrderTab(null)
    refresh()
  }

  const handleCloseDrawer = () => {
    setShowOrderDrawer(false)
    setOrderTable(null)
    setSelectedSeller(null)
    setOrderTab(null)
  }

  const handleBackToSellerSelect = () => {
    setShowOrderDrawer(false)
    setShowSellerModal(true)
  }

  // Close tab flow - first select seller, then show close tab modal
  const handleCloseTabClick = (table: TableWithTab) => {
    setCloseTabTable(table)
    // Use first seller for now, or show seller select
    if (sellers.length === 1) {
      setCloseTabSeller(sellers[0])
      setShowCloseTabModal(true)
    } else {
      // Show seller selection first, set flag to know we're closing tab
      setIsClosingTab(true)
      setOrderTable(table)
      setShowSellerModal(true)
    }
  }

  const handleCloseTabPaymentComplete = () => {
    setShowCloseTabModal(false)
    setCloseTabTable(null)
    setCloseTabSeller(null)
    setIsClosingTab(false)
    refresh()
  }

  // Helper to get pulse ring class for a table
  const getTablePulseClass = (table: TableWithTab): string => {
    const statusInput: TableStatusInput = {
      tabOpenedAt: table.current_tab?.created_at || null,
      lastOrderAt: null,
      tabClosedAt: null,
      tabTotal: table.current_tab?.total || 0,
      paymentState: table.current_tab?.status === 'paid' ? 'closed' :
                    table.current_tab ? 'open' : null,
      hasActiveTab: !!table.current_tab_id,
    }
    const status = computeTableStatus(statusInput)
    return getStatusPulseClass(status)
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

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Loading tables...</div>
      </div>
    )
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
        {filteredTables.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-[var(--muted-foreground)]">No tables found</p>
          </div>
        ) : (
          filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              className={`card-glass rounded-xl p-6 space-y-4 ${getTablePulseClass(table)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              {/* Table Header - dimmed for available tables */}
              <div className={`flex items-start justify-between transition-opacity ${
                !table.current_tab_id ? 'opacity-50' : ''
              }`}>
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

              {/* Order Button - Primary Action */}
              <button
                onClick={() => handleTableClick(table)}
                className={`w-full px-4 py-3 text-sm font-semibold rounded-lg text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                  table.current_tab_id
                    ? 'bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-600)] hover:from-[var(--gold-400)] hover:to-[var(--gold-500)]'
                    : 'bg-gradient-to-r from-[var(--teal-500)] to-[var(--teal-600)] hover:from-[var(--teal-400)] hover:to-[var(--teal-500)]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {table.current_tab_id ? 'Add to Tab' : 'Start Order'}
              </button>

              {/* Close Tab Button - Only shows when tab is open */}
              {table.current_tab_id && table.current_tab && (
                <button
                  onClick={() => handleCloseTabClick(table)}
                  className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Close Tab ({formatPrice(table.current_tab.total)})
                </button>
              )}

              {/* Secondary Actions - dimmed for available tables */}
              <div className={`flex gap-2 transition-opacity ${
                !table.current_tab_id ? 'opacity-60' : ''
              }`}>
                <button
                  onClick={() => openQRDialog(table)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR
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
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}/table/${selectedTable.qr_code}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Table Code: <span className="font-mono text-white">{selectedTable.qr_code}</span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Scan to access table menu
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTable.qr_code)
                    toast.success('Code copied!')
                  }}
                >
                  Copy Code
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${slug}/table/${selectedTable.qr_code}`)
                    toast.success('URL copied!')
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Seller Selection Modal */}
      <SellerSelectModal
        table={orderTable}
        sellers={sellers}
        isOpen={showSellerModal}
        onClose={() => {
          setShowSellerModal(false)
          setOrderTable(null)
          setIsClosingTab(false)
          setCloseTabTable(null)
        }}
        onSelectSeller={handleSellerSelect}
        loading={sellersLoading}
      />

      {/* Tab Type Modal (Regular vs Prepaid) */}
      <TabTypeModal
        isOpen={showTabTypeModal}
        onClose={() => {
          setShowTabTypeModal(false)
          setPendingTable(null)
          setPendingSeller(null)
        }}
        onSelect={handleTabTypeSelect}
        tableNumber={pendingTable?.number}
      />

      {/* Order Drawer */}
      <OrderDrawer
        table={orderTable}
        tab={orderTab}
        seller={selectedSeller}
        isOpen={showOrderDrawer}
        onClose={handleCloseDrawer}
        onBack={handleBackToSellerSelect}
        onOrderComplete={handleOrderComplete}
        restaurantId={restaurantId || undefined}
      />

      {/* Close Tab Modal */}
      {closeTabTable?.current_tab && closeTabSeller && (
        <CloseTabModal
          isOpen={showCloseTabModal}
          onClose={() => {
            setShowCloseTabModal(false)
            setCloseTabTable(null)
            setCloseTabSeller(null)
          }}
          tab={closeTabTable.current_tab}
          seller={closeTabSeller}
          onPaymentComplete={handleCloseTabPaymentComplete}
        />
      )}
    </div>
  )
}
