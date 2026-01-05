'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useVenueSettings } from '@/lib/supabase/hooks'
import { Button } from '@/components/ui/button'
import { Settings, Save } from 'lucide-react'

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useVenueSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for form fields
  const [clientCanOrder, setClientCanOrder] = useState(false)
  const [clientCanPay, setClientCanPay] = useState(false)
  const [requirePrepay, setRequirePrepay] = useState(false)
  const [notifyOnEveryOrder, setNotifyOnEveryOrder] = useState(false)

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
    setIsSubmitting(true)
    try {
      await updateSettings({
        client_can_order: clientCanOrder,
        client_can_pay: clientCanPay,
        require_prepay: requirePrepay,
        notify_on_every_order: notifyOnEveryOrder,
      })
      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings. Please try again.')
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

      {/* Settings Card */}
      <motion.div
        className="card-glass rounded-xl p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--card-border)]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Venue Configuration</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Control customer permissions and notifications</p>
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
        <div className="pt-4 border-t border-[var(--card-border)]">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
