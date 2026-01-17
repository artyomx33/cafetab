import { RestaurantProvider } from '@/contexts/RestaurantContext'
import { getRestaurant, getRestaurantSlugs, dbToConfig, DbRestaurant } from '@/config/restaurants'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// Generate static params for all known restaurants (hardcoded only)
export function generateStaticParams() {
  return getRestaurantSlugs().map((slug) => ({
    restaurant: slug,
  }))
}

// Fetch restaurant from database
async function getRestaurantFromDb(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single()
  return data as DbRestaurant | null
}

// Generate metadata based on restaurant
export async function generateMetadata({ params }: { params: Promise<{ restaurant: string }> }) {
  const { restaurant: slug } = await params

  // Check hardcoded first
  let restaurant = getRestaurant(slug)

  // If not found, check database
  if (!restaurant) {
    const dbRestaurant = await getRestaurantFromDb(slug)
    if (dbRestaurant) {
      restaurant = dbToConfig(dbRestaurant)
    }
  }

  if (!restaurant) {
    return { title: 'CafeTab' }
  }

  return {
    title: `${restaurant.name} | CafeTab`,
    description: restaurant.tagline || `Welcome to ${restaurant.name}`,
  }
}

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ restaurant: string }>
}) {
  const { restaurant: slug } = await params

  // Check hardcoded first
  let restaurant = getRestaurant(slug)

  // If not found, check database
  if (!restaurant) {
    const dbRestaurant = await getRestaurantFromDb(slug)
    if (dbRestaurant) {
      restaurant = dbToConfig(dbRestaurant)
    }
  }

  if (!restaurant) {
    notFound()
  }

  return (
    <RestaurantProvider restaurantSlug={slug}>
      {children}
    </RestaurantProvider>
  )
}
