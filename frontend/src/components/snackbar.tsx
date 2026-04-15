'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface SnackbarProps {
  message: string
  type?: 'info' | 'error' | 'success'
  visible: boolean
  onClose: () => void
}

export default function Snackbar({ message, type = 'info', visible, onClose }: SnackbarProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  const colors = {
    info: 'bg-[var(--primary)] text-[var(--on-primary)]',
    error: 'bg-[var(--error)] text-white',
    success: 'bg-[var(--success)] text-white',
  }

  return (
    <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto ${colors[type]} rounded-xl px-4 py-3 flex items-center justify-between shadow-lg z-[90] animate-slide-up`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  )
}
