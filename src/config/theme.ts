// GolfTab Brand Colors
export const colors = {
  // Primary brand colors
  courseGreen: '#1B4332',
  sandBeige: '#D4A574',
  gold: '#C9A227',
  offWhite: '#FAF9F6',
  charcoal: '#2D3436',

  // Semantic colors derived from brand
  primary: '#1B4332', // Course Green
  secondary: '#C9A227', // Gold
  accent: '#D4A574', // Sand Beige
  background: '#FAF9F6', // Off-White
  text: '#2D3436', // Charcoal
} as const

export type ThemeColor = keyof typeof colors

// Status colors for tabs
export const statusColors = {
  open: colors.courseGreen,
  closed: colors.gold,
  paid: colors.sandBeige,
} as const

// Color utilities
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}
