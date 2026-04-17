'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Fingerprint } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import LoadingOverlay from '@/components/loading-overlay'
import Snackbar from '@/components/snackbar'

export default function FingerprintSettingsPage() {
  const router = useRouter()
  const { fingerprintEnabled, setFingerprintEnabled } = useAppStore()

  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'info' | 'error' | 'success' }>({ visible: false, message: '', type: 'success' })

  const handleToggle = useCallback(() => {
    if (!fingerprintEnabled) {
      // Enabling: simulate fingerprint scan
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setFingerprintEnabled(true)
        setSnackbar({ visible: true, message: 'Fingerprint registered successfully', type: 'success' })
      }, 1000)
    } else {
      // Disabling
      setFingerprintEnabled(false)
      setSnackbar({ visible: true, message: 'Fingerprint login disabled', type: 'info' })
    }
  }, [fingerprintEnabled, setFingerprintEnabled])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-[var(--on-surface)]" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--on-surface)]">Fingerprint Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {/* Info Card */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--outline)]/10 flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <Fingerprint size={32} className="text-[var(--on-primary-container)]" />
          </div>
          <p className="text-sm text-[var(--on-surface-variant)] text-center">
            Use your fingerprint for quick and secure login to the app.
          </p>
        </div>

        {/* Toggle */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--outline)]/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--on-surface)]">
                Enable Fingerprint Login
              </p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                {fingerprintEnabled
                  ? 'Fingerprint authentication is active'
                  : 'Tap to register your fingerprint'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                fingerprintEnabled
                  ? 'bg-[var(--primary)]'
                  : 'bg-[var(--outline)]/40'
              }`}
              role="switch"
              aria-checked={fingerprintEnabled}
              aria-label="Enable Fingerprint Login"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  fingerprintEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} />

      {/* Snackbar */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </div>
  )
}
