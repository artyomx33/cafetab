'use client'

import { useThemeStore, type Theme } from '@/stores/theme-store'
import { Sun, Moon, Sparkles } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  showLabels?: boolean
}

export function ThemeToggle({ className = '', showLabels = true }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className={`inline-flex rounded-lg p-1 ${className}`} style={{ background: 'var(--muted)' }}>
      <button
        onClick={() => setTheme('classic')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
          transition-all duration-200
          ${theme === 'classic'
            ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }
        `}
      >
        <Sun className="w-4 h-4" />
        {showLabels && <span>Classic</span>}
      </button>
      <button
        onClick={() => setTheme('premium')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
          transition-all duration-200
          ${theme === 'premium'
            ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm glow-gold'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }
        `}
      >
        <Sparkles className="w-4 h-4" />
        {showLabels && <span>Premium</span>}
      </button>
    </div>
  )
}

// Compact version for mobile
export function ThemeToggleCompact({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        hover:bg-[var(--muted)]
        ${className}
      `}
      title={`Switch to ${theme === 'classic' ? 'Premium' : 'Classic'} theme`}
    >
      {theme === 'classic' ? (
        <Sparkles className="w-5 h-5 text-[var(--muted-foreground)]" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--primary)]" />
      )}
    </button>
  )
}
