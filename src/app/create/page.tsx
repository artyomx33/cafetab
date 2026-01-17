'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Coffee, Sparkles, ArrowRight, Check, Store, Hash, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createCafe } from '@/lib/actions/create-cafe'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CreateCafePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [tableCount, setTableCount] = useState(5)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const slug = slugify(name) || 'your-cafe'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    setError(null)

    const result = await createCafe({ name: name.trim(), tableCount })

    if (result.success && result.slug) {
      setSuccess(result.slug)
      // Redirect after animation
      setTimeout(() => {
        router.push(`/${result.slug}/admin/products`)
      }, 1500)
    } else {
      setError(result.error || 'Failed to create cafe')
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[var(--background)]">
      {/* Background Effects */}
      <div className="glow-blob glow-blob-gold absolute top-10 right-10 w-[500px] h-[500px] opacity-20" />
      <div className="glow-blob glow-blob-teal absolute bottom-10 left-10 w-[400px] h-[400px] opacity-15" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--gold-500) 1px, transparent 1px),
                           linear-gradient(90deg, var(--gold-500) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <motion.main
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-white transition-colors mb-8"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to restaurants
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] mb-4 shadow-lg shadow-[var(--gold-500)]/20">
            <Store className="w-8 h-8 text-[var(--charcoal-950)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Create Your <span className="text-gradient-gold">Cafe</span>
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Set up your digital menu in seconds
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card-glass rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--success)] to-emerald-600 mx-auto mb-4 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Cafe Created!</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Redirecting to your admin panel...
              </p>
              <div className="flex items-center justify-center gap-2 text-[var(--gold-400)]">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="font-mono">/{success}</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          ) : (
            /* Form */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
              className="card-glass rounded-2xl p-6 space-y-6"
            >
              {/* Cafe Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                  Cafe Name
                </label>
                <div className="relative">
                  <Coffee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Amazing Cafe"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--charcoal-900)] border border-[var(--charcoal-700)] focus:border-[var(--gold-500)] focus:ring-2 focus:ring-[var(--gold-500)]/20 outline-none transition-all text-white placeholder:text-[var(--charcoal-500)]"
                    required
                    autoFocus
                  />
                </div>

                {/* Slug Preview */}
                <motion.div
                  initial={false}
                  animate={{ opacity: name ? 1 : 0.5 }}
                  className="mt-2 flex items-center gap-2 text-sm"
                >
                  <span className="text-[var(--muted-foreground)]">URL:</span>
                  <code className="px-2 py-1 rounded bg-[var(--charcoal-900)] text-[var(--gold-400)] font-mono text-xs">
                    cafetab.com/{slug}
                  </code>
                </motion.div>
              </div>

              {/* Table Count */}
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                  Number of Tables
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={tableCount}
                      onChange={(e) => setTableCount(parseInt(e.target.value))}
                      className="w-full h-2 rounded-full bg-[var(--charcoal-800)] appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-br
                        [&::-webkit-slider-thumb]:from-[var(--gold-400)]
                        [&::-webkit-slider-thumb]:to-[var(--gold-600)]
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:shadow-[var(--gold-500)]/30
                        [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:active:cursor-grabbing"
                    />
                  </div>
                  <div className="w-16 h-12 rounded-xl bg-[var(--charcoal-900)] border border-[var(--charcoal-700)] flex items-center justify-center">
                    <span className="text-xl font-bold text-gradient-gold">{tableCount}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Each table gets a unique QR code for ordering
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!name.trim() || isCreating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold text-[var(--charcoal-950)] bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] hover:from-[var(--gold-500)] hover:to-[var(--gold-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--gold-500)]/20 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Cafe
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Info */}
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Default admin PIN: <code className="px-1.5 py-0.5 rounded bg-[var(--charcoal-800)] text-[var(--gold-400)]">1234</code>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Features hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-[var(--muted-foreground)]">
            After creation, use <span className="text-[var(--gold-400)]">Import Menu</span> to add products from a photo
          </p>
        </motion.div>
      </motion.main>
    </div>
  )
}
