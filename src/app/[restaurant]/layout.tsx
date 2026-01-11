import { RestaurantProvider } from '@/contexts/RestaurantContext'
import { getRestaurant, getRestaurantSlugs } from '@/config/restaurants'
import { notFound } from 'next/navigation'

// Generate static params for all known restaurants
export function generateStaticParams() {
  return getRestaurantSlugs().map((slug) => ({
    restaurant: slug,
  }))
}

// Generate metadata based on restaurant
export async function generateMetadata({ params }: { params: Promise<{ restaurant: string }> }) {
  const { restaurant: slug } = await params
  const restaurant = getRestaurant(slug)

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

  // Validate restaurant exists
  const restaurant = getRestaurant(slug)
  if (!restaurant) {
    notFound()
  }

  return (
    <RestaurantProvider restaurantSlug={slug}>
      {children}
    </RestaurantProvider>
  )
}
