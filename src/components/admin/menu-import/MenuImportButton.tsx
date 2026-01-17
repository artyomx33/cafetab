'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { MenuImportWizard } from './MenuImportWizard'
import type { Category } from '@/types'

interface MenuImportButtonProps {
  restaurantId: string
  existingCategories: Category[]
  onComplete: () => void
}

export function MenuImportButton({ restaurantId, existingCategories, onComplete }: MenuImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-white font-medium transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="w-4 h-4" />
        Import Menu
      </button>

      <MenuImportWizard
        open={isOpen}
        onOpenChange={setIsOpen}
        restaurantId={restaurantId}
        existingCategories={existingCategories}
        onComplete={() => {
          setIsOpen(false)
          onComplete()
        }}
      />
    </>
  )
}
