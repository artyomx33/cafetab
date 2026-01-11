'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useDemoStore } from '@/stores/demo-store'
import { Card } from '@/components/ui'
import { Package, UtensilsCrossed, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { restaurant, slug, usesDatabase, formatPrice, getCategories, getTables } = useRestaurant()

  // Demo mode store
  const { tables: demoTables, orders: demoOrders, initializeRestaurant } = useDemoStore()

  // Initialize demo store
  useEffect(() => {
    if (!usesDatabase) {
      initializeRestaurant(slug, getTables())
    }
  }, [usesDatabase, slug, getTables, initializeRestaurant])

  const categories = getCategories()
  const tables = usesDatabase ? [] : demoTables
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0)
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const totalRevenue = tables.reduce((sum, t) => sum + (t.current_tab?.total || 0), 0)
  const pendingOrders = demoOrders.filter(o => o.status === 'pending').length

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
      label: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: pendingOrders > 0 ? 'error' : 'teal',
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
          Welcome to {restaurant.name} admin panel
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
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
          {categories.map((category, index) => (
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
                  <div className="text-right">
                    <p className="text-sm text-[var(--muted-foreground)]">Price range</p>
                    <p className="font-semibold text-gradient-gold">
                      {formatPrice(Math.min(...category.products.map(p => p.price)))} - {formatPrice(Math.max(...category.products.map(p => p.price)))}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Demo Mode Notice */}
      {!usesDatabase && (
        <motion.div
          className="mt-8 p-6 bg-[var(--teal-500)]/10 border border-[var(--teal-500)]/30 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-semibold text-[var(--teal-400)] mb-2">Demo Mode Active</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            This restaurant is running in demo mode. All data is stored in memory and will reset on page refresh.
            Perfect for showcasing the app to potential clients!
          </p>
        </motion.div>
      )}
    </div>
  )
}
