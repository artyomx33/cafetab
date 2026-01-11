'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { QrCode, Users, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useTables } from '@/lib/supabase/hooks'

export default function RestaurantHome() {
  const router = useRouter()
  const { restaurant, restaurantId, slug, loading: restaurantLoading } = useRestaurant()
  const { tables, loading: tablesLoading } = useTables(restaurantId || undefined)
  const [qrCode, setQrCode] = useState('')

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (qrCode.trim()) {
      router.push(`/${slug}/table/${qrCode.trim()}`)
    }
  }

  if (restaurantLoading || tablesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--muted-foreground)]">Loading...</div>
      </div>
    )
  }

  // Dynamic styling based on restaurant theme
  const primaryStyle = {
    '--restaurant-primary': restaurant?.theme_primary || '#14b8a6',
  } as React.CSSProperties

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[var(--background)]" style={primaryStyle}>
      {/* Background glow blobs */}
      <div className="glow-blob glow-blob-gold absolute top-20 left-20 w-96 h-96 opacity-30" />
      <div className="glow-blob glow-blob-teal absolute bottom-20 right-20 w-96 h-96 opacity-20" />

      <motion.main
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {restaurant?.name || slug}
          </h1>
          {restaurant?.tagline && (
            <p className="text-lg text-[var(--muted-foreground)]">
              {restaurant.tagline}
            </p>
          )}
        </motion.div>

        {/* QR Code Entry for Customers */}
        <motion.div
          className="card-glass rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Customer? Enter Table Code
          </h2>
          <form onSubmit={handleQRSubmit} className="flex gap-2">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value.toUpperCase())}
              placeholder="CT-XXXXXXXX"
              className="flex-1 px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-center font-mono text-lg"
            />
            <button
              type="submit"
              disabled={!qrCode.trim()}
              className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Go
            </button>
          </form>
          <p className="text-xs text-[var(--muted-foreground)] mt-3 text-center">
            Scan the QR code at your table or enter the code manually
          </p>

          {/* Quick table links */}
          {tables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-2 text-center">Quick access:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {tables.slice(0, 4).map((table) => (
                  <Link
                    key={table.id}
                    href={`/${slug}/table/${table.qr_code}`}
                    className="px-3 py-1 text-sm bg-[var(--charcoal-800)] hover:bg-[var(--charcoal-700)] rounded-full transition-colors"
                  >
                    Table {table.number}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Staff Links */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href={`/${slug}/seller`}
            className="card-glass rounded-xl p-6 text-center hover:bg-[var(--muted)] transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Staff Login</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Manage tables & tabs
            </p>
          </Link>

          <Link
            href={`/${slug}/admin`}
            className="card-glass rounded-xl p-6 text-center hover:bg-[var(--muted)] transition-colors group"
          >
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Admin</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Products & settings
            </p>
          </Link>
        </motion.div>

        {/* Back to restaurant selector */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            &larr; Choose different restaurant
          </Link>
        </motion.div>
      </motion.main>
    </div>
  )
}
