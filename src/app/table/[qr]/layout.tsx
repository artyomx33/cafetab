import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CafeTab - Your Table',
  description: 'Order, track, and pay for your cafe experience',
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#F5EBD7]">
      {/* Mobile-optimized container */}
      <div className="mx-auto max-w-2xl">
        {children}
      </div>
    </div>
  )
}
