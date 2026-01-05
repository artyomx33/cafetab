'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { IconBox } from './icon-box'
import { Glow, type GlowVariant } from './glow'

type ActionCardColor = 'gold' | 'teal' | 'purple' | 'green'

interface ActionCardProps {
  href: string
  icon: React.ReactNode
  color?: ActionCardColor
  title: string
  subtitle: string
  glow?: boolean
  className?: string
}

export function ActionCard({
  href,
  icon,
  color = 'gold',
  title,
  subtitle,
  className
}: ActionCardProps) {
  return (
    <Link href={href}>
      <Glow variant={color as GlowVariant} className="rounded-xl" spread={40} blur={5}>
        <motion.div
          className={cn(
            'bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-xl cursor-pointer hover:bg-[#1E1E22] transition-colors',
            className
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="flex items-center gap-4">
            <IconBox color={color} size="lg">
              {icon}
            </IconBox>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>
            </div>
          </div>
        </motion.div>
      </Glow>
    </Link>
  )
}
