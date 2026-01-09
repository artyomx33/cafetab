/**
 * Table Status Computation
 * Pure function to determine table status based on activity
 *
 * Luna's requirements:
 * - Status decided by most urgent condition first
 * - Payment state > time since last order
 * - Grace periods for new tabs and recently closed
 * - Tab total is a modifier, not a trigger
 */

export type TableStatus = 'calm' | 'warm' | 'hot' | 'urgent'

export type StatusIntent = 'fresh' | 'check-in' | 'stalled' | 'action'

export interface TableStatusInput {
  tabOpenedAt: string | null
  lastOrderAt: string | null
  tabClosedAt: string | null
  tabTotal: number
  paymentState: 'open' | 'paying' | 'partial' | 'closed' | null
  hasActiveTab: boolean
}

// Map status to human intent for UX copy
export const statusIntent: Record<TableStatus, StatusIntent> = {
  calm: 'fresh',
  warm: 'check-in',
  hot: 'stalled',
  urgent: 'action',
}

// Animation durations (in seconds) - different speeds per Luna's guidance
export const statusPulseDuration: Record<TableStatus, number> = {
  calm: 10,    // Very slow or static
  warm: 6,     // Gentle pulse
  hot: 3.5,    // Clear pulse
  urgent: 0,   // Solid glow (no pulse)
}

// Colors for each status
export const statusColors: Record<TableStatus, { ring: string; glow: string }> = {
  calm: { ring: 'rgb(34, 197, 94)', glow: 'rgba(34, 197, 94, 0.3)' },      // Green
  warm: { ring: 'rgb(245, 158, 11)', glow: 'rgba(245, 158, 11, 0.3)' },    // Amber
  hot: { ring: 'rgb(249, 115, 22)', glow: 'rgba(249, 115, 22, 0.4)' },     // Orange
  urgent: { ring: 'rgb(239, 68, 68)', glow: 'rgba(239, 68, 68, 0.5)' },    // Red (solid)
}

/**
 * Compute table status based on current state
 * Priority order (Luna's logic):
 * 1. Payment state (urgent if paying/partial)
 * 2. Time since last order (hot > warm > calm)
 * 3. Grace periods for new/closed tabs
 */
export function computeTableStatus(input: TableStatusInput): TableStatus {
  const {
    tabOpenedAt,
    lastOrderAt,
    tabClosedAt,
    paymentState,
    hasActiveTab,
  } = input

  // No active tab = calm (available table)
  if (!hasActiveTab || !tabOpenedAt) {
    return 'calm'
  }

  const now = new Date()

  // Edge Case A: Recently closed table - grace period
  if (tabClosedAt) {
    const minutesSinceClose = getMinutesSince(tabClosedAt)
    if (minutesSinceClose < 5) {
      return 'calm' // 5 min grace after close
    }
  }

  // Priority 1: Payment state (most urgent)
  if (paymentState === 'paying' || paymentState === 'partial') {
    return 'urgent'
  }

  // Edge Case B: Brand new tab - grace period
  const minutesSinceOpen = getMinutesSince(tabOpenedAt)
  if (minutesSinceOpen < 3) {
    return 'calm' // 3 min grace for new tabs
  }

  // Priority 2: Time since last order
  const minutesSinceLastOrder = lastOrderAt
    ? getMinutesSince(lastOrderAt)
    : minutesSinceOpen // If no orders yet, use tab open time

  if (minutesSinceLastOrder > 20) {
    return 'hot'
  }

  if (minutesSinceLastOrder > 10) {
    return 'warm'
  }

  return 'calm'
}

/**
 * Helper to calculate minutes since a timestamp
 */
function getMinutesSince(timestamp: string): number {
  const then = new Date(timestamp)
  const now = new Date()
  return (now.getTime() - then.getTime()) / (1000 * 60)
}

/**
 * Get CSS class for pulse animation
 */
export function getStatusPulseClass(status: TableStatus): string {
  switch (status) {
    case 'calm':
      return 'animate-pulse-calm'
    case 'warm':
      return 'animate-pulse-warm'
    case 'hot':
      return 'animate-pulse-hot'
    case 'urgent':
      return 'animate-glow-urgent'
    default:
      return ''
  }
}
