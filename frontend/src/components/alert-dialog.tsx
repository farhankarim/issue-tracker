'use client'

interface AlertDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export default function AlertDialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
}: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--on-surface-variant)] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-container)] rounded-full transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-[var(--on-primary)] rounded-full hover:opacity-90 transition-opacity"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
