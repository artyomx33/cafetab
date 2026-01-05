'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Coffee, Users, QrCode, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState('')

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (qrCode.trim()) {
      router.push(`/table/${qrCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[var(--background)]">
      {/* Background glow blobs - cafe warm colors */}
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
        </motion.div>

        {/* Staff Links */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/seller"
            className="card-glass rounded-xl p-6 text-center hover:bg-[var(--muted)] transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Staff Login</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Manage tables & tabs
            </p>
          </Link>

          <Link
            href="/admin"
            className="card-glass rounded-xl p-6 text-center hover:bg-[var(--muted)] transition-colors group"
          >
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Admin</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Products & settings
            </p>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
