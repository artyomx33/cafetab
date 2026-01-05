'use client'

import { cn } from '@/lib/utils'

type IconBoxColor = 'gold' | 'teal' | 'purple' | 'green'
type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl'

interface IconBoxProps {
  color?: IconBoxColor
  size?: IconBoxSize
  className?: string
  children: React.ReactNode
}

const colorClasses: Record<IconBoxColor, string> = {
  gold: 'icon-box-gold',
  teal: 'icon-box-teal',
  purple: 'icon-box-purple',
  green: 'icon-box-green',
}

const sizeClasses: Record<IconBoxSize, string> = {
  sm: 'icon-box-sm',
  md: 'icon-box-md',
  lg: 'icon-box-lg',
  xl: 'icon-box-xl',
}

export function IconBox({
  color = 'gold',
  size = 'md',
  className,
  children
}: IconBoxProps) {
  return (
    <div className={cn(
      'icon-box',
      colorClasses[color],
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}
