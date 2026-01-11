'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { LayoutDashboard, Package, Users, Settings, UtensilsCrossed } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { restaurant, slug, usesDatabase } = useRestaurant()

  const navItems = [
    { href: `/${slug}/admin`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${slug}/admin/products`, label: 'Products', icon: Package },
    { href: `/${slug}/admin/tables`, label: 'Tables', icon: UtensilsCrossed },
    { href: `/${slug}/admin/sellers`, label: 'Staff', icon: Users },
    { href: `/${slug}/admin/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-[var(--card-border)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--card-border)]">
          <Link href={`/${slug}`} className="flex items-center gap-2">
            <span className="text-2xl">🫏</span>
            <div>
              <h1 className="font-bold text-lg">{restaurant.name}</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Admin Panel</p>
            </div>
          </Link>
          {!usesDatabase && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-[var(--teal-500)]/20 text-[var(--teal-400)] rounded-full">
              Demo Mode
            </span>
          )}
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--gold-500)] text-[var(--charcoal-900)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--charcoal-800)] hover:text-white'
                    }`}
                  >
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
