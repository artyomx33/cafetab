'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { IconBox } from './icon-box'
import { Glow, type GlowVariant } from './glow'

type StatCardColor = 'gold' | 'teal' | 'purple' | 'green'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconColor?: StatCardColor
  className?: string
  delay?: number
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = 'gold',
  className,
  delay = 0
}: StatCardProps) {
  return (
    <Glow variant={iconColor as GlowVariant} className="rounded-xl" spread={35} blur={5}>
      <motion.div
        className={cn('bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-xl hover:bg-[#1E1E22] transition-colors', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {label}
            </p>
            <p className="text-3xl font-bold font-serif text-gradient-gold mt-1">
              {value}
            </p>
          </div>
          <IconBox color={iconColor} size="lg">
            {icon}
          </IconBox>
        </div>
      </motion.div>
    </Glow>
  )
}
