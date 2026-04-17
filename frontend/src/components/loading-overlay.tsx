'use client'

export default function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
      <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--on-surface-variant)]">Loading...</span>
      </div>
    </div>
  )
}
