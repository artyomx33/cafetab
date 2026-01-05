'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This page is deprecated - redirect to home
export default function DeprecatedTabPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}
