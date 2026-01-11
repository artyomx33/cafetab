'use client'

import { useRestaurant } from '@/contexts/RestaurantContext'

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { restaurant } = useRestaurant()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header with restaurant name */}
      <header className="glass border-b border-[var(--card-border)] flex-shrink-0 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="text-white">{restaurant.name.split(' ')[0]}</span>
          <span className="text-gradient-gold">{restaurant.name.split(' ').slice(1).join(' ') || 'Tab'}</span>
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
