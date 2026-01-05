'use client'

import { motion } from 'motion/react'
import { useDashboardStats } from '@/lib/supabase/hooks'
import { ActionCard } from '@/components/ui/action-card'
import { StatCard } from '@/components/ui/stat-card'
import { IconBox } from '@/components/ui/icon-box'
import {
  Users,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  Package,
  Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const { stats, leaderboard, activity, loading } = useDashboardStats()

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Welcome to the GolfTab admin panel</p>
        </div>
        <div className="card-glass rounded-xl p-8 text-center">
          <p className="text-[var(--muted-foreground)]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Welcome to the GolfTab admin panel</p>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ActionCard
          href="/admin/groups"
          icon={<Users className="w-6 h-6" />}
          color="gold"
          title="Create Group"
          subtitle="Start a new tab"
          glow
        />
        <ActionCard
          href="/admin/groups"
          icon={<ClipboardList className="w-6 h-6" />}
          color="teal"
          title="Active Tabs"
          subtitle={`${stats.activeGroups} groups running`}
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Sales"
          value={`$${stats.totalSales.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="gold"
          delay={0.2}
        />
        <StatCard
          label="Active Groups"
          value={stats.activeGroups}
          icon={<Users className="w-6 h-6" />}
          iconColor="teal"
          delay={0.3}
        />
        <StatCard
          label="Items Sold"
          value={stats.itemsSold}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconColor="purple"
          delay={0.4}
        />
      </div>

      {/* Leaderboard & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seller Leaderboard */}
        <motion.div
          className="card-glass rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="p-6 border-b border-[var(--card-border)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Seller Leaderboard</h2>
          </div>
          <div className="p-4">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No sales data available</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((seller, index) => (
                  <motion.div
                    key={seller.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--charcoal-800)] transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`leaderboard-rank ${
                        index === 0 ? 'leaderboard-rank-1' :
                        index === 1 ? 'leaderboard-rank-2' :
                        index === 2 ? 'leaderboard-rank-3' :
                        'leaderboard-rank-default'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{seller.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{seller.itemsSold} items sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gradient-gold">${seller.totalSales.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="card-glass rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="p-6 border-b border-[var(--card-border)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Recent Activity</h2>
          </div>
          <div className="p-4">
            {activity.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {activity.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-[var(--charcoal-800)] transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <IconBox color="gold" size="md">
                      <Package className="w-4 h-4" />
                    </IconBox>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--foreground)] truncate">{item.productName}</p>
                      <p className="text-sm text-[var(--muted-foreground)] truncate">
                        {item.sellerName} · {item.groupName} · {item.quantity}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gradient-gold">
                        ${item.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
