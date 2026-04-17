'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  MoreVertical,
  X,
  Phone,
  MapPin,
  Calendar,
  Plus,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import BottomNav from '@/components/bottom-nav'
import AlertDialog from '@/components/alert-dialog'

export default function DashboardPage() {
  const router = useRouter()
  const {
    user,
    leads,
    updateDismissed,
    dismissUpdate,
    endShift,
    shiftActive,
  } = useAppStore()

  const [menuOpen, setMenuOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shiftActive) {
      router.replace('/shift-start')
    }
  }, [shiftActive, router])

  // Close menu/FAB on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleEndShift = () => {
    setMenuOpen(false)
    setShowEndShiftDialog(true)
  }

  const confirmEndShift = () => {
    setShowEndShiftDialog(false)
    endShift()
    router.push('/shift-start')
  }

  const followUpCount = leads.filter((l) => l.status === 'Follow-up').length

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const userName = user?.name ?? 'User'

  if (!shiftActive) return null

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Dashboard</h1>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-[var(--on-surface-variant)]" />
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={20} className="text-[var(--on-surface-variant)]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--outline)]/20 rounded-xl shadow-lg py-1 min-w-[160px] z-50">
                <button
                  onClick={handleEndShift}
                  className="w-full text-left px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-variant)] transition-colors"
                >
                  End Shift
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Banner */}
      {!updateDismissed && (
        <div className="mx-4 mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-800 flex-1">
            A new update is available. Please update your app.
          </p>
          <button
            onClick={dismissUpdate}
            className="ml-2 p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Dismiss update"
          >
            <X size={16} className="text-blue-800" />
          </button>
        </div>
      )}

      {/* Greeting Card */}
      <div className="px-4 mt-4">
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--outline)]/10">
          <h2 className="text-xl font-semibold text-[var(--on-surface)]">
            Welcome, {userName}
          </h2>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">{formattedDate}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mt-4">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => router.push('/leads')}
            className="flex-shrink-0 w-40 bg-[var(--primary-container)] rounded-2xl p-4 shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
              <Phone size={20} className="text-[var(--on-primary-container)]" />
            </div>
            <p className="text-xs text-[var(--on-primary-container)]/70 font-medium">
              Today&apos;s Calls
            </p>
            <p className="text-2xl font-bold text-[var(--on-primary-container)] mt-1">8/15</p>
          </button>

          <button
            onClick={() => router.push('/leads')}
            className="flex-shrink-0 w-40 bg-[var(--primary-container)] rounded-2xl p-4 shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
              <MapPin size={20} className="text-[var(--on-primary-container)]" />
            </div>
            <p className="text-xs text-[var(--on-primary-container)]/70 font-medium">
              Today&apos;s Visits
            </p>
            <p className="text-2xl font-bold text-[var(--on-primary-container)] mt-1">3/5</p>
          </button>

          <button
            onClick={() => router.push('/follow-ups')}
            className="flex-shrink-0 w-40 bg-[var(--primary-container)] rounded-2xl p-4 shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
              <Calendar size={20} className="text-[var(--on-primary-container)]" />
            </div>
            <p className="text-xs text-[var(--on-primary-container)]/70 font-medium">
              Follow-up Leads
            </p>
            <p className="text-2xl font-bold text-[var(--on-primary-container)] mt-1">
              {followUpCount}
            </p>
          </button>
        </div>
      </div>

      {/* Speed Dial FAB */}
      <div ref={fabRef} className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-[var(--surface)] text-[var(--on-surface)] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-[var(--outline)]/10">
                Sync
              </span>
              <button
                onClick={() => {
                  setFabOpen(false)
                  router.push('/sync')
                }}
                className="w-11 h-11 rounded-full bg-amber-400 text-white shadow-md flex items-center justify-center hover:bg-amber-500 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[var(--surface)] text-[var(--on-surface)] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-[var(--outline)]/10">
                Follow-up
              </span>
              <button
                onClick={() => {
                  setFabOpen(false)
                  router.push('/follow-ups')
                }}
                className="w-11 h-11 rounded-full bg-amber-400 text-white shadow-md flex items-center justify-center hover:bg-amber-500 transition-colors"
              >
                <CalendarCheck size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[var(--surface)] text-[var(--on-surface)] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-[var(--outline)]/10">
                Visit
              </span>
              <button
                onClick={() => {
                  setFabOpen(false)
                  router.push('/add-lead?type=Visit')
                }}
                className="w-11 h-11 rounded-full bg-amber-400 text-white shadow-md flex items-center justify-center hover:bg-amber-500 transition-colors"
              >
                <MapPin size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[var(--surface)] text-[var(--on-surface)] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-[var(--outline)]/10">
                Call
              </span>
              <a
                href="tel:"
                onClick={() => setFabOpen(false)}
                className="w-11 h-11 rounded-full bg-amber-400 text-white shadow-md flex items-center justify-center hover:bg-amber-500 transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-600 transition-all ${
            fabOpen ? 'rotate-45' : ''
          }`}
          aria-label="Quick actions"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="Dashboard" />

      {/* End Shift Confirmation */}
      <AlertDialog
        open={showEndShiftDialog}
        title="End Shift"
        message="Are you sure you want to end your current shift? Location tracking will be stopped."
        confirmLabel="End Shift"
        cancelLabel="Cancel"
        onConfirm={confirmEndShift}
        onCancel={() => setShowEndShiftDialog(false)}
      />
    </div>
  )
}
