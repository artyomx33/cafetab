'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { PinInput } from '@/components/ui/pin-input'

export default function Home() {
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleComplete = (value: string) => {
    if (value.length === 6) {
      router.push(`/tab/${value}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) {
      router.push(`/tab/${code}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--background)]">
      {/* Background glow blobs */}
      <div className="glow-blob glow-blob-gold absolute top-20 left-20 w-96 h-96" />
      <div className="glow-blob glow-blob-teal absolute bottom-20 right-20 w-96 h-96" />

      <motion.main
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-gradient-gold">
            GolfTab
          </h1>
          <p className="text-xl text-[var(--muted-foreground)]">
            Enter your group code
          </p>
        </motion.div>

        <motion.div
          className="card-glass rounded-xl p-8 glow-gold-subtle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <PinInput
              length={6}
              value={code}
              onChange={setCode}
              onComplete={handleComplete}
              className="mb-8"
            />

            <motion.button
              type="submit"
              disabled={code.length !== 6}
              className="w-full h-14 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
              whileHover={{ scale: code.length === 6 ? 1.02 : 1 }}
              whileTap={{ scale: code.length === 6 ? 0.98 : 1 }}
            >
              View Tab
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Enter the 6-digit code provided by your seller
            </p>
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
