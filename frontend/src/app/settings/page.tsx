'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, User, Lock, Fingerprint, Camera, Moon, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import BottomNav from '@/components/bottom-nav'
import Snackbar from '@/components/snackbar'
import LoadingOverlay from '@/components/loading-overlay'

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--outline)]/30'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

const sectionHeader = 'text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] px-4 py-2 mt-4'
const listTile = 'flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-variant)]/50 cursor-pointer'
const divider = 'border-b border-[var(--outline)]/10'

export default function SettingsPage() {
  const router = useRouter()
  const {
    user,
    fingerprintEnabled,
    setFingerprintEnabled,
    allowScreenshots,
    setAllowScreenshots,
    darkMode,
    toggleDarkMode,
    shiftActive,
  } = useAppStore()

  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'info' | 'success' | 'error' }>({ visible: false, message: '', type: 'info' })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleFingerprintToggle = async (val: boolean) => {
    if (val) {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1000))
      setLoading(false)
      setFingerprintEnabled(true)
      setSnackbar({ visible: true, message: 'Fingerprint registered', type: 'success' })
    } else {
      setFingerprintEnabled(false)
      setSnackbar({ visible: true, message: 'Fingerprint disabled', type: 'info' })
    }
  }

  const handleDarkModeToggle = () => {
    toggleDarkMode()
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {loading && <LoadingOverlay visible={true} />}

      {/* AppBar */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/10 px-4 py-3">
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Settings</h1>
      </header>

      {/* Account */}
      <h2 className={sectionHeader}>Account</h2>
      <div className="mx-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--outline)]/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <User size={24} className="text-[var(--on-primary-container)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--on-surface)]">{user?.name || 'Sales Agent'}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">{user?.email || 'agent@salescrm.com'}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">{user?.role || 'Agent'}</p>
          </div>
        </div>
      </div>
      <div className={divider} />
      <div className={listTile} onClick={() => router.push('/change-password')}>
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-[var(--on-surface-variant)]" />
          <span className="text-sm text-[var(--on-surface)]">Change Password</span>
        </div>
        <ChevronRight size={18} className="text-[var(--on-surface-variant)]" />
      </div>
      <div className={divider} />

      {/* Security */}
      <h2 className={sectionHeader}>Security</h2>
      <div className={listTile}>
        <div className="flex items-center gap-3">
          <Fingerprint size={20} className="text-[var(--on-surface-variant)]" />
          <span className="text-sm text-[var(--on-surface)]">Enable Fingerprint Login</span>
        </div>
        <SwitchToggle checked={fingerprintEnabled} onChange={handleFingerprintToggle} />
      </div>
      <div className={divider} />
      <div className={listTile}>
        <div className="flex items-center gap-3">
          <Camera size={20} className="text-[var(--on-surface-variant)]" />
          <span className="text-sm text-[var(--on-surface)]">Allow Screenshots</span>
        </div>
        <SwitchToggle checked={allowScreenshots} onChange={(val) => setAllowScreenshots(val)} />
      </div>
      <div className={divider} />

      {/* Appearance */}
      <h2 className={sectionHeader}>Appearance</h2>
      <div className={listTile}>
        <div className="flex items-center gap-3">
          <Moon size={20} className="text-[var(--on-surface-variant)]" />
          <span className="text-sm text-[var(--on-surface)]">Dark Mode</span>
        </div>
        <SwitchToggle checked={darkMode} onChange={handleDarkModeToggle} />
      </div>
      <div className={divider} />

      {/* Sync */}
      <h2 className={sectionHeader}>Sync</h2>
      <div className={listTile} onClick={() => router.push('/sync')}>
        <div className="flex items-center gap-3">
          <RefreshCw size={20} className="text-[var(--on-surface-variant)]" />
          <span className="text-sm text-[var(--on-surface)]">Sync Data</span>
        </div>
        <ChevronRight size={18} className="text-[var(--on-surface-variant)]" />
      </div>
      <div className={divider} />

      {/* Shift */}
      <h2 className={sectionHeader}>Shift</h2>
      <div className="px-4 py-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            shiftActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {shiftActive ? 'Shift Active' : 'No Active Shift'}
        </span>
      </div>
      <div className={divider} />

      {/* About */}
      <h2 className={sectionHeader}>About</h2>
      <div className="px-4 py-3">
        <p className="text-sm text-[var(--on-surface)]">Sales CRM v1.0.0</p>
        <p className="text-xs text-[var(--on-surface-variant)] mt-1">Support: support@salescrm.com</p>
      </div>

      <Snackbar message={snackbar.message} type={snackbar.type} visible={snackbar.visible} onClose={() => setSnackbar((s) => ({ ...s, visible: false }))} />
      <BottomNav activeTab="Settings" />
    </div>
  )
}
