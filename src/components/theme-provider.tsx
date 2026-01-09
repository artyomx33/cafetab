'use client'

import { ToastProvider } from '@/components/ui/toast'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Premium theme only - no switching needed
  return <ToastProvider>{children}</ToastProvider>
}
