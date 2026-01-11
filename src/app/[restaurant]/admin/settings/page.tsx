'use client'

import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card } from '@/components/ui'
import { Settings, Globe, Palette, CreditCard } from 'lucide-react'

export default function AdminSettingsPage() {
  const { restaurant, usesDatabase } = useRestaurant()

  const settings = [
    {
      icon: Globe,
      label: 'Restaurant Name',
      value: restaurant.name,
    },
    {
      icon: Globe,
      label: 'Tagline',
      value: restaurant.tagline || 'Not set',
    },
    {
      icon: CreditCard,
      label: 'Currency',
      value: `${restaurant.currency} (${restaurant.currencySymbol})`,
    },
    {
      icon: Globe,
      label: 'Locale',
      value: restaurant.locale,
    },
    {
      icon: Palette,
      label: 'Primary Color',
      value: restaurant.theme.primary,
      color: restaurant.theme.primary,
    },
  ]

  const featureSettings = [
    {
      label: 'Clients Can Order',
      value: restaurant.settings.clientCanOrder,
    },
    {
      label: 'Clients Can Pay',
      value: restaurant.settings.clientCanPay,
    },
    {
      label: 'Require Prepay',
      value: restaurant.settings.requirePrepay,
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
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Restaurant configuration
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--gold-400)]" />
            General
          </h2>
          <Card className="card-glass divide-y divide-[var(--card-border)]">
            {settings.map((setting, index) => {
              const Icon = setting.icon
              return (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <span className="text-[var(--muted-foreground)]">{setting.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.color && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: setting.color }}
                      />
                    )}
                    <span className="font-semibold">{setting.value}</span>
                  </div>
                </div>
              )
            })}
          </Card>
        </motion.div>

        {/* Feature Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[var(--gold-400)]" />
            Features
          </h2>
          <Card className="card-glass divide-y divide-[var(--card-border)]">
            {featureSettings.map((setting, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">{setting.label}</span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  setting.value
                    ? 'bg-[var(--teal-500)]/20 text-[var(--teal-400)]'
                    : 'bg-[var(--charcoal-700)] text-[var(--muted-foreground)]'
                }`}>
                  {setting.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </Card>

          {/* Tip Options */}
          <h3 className="text-lg font-bold mt-6 mb-3">Default Tip Options</h3>
          <Card className="card-glass p-4">
            <div className="flex gap-3">
              {restaurant.settings.defaultTipOptions.map((tip) => (
                <div
                  key={tip}
                  className="flex-1 text-center p-3 bg-[var(--charcoal-800)] rounded-lg"
                >
                  <span className="text-xl font-bold text-gradient-gold">{tip}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {!usesDatabase && (
        <motion.div
          className="mt-8 p-6 bg-[var(--teal-500)]/10 border border-[var(--teal-500)]/30 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-[var(--teal-400)] mb-2">Demo Mode</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Settings are read-only in demo mode. In production, these would be editable and stored in the database.
          </p>
        </motion.div>
      )}
    </div>
  )
}
