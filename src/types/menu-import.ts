export interface ExtractedMenuItem {
  id: string
  name: string
  price: number | null
  description: string | null
  suggestedCategory: string
  confidence: 'high' | 'medium' | 'low'
  selected: boolean
}

export interface ExtractedCategory {
  name: string
  itemCount: number
}

export interface MenuExtractionResult {
  success: boolean
  items: ExtractedMenuItem[]
  suggestedCategories: ExtractedCategory[]
  rawText?: string
  error?: string
}

export interface MenuImportState {
  step: 'upload' | 'processing' | 'review' | 'confirm' | 'complete'
  imageUrl: string | null
  imagePath: string | null
  extractionResult: MenuExtractionResult | null
  selectedItems: ExtractedMenuItem[]
  categoryMapping: Record<string, string>
  error: string | null
}
