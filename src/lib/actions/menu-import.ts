'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MenuExtractionResult, ExtractedMenuItem } from '@/types/menu-import'
import { v4 as uuidv4 } from 'uuid'

const EXTRACTION_PROMPT = `You are analyzing a restaurant menu photo. Extract ALL menu items you can identify.

For each item, provide:
- name: The item name exactly as shown
- price: The price as a number (null if unclear or not shown)
- description: Any description text (null if none)
- suggestedCategory: Your best guess for category (e.g., "Appetizers", "Main Courses", "Drinks", "Desserts", "Sides", "Salads", "Cocktails", etc.)
- confidence: "high" if clearly readable, "medium" if partially visible/unclear, "low" if guessing

Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "name": "Item Name",
      "price": 12.99,
      "description": "Optional description",
      "suggestedCategory": "Category Name",
      "confidence": "high"
    }
  ],
  "categories": ["Category1", "Category2"]
}

Important:
- Extract ALL visible menu items, not just a sample
- Preserve exact item names and descriptions
- Convert all prices to decimal numbers (remove currency symbols)
- Group similar items under logical categories
- If the image is not a menu or is unreadable, return: {"items": [], "categories": [], "error": "Description of issue"}`

export async function extractMenuFromImage(
  imageUrl: string
): Promise<MenuExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return {
      success: false,
      items: [],
      suggestedCategories: [],
      error: 'ANTHROPIC_API_KEY not configured. Add it to your environment variables.'
    }
  }

  try {
    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from storage')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Map content type to Anthropic's expected format
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
    if (contentType.includes('png')) mediaType = 'image/png'
    else if (contentType.includes('gif')) mediaType = 'image/gif'
    else if (contentType.includes('webp')) mediaType = 'image/webp'

    // Call Claude Vision API
    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT
            }
          ]
        }
      ]
    })

    // Parse response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonText.trim())

    if (parsed.error) {
      return {
        success: false,
        items: [],
        suggestedCategories: [],
        error: parsed.error
      }
    }

    // Transform items with IDs and defaults
    const items: ExtractedMenuItem[] = (parsed.items || []).map((item: any) => ({
      id: uuidv4(),
      name: item.name || 'Unknown Item',
      price: typeof item.price === 'number' ? item.price : null,
      description: item.description || null,
      suggestedCategory: item.suggestedCategory || 'Uncategorized',
      confidence: item.confidence || 'medium',
      selected: true
    }))

    // Build category summary
    const categoryCount: Record<string, number> = {}
    items.forEach(item => {
      categoryCount[item.suggestedCategory] = (categoryCount[item.suggestedCategory] || 0) + 1
    })

    const suggestedCategories = Object.entries(categoryCount)
      .map(([name, itemCount]) => ({ name, itemCount }))
      .sort((a, b) => b.itemCount - a.itemCount)

    return {
      success: true,
      items,
      suggestedCategories,
      rawText: content.text
    }

  } catch (error) {
    console.error('Menu extraction error:', error)
    return {
      success: false,
      items: [],
      suggestedCategories: [],
      error: error instanceof Error ? error.message : 'Unknown error during extraction'
    }
  }
}

export async function bulkImportMenuItems(
  restaurantId: string,
  items: ExtractedMenuItem[],
  categoryMapping: Record<string, string>
): Promise<{ success: boolean; created: number; errors: string[] }> {
  const supabase = createAdminClient()
  const errors: string[] = []
  let created = 0

  try {
    // Step 1: Create new categories
    const newCategories: Record<string, string> = {}

    for (const [suggestedName, mapping] of Object.entries(categoryMapping)) {
      if (mapping.startsWith('NEW:')) {
        const categoryName = mapping.replace('NEW:', '')

        const { data: category, error } = await supabase
          .from('cafe_categories')
          .insert({
            name: categoryName,
            restaurant_id: restaurantId,
            is_visible: true,
            sort_order: 0
          })
          .select('id')
          .single()

        if (error) {
          errors.push(`Failed to create category "${categoryName}": ${error.message}`)
        } else {
          newCategories[suggestedName] = category.id
        }
      }
    }

    // Step 2: Create products
    for (const item of items) {
      if (!item.selected) continue

      // Resolve category ID
      let categoryId = categoryMapping[item.suggestedCategory]
      if (categoryId?.startsWith('NEW:')) {
        categoryId = newCategories[item.suggestedCategory]
      }

      if (!categoryId) {
        errors.push(`No category mapped for "${item.name}"`)
        continue
      }

      const { error } = await supabase
        .from('cafe_products')
        .insert({
          name: item.name,
          price: item.price ?? 0,
          description: item.description,
          category_id: categoryId,
          restaurant_id: restaurantId,
          is_active: true,
          sort_order: 0,
          prep_time: 10
        })

      if (error) {
        errors.push(`Failed to create "${item.name}": ${error.message}`)
      } else {
        created++
      }
    }

    return { success: errors.length === 0, created, errors }

  } catch (error) {
    return {
      success: false,
      created,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}
