'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { PinInput } from '@/components/ui/pin-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useSellerStore } from '@/stores/seller-store'
import { useVerifyPin } from '@/lib/supabase/hooks'
import { useRestaurant } from '@/contexts/RestaurantContext'

export default function SellerLoginPage() {
  const router = useRouter()
  const { slug } = useRestaurant()
  const { login, stayLoggedIn, setStayLoggedIn } = useSellerStore()
  const { verify, loading, error: verifyError } = useVerifyPin()

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePinComplete = async (completedPin: string) => {
    setError('')
    setIsLoading(true)

    const seller = await verify(completedPin)

    if (seller) {
      login(seller)
      router.push(`/${slug}/seller/tables`)
    } else {
      setError(verifyError || 'Invalid PIN')
      setPin('')
    }

    setIsLoading(false)
  }

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    await handlePinComplete(pin)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
            Staff Login
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Enter your 4-digit PIN to continue
          </p>
        </motion.div>

        {/* PIN Input */}
        <motion.div
          className="card-glass rounded-xl p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PinInput
            length={4}
            value={pin}
            onChange={setPin}
            onComplete={handlePinComplete}
          />

          {/* Error message */}
          {error && (
            <motion.div
              className="badge-error rounded-lg px-4 py-3 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Stay logged in checkbox */}
          <div className="flex justify-center">
            <Checkbox
              label="Stay logged in"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
          </div>

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading || loading || pin.length !== 4}
            className="w-full"
            size="large"
          >
            {isLoading || loading ? 'Logging in...' : 'Login'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
