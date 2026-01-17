'use client'

import { motion } from 'motion/react'
import { Coffee, MapPin, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'
import { restaurants } from '@/config/restaurants'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[var(--background)]">
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
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="w-12 h-12 text-[var(--primary)]" />
            <h1 className="text-5xl font-bold text-gradient-gold">
              CafeTab
            </h1>
          </div>
          <p className="text-xl text-[var(--muted-foreground)]">
            Modern tab management for hospitality
          </p>
        </motion.div>

        {/* Restaurant Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-center justify-center">
            <MapPin className="w-5 h-5" />
            Select a Restaurant
          </h2>

          <div className="space-y-3">
            {restaurants.map((restaurant, index) => {
              const isDemo = restaurant.slug !== 'luna'
              return (
                <motion.div
                  key={restaurant.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={`/${restaurant.slug}`}
                    className="card-glass rounded-xl p-5 flex items-center gap-4 hover:bg-[var(--muted)] transition-all group block"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {restaurant.slug === 'luna' ? '🌙' : '🫏'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                        {isDemo && (
                          <span className="px-2 py-0.5 text-xs bg-[var(--teal-500)]/20 text-[var(--teal-400)] rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {restaurant.tagline || `${restaurant.currency} Menu`}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              )
            })}

            {/* Create New Cafe */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + restaurants.length * 0.1 }}
            >
              <Link
                href="/create"
                className="rounded-xl p-5 flex items-center gap-4 border-2 border-dashed border-[var(--charcoal-700)] hover:border-[var(--gold-500)] hover:bg-[var(--gold-500)]/5 transition-all group block"
              >
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[var(--charcoal-600)] group-hover:border-[var(--gold-500)] flex items-center justify-center group-hover:scale-110 transition-all">
                  <Plus className="w-6 h-6 text-[var(--charcoal-500)] group-hover:text-[var(--gold-500)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[var(--muted-foreground)] group-hover:text-white transition-colors">Create New Cafe</h3>
                  <p className="text-sm text-[var(--charcoal-500)]">
                    Set up your own digital menu
                  </p>
                </div>
                <svg className="w-5 h-5 text-[var(--charcoal-600)] group-hover:text-[var(--gold-500)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Built for cafes, restaurants, beach clubs & bars
          </p>
          <div className="flex justify-center gap-6 text-xs text-[var(--muted-foreground)]">
            <span>QR Ordering</span>
            <span>•</span>
            <span>Prepaid Tabs</span>
            <span>•</span>
            <span>Self-Checkout</span>
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
