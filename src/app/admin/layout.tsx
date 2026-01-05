'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Utensils, ShoppingBag, UserCog, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tables', label: 'Tables', icon: Utensils },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/sellers', label: 'Sellers', icon: UserCog },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-[#1E1E22]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-full bg-[var(--gold-500)] flex items-center justify-center text-xl">
              ☕
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CafeTab</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Admin</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative',
                    isActive
                      ? 'bg-[var(--gold-500)]/10 text-[var(--gold-400)]'
                      : 'text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--charcoal-800)]'
                  )}
                >
                  {/* Left accent bar for active */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--gold-500)] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
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
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors flex-1',
                  isActive
                    ? 'text-[var(--gold-400)]'
                    : 'text-[var(--muted-foreground)]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:pl-72">
        <main className="pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
