import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CafeTab - Seller",
  description: "Seller portal for CafeTab",
};

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header with logo */}
      <header className="glass border-b border-[var(--card-border)] flex-shrink-0 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="text-white">Cafe</span>
          <span className="text-gradient-gold">Tab</span>
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
