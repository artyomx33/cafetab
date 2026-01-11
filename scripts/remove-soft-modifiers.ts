// Quick script to remove modifier groups from Water Sparkling only
// Run with: source .env.local && npx tsx scripts/remove-soft-modifiers.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('Run: source .env.local && npx tsx scripts/remove-soft-modifiers.ts')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Find Water Sparkling product ID only (Coca Cola keeps its options)
  const { data: products, error: findError } = await supabase
    .from('cafe_products')
    .select('id, name')
    .eq('name', 'Water Sparkling')

  if (findError) {
    console.error('Error finding products:', findError)
    return
  }

  console.log('Found products:', products)

  if (!products || products.length === 0) {
    console.log('No products found')
    return
  }

  const productIds = products.map(p => p.id)

  // Check current modifier links
  const { data: currentLinks } = await supabase
    .from('cafe_product_modifier_groups')
    .select('*')
    .in('product_id', productIds)

  console.log('Current modifier links:', currentLinks)

  // Delete modifier group links for these products
  const { error: deleteError, count } = await supabase
    .from('cafe_product_modifier_groups')
    .delete()
    .in('product_id', productIds)

  if (deleteError) {
    console.error('Error deleting modifier links:', deleteError)
    return
  }

  console.log(`Removed ${count} modifier links from Water Sparkling`)
  console.log('Done! Water Sparkling will now show quick-add button.')
}

main()
