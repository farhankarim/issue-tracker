'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, LogOut } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function ShiftStartPage() {
  const router = useRouter()
  const { shiftActive, startShift, logout } = useAppStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (shiftActive) {
      router.replace('/dashboard')
    }
  }, [shiftActive, router])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStartShift = () => {
    startShift()
    router.push('/dashboard')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  if (shiftActive) return null

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Shift Management</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} className="text-[var(--on-surface-variant)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Card */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--outline)]/10 w-full max-w-sm flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <Briefcase size={36} className="text-[var(--on-primary-container)]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[var(--on-surface)] mb-2">
              Ready to Start Your Shift?
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Location tracking will be active during your shift.
            </p>
          </div>
          <button
            onClick={handleStartShift}
            className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50"
          >
            Start Shift
          </button>
        </div>

        {/* Date & Time */}
        <div className="text-center">
          <p className="text-sm text-[var(--on-surface-variant)]">{formattedDate}</p>
          <p className="text-2xl font-semibold text-[var(--on-surface)] mt-1">{formattedTime}</p>
        </div>
      </div>
    </div>
  )
}
