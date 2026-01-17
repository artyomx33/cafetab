'use client'

export function ProcessingStep() {
  return (
    <div className="py-16 text-center">
      <div className="w-12 h-12 mx-auto mb-6 border-4 border-[var(--gold-500)] border-t-transparent rounded-full animate-spin" />
      <h2 className="text-xl font-bold text-white mb-2">Extracting Menu Items</h2>
      <p className="text-[var(--muted-foreground)]">
        AI is analyzing your menu photo...
      </p>
      <p className="text-sm text-[var(--muted-foreground)] mt-4">
        This usually takes 5-15 seconds
      </p>
    </div>
  )
}
