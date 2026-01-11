'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { LayoutDashboard, Package, Users, Settings, UtensilsCrossed, ChefHat, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { restaurant, slug, loading } = useRestaurant()

  const navItems = [
    { href: `/${slug}/admin`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${slug}/admin/kitchen`, label: 'Kitchen', icon: ChefHat },
    { href: `/${slug}/admin/products`, label: 'Products', icon: Package },
    { href: `/${slug}/admin/tables`, label: 'Tables', icon: UtensilsCrossed },
    { href: `/${slug}/admin/payments`, label: 'Payments', icon: CreditCard },
    { href: `/${slug}/admin/sellers`, label: 'Staff', icon: Users },
    { href: `/${slug}/admin/settings`, label: 'Settings', icon: Settings },
  ]

  // Get restaurant emoji
  const getEmoji = () => {
    if (slug === 'burro') return '🫏'
    if (slug === 'green-vibes') return '🥗'
    return '🌙'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--muted-foreground)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col glass border-r border-[var(--card-border)]">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--card-border)]">
            <Link href={`/${slug}`} className="flex items-center gap-2">
              <span className="text-2xl">{getEmoji()}</span>
              <div>
                <h1 className="font-bold text-lg">{restaurant?.name || slug}</h1>
                <p className="text-xs text-[var(--muted-foreground)]">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative',
                        isActive
                          ? 'bg-[var(--gold-500)]/10 text-[var(--gold-400)]'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--charcoal-800)] hover:text-white'
                      )}
                    >
                      {/* Left accent bar for active */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--gold-500)] rounded-r-full" />
                      )}
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--card-border)]">
            <Link
              href={`/${slug}/seller`}
              className="block text-center text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              Switch to Staff View →
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#1E1E22] border-t border-[#2A2A2E]">
        <nav className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors flex-1',
                  isActive
                    ? 'text-[var(--gold-400)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
