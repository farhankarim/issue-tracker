'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Users, CalendarCheck, LayoutDashboard, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import Snackbar from '@/components/snackbar'

const modules = [
  { key: 'visits', label: 'Visits', icon: MapPin },
  { key: 'calls', label: 'Calls', icon: Phone },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'follow-ups', label: 'Follow-ups', icon: CalendarCheck },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function SyncPage() {
  const router = useRouter()
  const { syncStatus, setSyncStatus } = useAppStore()
  const [syncingAll, setSyncingAll] = useState(false)
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'info' | 'success' | 'error' }>({ visible: false, message: '', type: 'info' })

  const syncedCount = modules.filter((m) => syncStatus[m.key] === 'success').length

  const syncModule = useCallback(
    (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setSyncStatus(key, 'syncing')
        setTimeout(() => {
          const success = Math.random() < 0.8
          setSyncStatus(key, success ? 'success' : 'error')
          resolve(success)
        }, 2000)
      })
    },
    [setSyncStatus],
  )

  const handleSync = async (key: string) => {
    if (syncStatus[key] === 'syncing') return
    await syncModule(key)
  }

  const handleSyncAll = async () => {
    if (syncingAll) return
    setSyncingAll(true)
    let allSuccess = true
    for (const m of modules) {
      const ok = await syncModule(m.key)
      if (!ok) allSuccess = false
    }
    setSyncingAll(false)
    setSnackbar({
      visible: true,
      message: allSuccess ? 'All modules synced successfully' : 'Some modules failed. Check status above.',
      type: allSuccess ? 'success' : 'error',
    })
  }

  const getStatusInfo = (key: string) => {
    const s = syncStatus[key]
    if (s === 'syncing') return { text: 'Syncing...', color: 'text-blue-500' }
    if (s === 'success') return { text: 'Sync successful', color: 'text-[var(--success)]' }
    if (s === 'error') return { text: 'Issue occurred. Please try again.', color: 'text-[var(--error)]' }
    return { text: 'Not synced', color: 'text-[var(--on-surface-variant)]/60' }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* AppBar */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[var(--surface-variant)]">
          <ArrowLeft size={24} className="text-[var(--on-surface)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Sync Data</h1>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[var(--surface-variant)]">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-500"
          style={{ width: `${(syncedCount / 5) * 100}%` }}
        />
      </div>
      <p className="text-xs text-[var(--on-surface-variant)] text-center py-2">{syncedCount}/5 modules synced</p>

      {/* Module list */}
      <div className="flex flex-col">
        {modules.map((m) => {
          const Icon = m.icon
          const status = getStatusInfo(m.key)
          const isSyncing = syncStatus[m.key] === 'syncing'
          return (
            <div key={m.key} className="border-b border-[var(--outline)]/10">
              <div className="flex items-center px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-container)] flex items-center justify-center mr-3">
                  <Icon size={20} className="text-[var(--on-primary-container)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--on-surface)]">{m.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {syncStatus[m.key] === 'success' && <CheckCircle size={12} className="text-[var(--success)]" />}
                    {syncStatus[m.key] === 'error' && <XCircle size={12} className="text-[var(--error)]" />}
                    {isSyncing && <RefreshCw size={12} className="text-blue-500 animate-spin" />}
                    <span className={`text-xs ${status.color}`}>{status.text}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSync(m.key)}
                  disabled={isSyncing}
                  className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
                >
                  <RefreshCw size={20} className={`text-[var(--primary)] ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sync All button */}
      <div className="px-4 py-6">
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="w-full py-3 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {syncingAll && <RefreshCw size={16} className="animate-spin" />}
          {syncingAll ? 'Syncing All...' : 'Sync All'}
        </button>
      </div>

      <Snackbar message={snackbar.message} type={snackbar.type} visible={snackbar.visible} onClose={() => setSnackbar((s) => ({ ...s, visible: false }))} />
    </div>
  )
}
