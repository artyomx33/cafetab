'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useVenueSettings } from '@/lib/supabase/hooks'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Settings, Save, Globe, Palette, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { restaurant, restaurantId, loading: restaurantLoading } = useRestaurant()
  const { settings, loading: settingsLoading, refresh } = useVenueSettings(restaurantId || undefined)
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for form fields
  const [clientCanOrder, setClientCanOrder] = useState(false)
  const [clientCanPay, setClientCanPay] = useState(false)
  const [requirePrepay, setRequirePrepay] = useState(false)
  const [notifyOnEveryOrder, setNotifyOnEveryOrder] = useState(false)

  const loading = restaurantLoading || settingsLoading

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setClientCanOrder(settings.client_can_order)
      setClientCanPay(settings.client_can_pay)
      setRequirePrepay(settings.require_prepay)
      setNotifyOnEveryOrder(settings.notify_on_every_order)
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_venue_settings')
        .update({
          client_can_order: clientCanOrder,
          client_can_pay: clientCanPay,
          require_prepay: requirePrepay,
          notify_on_every_order: notifyOnEveryOrder,
        })
        .eq('id', settings.id)

      if (error) throw error
      toast.success('Settings saved successfully!')
      refresh()
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Configure venue settings</p>
        </div>
        <div className="card-glass rounded-xl p-8 text-center">
          <p className="text-[var(--muted-foreground)]">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Restaurant not found</div>
      </div>
    )
  }

  const generalSettings = [
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
      value: `${restaurant.currency} (${restaurant.currency_symbol})`,
    },
    {
      icon: Globe,
      label: 'Locale',
      value: restaurant.locale,
    },
    {
      icon: Palette,
      label: 'Primary Color',
      value: restaurant.theme_primary || '#14b8a6',
      color: restaurant.theme_primary || '#14b8a6',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Configure venue settings</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info Card (read-only) */}
        <motion.div
          className="card-glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--card-border)] mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--charcoal-700)] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[var(--gold-400)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">General Information</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Restaurant details</p>
            </div>
          </div>

          <div className="space-y-3">
            {generalSettings.map((setting, index) => {
              const Icon = setting.icon
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-[var(--muted-foreground)]">{setting.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.color && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: setting.color }}
                      />
                    )}
                    <span className="font-medium text-white">{setting.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Feature Settings Card (editable) */}
        {settings && (
          <motion.div
            className="card-glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--card-border)] mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Feature Configuration</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Control customer permissions</p>
              </div>
            </div>

            {/* Settings Options */}
            <div className="space-y-4">
              {/* Client Can Order */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E]">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">Client Can Order</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Allow customers to place orders from their table via QR code
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={clientCanOrder}
                    onChange={(e) => setClientCanOrder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--charcoal-700)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gold-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold-500)]"></div>
                </label>
              </div>

              {/* Client Can Pay */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E]">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">Client Can Pay</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Allow customers to pay their tab from their device
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={clientCanPay}
                    onChange={(e) => setClientCanPay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--charcoal-700)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gold-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold-500)]"></div>
                </label>
              </div>

              {/* Require Prepay */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E]">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">Require Prepay</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Require customers to load funds before ordering
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={requirePrepay}
                    onChange={(e) => setRequirePrepay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--charcoal-700)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gold-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold-500)]"></div>
                </label>
              </div>

              {/* Notify on Every Order */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E]">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">Notify on Every Order</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Send notification to staff for every order placed by customers
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={notifyOnEveryOrder}
                    onChange={(e) => setNotifyOnEveryOrder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--charcoal-700)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gold-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold-500)]"></div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 mt-4 border-t border-[var(--card-border)]">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            {/* Tip Options */}
            <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
              <h3 className="text-base font-bold mb-3 text-white">Default Tip Options</h3>
              <div className="flex gap-3">
                {settings.default_tip_options.map((tip) => (
                  <div
                    key={tip}
                    className="flex-1 text-center p-3 bg-[var(--charcoal-800)] rounded-lg"
                  >
                    <span className="text-xl font-bold text-gradient-gold">{tip}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
