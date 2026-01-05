'use client'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Premium theme only - no switching needed
  return <>{children}</>
}
