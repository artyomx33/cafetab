'use client'

import { useState } from 'react'
import { Check, Edit2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { ExtractedMenuItem, ExtractedCategory } from '@/types/menu-import'
import type { Category } from '@/types'

interface ReviewStepProps {
  items: ExtractedMenuItem[]
  suggestedCategories: ExtractedCategory[]
  existingCategories: Category[]
  categoryMapping: Record<string, string>
  onToggleItem: (itemId: string) => void
  onEditItem: (itemId: string, updates: Partial<ExtractedMenuItem>) => void
  onMapCategory: (suggestedName: string, categoryId: string) => void
  onConfirm: () => void
  onBack: () => void
  error: string | null
}

export function ReviewStep({
  items,
  suggestedCategories,
  existingCategories,
  categoryMapping,
  onToggleItem,
  onEditItem,
  onMapCategory,
  onConfirm,
  onBack,
  error
}: ReviewStepProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCategoryMapping, setShowCategoryMapping] = useState(true)

  const selectedCount = items.filter(i => i.selected).length
  const totalCount = items.length

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Review Extracted Items</h2>
        <p className="text-[var(--muted-foreground)] mt-1">
          {selectedCount} of {totalCount} items selected for import
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Category Mapping Section */}
      <div className="border border-[var(--charcoal-600)] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCategoryMapping(!showCategoryMapping)}
          className="w-full flex items-center justify-between p-4 bg-[var(--charcoal-800)] hover:bg-[var(--charcoal-700)] transition-colors"
        >
          <span className="font-medium text-white">Category Mapping</span>
          {showCategoryMapping ? (
            <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
          )}
        </button>

        {showCategoryMapping && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              Map AI-suggested categories to your existing categories or create new ones
            </p>
            {suggestedCategories.map(({ name, itemCount }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm text-white min-w-[120px]">
                  {name} ({itemCount})
                </span>
                <span className="text-[var(--muted-foreground)]">&rarr;</span>
                <select
                  value={categoryMapping[name] || ''}
                  onChange={(e) => onMapCategory(name, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--charcoal-700)] border border-[var(--charcoal-600)] text-white text-sm"
                >
                  <option value={`NEW:${name}`}>+ Create &quot;{name}&quot;</option>
                  {existingCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className={`
              p-4 rounded-xl border transition-all
              ${item.selected
                ? 'bg-[var(--charcoal-800)] border-[var(--charcoal-600)]'
                : 'bg-[var(--charcoal-900)] border-transparent opacity-50'
              }
            `}
          >
            {editingId === item.id ? (
              // Edit mode
              <div className="space-y-3">
                <input
                  value={item.name}
                  onChange={(e) => onEditItem(item.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--charcoal-700)] border border-[var(--charcoal-600)] text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={item.price ?? ''}
                    onChange={(e) => onEditItem(item.id, {
                      price: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    placeholder="Price"
                    className="w-24 px-3 py-2 rounded-lg bg-[var(--charcoal-700)] border border-[var(--charcoal-600)] text-white"
                  />
                  <input
                    value={item.description ?? ''}
                    onChange={(e) => onEditItem(item.id, {
                      description: e.target.value || null
                    })}
                    placeholder="Description (optional)"
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--charcoal-700)] border border-[var(--charcoal-600)] text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 rounded-lg bg-[var(--gold-500)] text-black font-medium text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                    ${item.selected
                      ? 'bg-[var(--gold-500)] border-[var(--gold-500)]'
                      : 'border-[var(--charcoal-500)]'
                    }
                  `}
                >
                  {item.selected && <Check className="w-4 h-4 text-black" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{item.name}</span>
                    {item.confidence !== 'high' && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded
                        ${item.confidence === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                        }
                      `}>
                        {item.confidence}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.suggestedCategory}
                  </p>
                </div>

                <span className="text-[var(--gold-400)] font-medium">
                  {item.price !== null ? `$${item.price.toFixed(2)}` : '\u2014'}
                </span>

                <button
                  onClick={() => setEditingId(item.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--charcoal-700)]">
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white font-medium transition-colors"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--gold-500)] hover:bg-[var(--gold-400)] text-black font-medium transition-colors disabled:opacity-50"
          onClick={onConfirm}
          disabled={selectedCount === 0}
        >
          Import {selectedCount} Items
        </button>
      </div>
    </div>
  )
}
