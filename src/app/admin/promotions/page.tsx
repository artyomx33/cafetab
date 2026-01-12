'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { usePromotions, useAllProducts } from '@/lib/supabase/hooks'
import { ListRow } from '@/components/ui/list-row'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, Plus, Tag, Percent, Gift, Clock, Calendar, X, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { PromotionWithDetails, PromotionType, PromotionScope, PromotionScheduleType } from '@/types'

// Legacy route - hardcoded to Luna for backwards compatibility
const LUNA_RESTAURANT_ID = 'c0000000-0000-0000-0000-000000000001'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

export default function PromotionsPage() {
  const {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    updateTargets,
    updateSchedules
  } = usePromotions(LUNA_RESTAURANT_ID)
  const { products, categories } = useAllProducts(LUNA_RESTAURANT_ID)
  const toast = useToast()

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<PromotionWithDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PromotionType>('percent_off')
  const [value, setValue] = useState('')
  const [buyQuantity, setBuyQuantity] = useState('')
  const [scope, setScope] = useState<PromotionScope>('items')
  const [badgeText, setBadgeText] = useState('')

  // Target selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Schedule state
  const [scheduleType, setScheduleType] = useState<PromotionScheduleType>('always')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const openCreateDialog = () => {
    setEditingPromotion(null)
    setName('')
    setDescription('')
    setType('percent_off')
    setValue('')
    setBuyQuantity('')
    setScope('items')
    setBadgeText('')
    setSelectedCategories([])
    setSelectedProducts([])
    setScheduleType('always')
    setSelectedDays([])
    setStartTime('')
    setEndTime('')
    setStartDate('')
    setEndDate('')
    setShowDialog(true)
  }

  const openEditDialog = (promo: PromotionWithDetails) => {
    setEditingPromotion(promo)
    setName(promo.name)
    setDescription(promo.description || '')
    setType(promo.type)
    setValue(promo.value.toString())
    setBuyQuantity(promo.buy_quantity?.toString() || '')
    setScope(promo.scope)
    setBadgeText(promo.badge_text || '')

    // Set targets
    const catIds = promo.targets.filter(t => t.category_id).map(t => t.category_id!)
    const prodIds = promo.targets.filter(t => t.product_id).map(t => t.product_id!)
    setSelectedCategories(catIds)
    setSelectedProducts(prodIds)

    // Set schedule (use first schedule for simplicity)
    const schedule = promo.schedules[0]
    if (schedule) {
      setScheduleType(schedule.type)
      setSelectedDays(schedule.days_of_week || [])
      setStartTime(schedule.start_time || '')
      setEndTime(schedule.end_time || '')
      setStartDate(schedule.start_date || '')
      setEndDate(schedule.end_date || '')
    } else {
      setScheduleType('always')
    }

    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !value) return

    setIsSubmitting(true)
    try {
      // Build targets based on scope
      const targets: { category_id?: string; product_id?: string }[] = []
      if (scope === 'category') {
        targets.push(...selectedCategories.map(id => ({ category_id: id })))
      } else if (scope === 'items') {
        targets.push(...selectedProducts.map(id => ({ product_id: id })))
      }

      // Build schedule
      const schedules: {
        type: PromotionScheduleType
        days_of_week?: number[]
        start_time?: string
        end_time?: string
        start_date?: string
        end_date?: string
      }[] = []

      if (scheduleType === 'always') {
        schedules.push({ type: 'always' })
      } else if (scheduleType === 'time_window') {
        schedules.push({
          type: 'time_window',
          days_of_week: selectedDays.length > 0 ? selectedDays : undefined,
          start_time: startTime || undefined,
          end_time: endTime || undefined
        })
      } else if (scheduleType === 'day_of_week') {
        schedules.push({
          type: 'day_of_week',
          days_of_week: selectedDays
        })
      } else if (scheduleType === 'date_range') {
        schedules.push({
          type: 'date_range',
          start_date: startDate || undefined,
          end_date: endDate || undefined
        })
      }

      if (editingPromotion) {
        // Update existing promotion
        await updatePromotion(editingPromotion.id, {
          name,
          description: description || null,
          type,
          value: parseFloat(value),
          buy_quantity: type === 'buy_x_get_y' ? parseInt(buyQuantity) || null : null,
          scope,
          badge_text: badgeText || null
        })
        await updateTargets(editingPromotion.id, targets)
        await updateSchedules(editingPromotion.id, schedules)
        toast.success('Promotion updated successfully')
      } else {
        // Create new promotion
        await createPromotion({
          name,
          description: description || undefined,
          type,
          value: parseFloat(value),
          buy_quantity: type === 'buy_x_get_y' ? parseInt(buyQuantity) : undefined,
          scope,
          badge_text: badgeText || undefined,
          targets,
          schedules
        })
        toast.success('Promotion created successfully')
      }
      setShowDialog(false)
    } catch (err) {
      console.error('Failed to save promotion:', err)
      toast.error('Failed to save promotion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      await deletePromotion(promoId)
      toast.success('Promotion deleted')
    } catch (err) {
      console.error('Failed to delete promotion:', err)
      toast.error('Failed to delete promotion')
    }
  }

  const handleToggle = async (promoId: string, isActive: boolean) => {
    try {
      await togglePromotion(promoId, !isActive)
      toast.success(isActive ? 'Promotion deactivated' : 'Promotion activated')
    } catch (err) {
      console.error('Failed to toggle promotion:', err)
      toast.error('Failed to update promotion')
    }
  }

  // Filter promotions
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && promo.is_active
    if (filter === 'inactive') return matchesSearch && !promo.is_active
    return matchesSearch
  })

  const filterOptions = [
    { id: 'all', label: 'All', count: promotions.length },
    { id: 'active', label: 'Active', count: promotions.filter(p => p.is_active).length },
    { id: 'inactive', label: 'Inactive', count: promotions.filter(p => !p.is_active).length },
  ]

  // Helper to format promotion value
  const formatPromoValue = (promo: PromotionWithDetails) => {
    if (promo.type === 'percent_off') {
      return `${promo.value}% off`
    }
    return `Buy ${promo.buy_quantity} Get ${promo.value} Free`
  }

  // Helper to format schedule
  const formatSchedule = (promo: PromotionWithDetails) => {
    const schedule = promo.schedules[0]
    if (!schedule) return 'Always'

    switch (schedule.type) {
      case 'always':
        return 'Always'
      case 'time_window':
        const days = schedule.days_of_week?.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')
        return `${days || 'Daily'} ${schedule.start_time || ''}-${schedule.end_time || ''}`
      case 'day_of_week':
        return schedule.days_of_week?.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ') || 'All days'
      case 'date_range':
        return `${schedule.start_date || 'Start'} to ${schedule.end_date || 'End'}`
      default:
        return 'Custom'
    }
  }

  // Toggle day selection
  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
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
          <h1 className="text-3xl font-bold text-white">Promotions</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Create and manage discounts & special offers</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          Add Promotion
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
          placeholder="Search promotions..."
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

      {/* Promotions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">Loading promotions...</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No promotions found</p>
          <Button className="mt-4" onClick={openCreateDialog}>
            Create Your First Promotion
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPromotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <ListRow
                index={index}
                avatar={
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    promo.type === 'percent_off'
                      ? 'bg-emerald-500/20'
                      : 'bg-purple-500/20'
                  }`}>
                    {promo.type === 'percent_off' ? (
                      <Percent className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Gift className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                }
                title={promo.name}
                badges={[
                  promo.is_active
                    ? { label: 'Active', variant: 'success' as const }
                    : { label: 'Inactive', variant: 'muted' as const },
                  promo.badge_text
                    ? { label: promo.badge_text, variant: 'gold' as const }
                    : null,
                  { label: promo.scope, variant: 'muted' as const }
                ].filter(Boolean) as { label: string; variant: 'success' | 'muted' | 'gold' }[]}
                subtitle={
                  <span className="flex items-center gap-3">
                    <span className="font-medium text-[var(--gold-400)]">{formatPromoValue(promo)}</span>
                    <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <Clock className="w-3 h-3" />
                      {formatSchedule(promo)}
                    </span>
                  </span>
                }
                rightContent={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(promo.id, promo.is_active)
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-[var(--muted-foreground)] hover:text-white transition-colors"
                    >
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(promo)
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-[var(--muted-foreground)] hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(promo.id)
                      }}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
            </h2>
            <button
              onClick={() => setShowDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Basic Info
              </h3>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Promotion Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Happy Hour, Weekend Special"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Description (shown to customers)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for customers"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Badge Text (shown on menu items)
                </label>
                <Input
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g., Happy Hour, DEAL, 20% OFF"
                />
              </div>
            </div>

            {/* Promotion Type */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Discount Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType('percent_off')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    type === 'percent_off'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <Percent className={`w-6 h-6 mb-2 ${type === 'percent_off' ? 'text-[var(--gold-400)]' : 'text-[var(--muted-foreground)]'}`} />
                  <div className="font-medium text-white">Percentage Off</div>
                  <div className="text-xs text-[var(--muted-foreground)]">e.g., 20% off all drinks</div>
                </button>
                <button
                  onClick={() => setType('buy_x_get_y')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    type === 'buy_x_get_y'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <Gift className={`w-6 h-6 mb-2 ${type === 'buy_x_get_y' ? 'text-[var(--gold-400)]' : 'text-[var(--muted-foreground)]'}`} />
                  <div className="font-medium text-white">Buy X Get Y</div>
                  <div className="text-xs text-[var(--muted-foreground)]">e.g., Buy 2 Get 1 Free</div>
                </button>
              </div>

              {/* Value inputs based on type */}
              <div className="grid grid-cols-2 gap-4">
                {type === 'percent_off' ? (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Discount Percentage *
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="20"
                        className="pr-8"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                        Buy Quantity *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(e.target.value)}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                        Get Free *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Scope / Targets */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Apply To
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setScope('items')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    scope === 'items'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <div className="font-medium text-white text-sm">Specific Items</div>
                </button>
                <button
                  onClick={() => setScope('category')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    scope === 'category'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <div className="font-medium text-white text-sm">Categories</div>
                </button>
                <button
                  onClick={() => setScope('order')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    scope === 'order'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <div className="font-medium text-white text-sm">Entire Order</div>
                </button>
              </div>

              {/* Product selection */}
              {scope === 'items' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                    Select Products
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1 p-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E]">
                    {products.map(product => (
                      <label key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => [...prev, product.id])
                            } else {
                              setSelectedProducts(prev => prev.filter(id => id !== product.id))
                            }
                          }}
                          className="w-4 h-4 rounded border-[#2A2A2E] bg-[#1A1A1E] text-[var(--gold-500)] focus:ring-[var(--gold-500)]"
                        />
                        <span className="text-white text-sm">{product.name}</span>
                        <span className="text-[var(--muted-foreground)] text-xs ml-auto">${product.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                  {selectedProducts.length > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {selectedProducts.length} product(s) selected
                    </p>
                  )}
                </div>
              )}

              {/* Category selection */}
              {scope === 'category' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                    Select Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (selectedCategories.includes(category.id)) {
                            setSelectedCategories(prev => prev.filter(id => id !== category.id))
                          } else {
                            setSelectedCategories(prev => [...prev, category.id])
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategories.includes(category.id)
                            ? 'bg-[var(--gold-500)] text-black'
                            : 'bg-[var(--charcoal-700)] text-white hover:bg-[var(--charcoal-600)]'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Schedule
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScheduleType('always')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    scheduleType === 'always'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <div className="font-medium text-white text-sm">Always Active</div>
                  <div className="text-xs text-[var(--muted-foreground)]">No time restrictions</div>
                </button>
                <button
                  onClick={() => setScheduleType('time_window')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    scheduleType === 'time_window'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <Clock className={`w-4 h-4 mb-1 ${scheduleType === 'time_window' ? 'text-[var(--gold-400)]' : 'text-[var(--muted-foreground)]'}`} />
                  <div className="font-medium text-white text-sm">Time Window</div>
                  <div className="text-xs text-[var(--muted-foreground)]">e.g., 4-7 PM</div>
                </button>
                <button
                  onClick={() => setScheduleType('day_of_week')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    scheduleType === 'day_of_week'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <div className="font-medium text-white text-sm">Days of Week</div>
                  <div className="text-xs text-[var(--muted-foreground)]">e.g., Mon-Fri</div>
                </button>
                <button
                  onClick={() => setScheduleType('date_range')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    scheduleType === 'date_range'
                      ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                      : 'border-[#2A2A2E] hover:border-[var(--gold-500)]/50'
                  }`}
                >
                  <Calendar className={`w-4 h-4 mb-1 ${scheduleType === 'date_range' ? 'text-[var(--gold-400)]' : 'text-[var(--muted-foreground)]'}`} />
                  <div className="font-medium text-white text-sm">Date Range</div>
                  <div className="text-xs text-[var(--muted-foreground)]">e.g., Dec 1-31</div>
                </button>
              </div>

              {/* Time window inputs */}
              {scheduleType === 'time_window' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Days (optional - leave empty for daily)
                    </label>
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day.value}
                          onClick={() => toggleDay(day.value)}
                          className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                            selectedDays.includes(day.value)
                              ? 'bg-[var(--gold-500)] text-black'
                              : 'bg-[var(--charcoal-700)] text-white hover:bg-[var(--charcoal-600)]'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Day of week selection */}
              {scheduleType === 'day_of_week' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Select Days
                  </label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                          selectedDays.includes(day.value)
                            ? 'bg-[var(--gold-500)] text-black'
                            : 'bg-[var(--charcoal-700)] text-white hover:bg-[var(--charcoal-600)]'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date range inputs */}
              {scheduleType === 'date_range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-[#2A2A2E]">
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
              disabled={isSubmitting || !name.trim() || !value}
            >
              {isSubmitting ? 'Saving...' : editingPromotion ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
