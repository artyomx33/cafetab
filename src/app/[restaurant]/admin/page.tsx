'use client'

import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useTables, useCategories } from '@/lib/supabase/hooks'
import { Card } from '@/components/ui'
import { Package, UtensilsCrossed, DollarSign, Clock, ChefHat } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { restaurant, restaurantId, slug, loading: restaurantLoading, formatPrice } = useRestaurant()
  const { tables, loading: tablesLoading } = useTables(restaurantId || undefined)
  const { categories, loading: categoriesLoading } = useCategories(restaurantId || undefined)

  if (restaurantLoading || tablesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Loading dashboard...</div>
      </div>
    )
  }

  const totalProducts = categories.reduce((sum: number, cat: any) => sum + cat.products.length, 0)
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const totalRevenue = tables.reduce((sum: number, t: any) => sum + (t.current_tab?.total || 0), 0)

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'gold',
    },
    {
      label: 'Tables',
      value: `${occupiedTables}/${tables.length}`,
      subtext: 'occupied',
      icon: UtensilsCrossed,
      color: 'teal',
    },
    {
      label: 'Active Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'gold',
    },
    {
      label: 'Kitchen',
      value: 'View',
      icon: ChefHat,
      color: 'teal',
      href: `/${slug}/admin/kitchen`,
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Welcome to {restaurant?.name || slug} admin panel
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const content = (
            <Card className="card-glass p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-[var(--${stat.color}-500)]/20`}>
                  <Icon className={`w-6 h-6 text-[var(--${stat.color}-400)]`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
                {stat.subtext && <span className="ml-1">({stat.subtext})</span>}
              </p>
            </Card>
          )

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {stat.href ? (
                <Link href={stat.href} className="block hover:opacity-80 transition-opacity">
                  {content}
                </Link>
              ) : (
                content
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Menu Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4">Menu Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any, index: number) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <Card className="card-glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {category.products.length} products
                    </p>
                  </div>
                  {category.products.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-[var(--muted-foreground)]">Price range</p>
                      <p className="font-semibold text-gradient-gold">
                        {formatPrice(Math.min(...category.products.map((p: any) => p.price)))} - {formatPrice(Math.max(...category.products.map((p: any) => p.price)))}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
