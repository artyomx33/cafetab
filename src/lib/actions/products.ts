'use server'

import { createClient } from '@/lib/supabase/server'
import type { CategoryWithProducts, Product } from '@/types'

/**
 * Get all visible categories with their active products
 * @returns Array of categories with products, ordered by sort_order
 */
export async function getCategories(): Promise<CategoryWithProducts[]> {
  try {
    const supabase = await createClient()

    // Fetch visible categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return []
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // Fetch active products for all categories
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return []
    }

    // Group products by category
    const categoriesWithProducts: CategoryWithProducts[] = categories.map((category) => ({
      ...category,
      products: (products || []).filter((product) => product.category_id === category.id),
    }))

    return categoriesWithProducts
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

/**
 * Get all active products
 * @returns Array of active products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting products:', error)
    return []
  }
}
