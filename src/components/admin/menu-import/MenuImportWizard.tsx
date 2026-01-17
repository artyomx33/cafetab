'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PhotoUploadStep } from './PhotoUploadStep'
import { ProcessingStep } from './ProcessingStep'
import { ReviewStep } from './ReviewStep'
import { ConfirmStep } from './ConfirmStep'
import type { MenuImportState, ExtractedMenuItem } from '@/types/menu-import'
import { uploadMenuImage, deleteMenuImage } from '@/lib/supabase/storage'
import { extractMenuFromImage, bulkImportMenuItems } from '@/lib/actions/menu-import'
import type { Category } from '@/types'

interface MenuImportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  existingCategories: Category[]
  onComplete: () => void
}

export function MenuImportWizard({
  open,
  onOpenChange,
  restaurantId,
  existingCategories,
  onComplete
}: MenuImportWizardProps) {
  const [state, setState] = useState<MenuImportState>({
    step: 'upload',
    imageUrl: null,
    imagePath: null,
    extractionResult: null,
    selectedItems: [],
    categoryMapping: {},
    error: null
  })

  const handleUpload = useCallback(async (file: File) => {
    setState(s => ({ ...s, step: 'processing', error: null }))

    try {
      // Upload to Supabase Storage
      const { path, url } = await uploadMenuImage(file, restaurantId)
      setState(s => ({ ...s, imageUrl: url, imagePath: path }))

      // Extract with AI
      const result = await extractMenuFromImage(url)

      if (!result.success) {
        setState(s => ({
          ...s,
          step: 'upload',
          error: result.error || 'Extraction failed'
        }))
        return
      }

      // Initialize category mapping with existing categories where possible
      const mapping: Record<string, string> = {}
      result.suggestedCategories.forEach(({ name }) => {
        const match = existingCategories.find(c =>
          c.name.toLowerCase() === name.toLowerCase()
        )
        mapping[name] = match ? match.id : `NEW:${name}`
      })

      setState(s => ({
        ...s,
        step: 'review',
        extractionResult: result,
        selectedItems: result.items,
        categoryMapping: mapping
      }))

    } catch (error) {
      setState(s => ({
        ...s,
        step: 'upload',
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
    }
  }, [restaurantId, existingCategories])

  const handleItemToggle = useCallback((itemId: string) => {
    setState(s => ({
      ...s,
      selectedItems: s.selectedItems.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    }))
  }, [])

  const handleItemEdit = useCallback((itemId: string, updates: Partial<ExtractedMenuItem>) => {
    setState(s => ({
      ...s,
      selectedItems: s.selectedItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }))
  }, [])

  const handleCategoryMapping = useCallback((suggestedName: string, categoryId: string) => {
    setState(s => ({
      ...s,
      categoryMapping: { ...s.categoryMapping, [suggestedName]: categoryId }
    }))
  }, [])

  const handleConfirm = useCallback(async () => {
    setState(s => ({ ...s, step: 'confirm' }))

    const selectedForImport = state.selectedItems.filter(item => item.selected)

    const result = await bulkImportMenuItems(
      restaurantId,
      selectedForImport,
      state.categoryMapping
    )

    if (result.success || result.created > 0) {
      // Clean up uploaded image
      if (state.imagePath) {
        await deleteMenuImage(state.imagePath)
      }
      setState(s => ({ ...s, step: 'complete' }))
    } else {
      setState(s => ({
        ...s,
        step: 'review',
        error: `Import failed: ${result.errors.join(', ')}`
      }))
    }
  }, [state.selectedItems, state.categoryMapping, state.imagePath, restaurantId])

  const handleClose = useCallback(() => {
    // Clean up if closing without completing
    if (state.imagePath && state.step !== 'complete') {
      deleteMenuImage(state.imagePath)
    }
    setState({
      step: 'upload',
      imageUrl: null,
      imagePath: null,
      extractionResult: null,
      selectedItems: [],
      categoryMapping: {},
      error: null
    })
    onOpenChange(false)
  }, [state.imagePath, state.step, onOpenChange])

  const handleComplete = useCallback(() => {
    handleClose()
    onComplete()
  }, [handleClose, onComplete])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {state.step === 'upload' && (
          <PhotoUploadStep
            onUpload={handleUpload}
            error={state.error}
            onClose={handleClose}
          />
        )}

        {state.step === 'processing' && (
          <ProcessingStep />
        )}

        {state.step === 'review' && state.extractionResult && (
          <ReviewStep
            items={state.selectedItems}
            suggestedCategories={state.extractionResult.suggestedCategories}
            existingCategories={existingCategories}
            categoryMapping={state.categoryMapping}
            onToggleItem={handleItemToggle}
            onEditItem={handleItemEdit}
            onMapCategory={handleCategoryMapping}
            onConfirm={handleConfirm}
            onBack={() => setState(s => ({ ...s, step: 'upload' }))}
            error={state.error}
          />
        )}

        {state.step === 'confirm' && (
          <ConfirmStep
            itemCount={state.selectedItems.filter(i => i.selected).length}
          />
        )}

        {state.step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-3xl">&#x2713;</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Import Complete!</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              {state.selectedItems.filter(i => i.selected).length} items imported successfully
            </p>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-[var(--gold-500)] text-black rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
