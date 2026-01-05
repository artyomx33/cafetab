'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Glow, type GlowVariant } from './glow'

interface ListRowProps {
  avatar?: React.ReactNode
  title: string
  code?: string
  subtitle?: string
  badges?: Array<{
    label: string
    variant: 'success' | 'warning' | 'error' | 'gold' | 'teal' | 'muted'
  }>
  stat?: {
    icon?: React.ReactNode
    value: string | number
    color?: 'gold' | 'teal' | 'default'
  }
  rightContent?: React.ReactNode
  onClick?: () => void
  className?: string
  index?: number
  glowVariant?: GlowVariant
  disableGlow?: boolean
}

const badgeVariants = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  gold: 'bg-[var(--gold-500)]/20 text-[var(--gold-400)] border-[var(--gold-500)]/30',
  teal: 'bg-[var(--teal-500)]/20 text-[var(--teal-400)] border-[var(--teal-500)]/30',
  muted: 'bg-[var(--charcoal-700)]/50 text-[var(--muted-foreground)] border-[var(--charcoal-600)]/30',
}

const statColors = {
  gold: 'text-[var(--gold-400)]',
  teal: 'text-[var(--teal-400)]',
  default: 'text-[var(--muted-foreground)]',
}

export function ListRow({
  avatar,
  title,
  code,
  subtitle,
  badges,
  stat,
  rightContent,
  onClick,
  className,
  index = 0,
  glowVariant = 'gold',
  disableGlow = false,
}: ListRowProps) {
  return (
    <Glow variant={glowVariant} disabled={disableGlow} className="rounded-xl">
      <motion.div
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] transition-all duration-300 cursor-pointer hover:bg-[#222226]',
          className
        )}
        onClick={onClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
      {/* Avatar */}
      {avatar && (
        <div className="flex-shrink-0">
          {avatar}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Title Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white truncate">{title}</span>

          {/* Code Badge */}
          {code && (
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-[var(--charcoal-700)] text-[var(--muted-foreground)]">
              {code}
            </span>
          )}

          {/* Status Badges */}
          {badges?.map((badge, i) => (
            <span
              key={i}
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full border',
                badgeVariants[badge.variant]
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Subtitle Row */}
        <div className="flex items-center gap-2 mt-1">
          {subtitle && (
            <span className="text-sm text-[var(--muted-foreground)]">{subtitle}</span>
          )}
          {stat && (
            <span className={cn('flex items-center gap-1 text-sm font-medium', statColors[stat.color || 'default'])}>
              {stat.icon}
              {stat.value}
            </span>
          )}
        </div>
      </div>

      {/* Right Content */}
        {rightContent && (
          <div className="flex-shrink-0 text-right">
            {rightContent}
          </div>
        )}
      </motion.div>
    </Glow>
  )
}

// Avatar component for list rows
interface ListAvatarProps {
  src?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
}

export function ListAvatar({ src, fallback, size = 'md' }: ListAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={fallback}
        className={cn('rounded-full object-cover', avatarSizes[size])}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center font-bold text-[var(--charcoal-950)]',
      avatarSizes[size]
    )}>
      {fallback.charAt(0).toUpperCase()}
    </div>
  )
}
