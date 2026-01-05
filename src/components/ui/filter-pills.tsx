'use client'

import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterPillsProps {
  options: FilterOption[]
  selected: string
  onSelect: (id: string) => void
  className?: string
}

export function FilterPills({ options, selected, onSelect, className }: FilterPillsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-[var(--muted-foreground)] mr-2">Status:</span>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
            selected === option.id
              ? 'bg-[var(--gold-500)] text-[var(--charcoal-950)]'
              : 'bg-[#1E1E22] text-[var(--muted-foreground)] border border-[#2A2A2E] hover:bg-[#252528] hover:text-white'
          )}
          style={selected === option.id ? {
            boxShadow: '0 0 20px rgba(201, 169, 98, 0.4), 0 0 40px rgba(201, 169, 98, 0.2)'
          } : undefined}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
