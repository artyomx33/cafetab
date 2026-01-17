'use client'

interface ConfirmStepProps {
  itemCount: number
}

export function ConfirmStep({ itemCount }: ConfirmStepProps) {
  return (
    <div className="py-16 text-center">
      <div className="w-12 h-12 mx-auto mb-6 border-4 border-[var(--gold-500)] border-t-transparent rounded-full animate-spin" />
      <h2 className="text-xl font-bold text-white mb-2">Importing Items</h2>
      <p className="text-[var(--muted-foreground)]">
        Creating {itemCount} products and categories...
      </p>
    </div>
  )
}
