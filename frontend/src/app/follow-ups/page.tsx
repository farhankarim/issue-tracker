'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import BottomNav from '@/components/bottom-nav'
import AlertDialog from '@/components/alert-dialog'

const TODAY = '2026-04-15'

export default function FollowUpsPage() {
  const router = useRouter()
  const { leads, updateLead } = useAppStore()
  const [filterCall, setFilterCall] = useState(true)
  const [filterVisit, setFilterVisit] = useState(true)
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [removingIds, setRemovingIds] = useState<string[]>([])
  const [confirmLead, setConfirmLead] = useState<string | null>(null)

  const followUpLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        l.status === 'Follow-up' &&
        l.followUpDate === TODAY &&
        !removedIds.includes(l.id) &&
        ((filterCall && l.followUpType === 'Call') || (filterVisit && l.followUpType === 'Visit')),
    )
  }, [leads, filterCall, filterVisit, removedIds])

  const handleMarkDone = () => {
    if (!confirmLead) return
    const id = confirmLead
    setConfirmLead(null)
    setRemovingIds((prev) => [...prev, id])
    setTimeout(() => {
      updateLead(id, { status: 'Closed' })
      setRemovingIds((prev) => prev.filter((x) => x !== id))
      setRemovedIds((prev) => [...prev, id])
    }, 300)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* AppBar */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[var(--surface-variant)]">
          <ArrowLeft size={24} className="text-[var(--on-surface)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Today&apos;s Follow-ups</h1>
      </header>

      {/* Summary card */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-[var(--primary-container)] flex items-center gap-3">
        <Calendar size={28} className="text-[var(--on-primary-container)]" />
        <p className="text-sm font-medium text-[var(--on-primary-container)]">
          {followUpLeads.length} lead{followUpLeads.length !== 1 ? 's' : ''} require follow-up today
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 mt-4">
        <button
          onClick={() => setFilterCall((v) => !v)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            filterCall
              ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
              : 'bg-transparent text-[var(--on-surface-variant)] border-[var(--outline)]'
          }`}
        >
          Call
        </button>
        <button
          onClick={() => setFilterVisit((v) => !v)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            filterVisit
              ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
              : 'bg-transparent text-[var(--on-surface-variant)] border-[var(--outline)]'
          }`}
        >
          Visit
        </button>
      </div>

      {/* Lead list */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {followUpLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--on-surface-variant)]">
            <CheckCircle size={64} className="mb-4 opacity-60" />
            <p className="text-base font-medium">No follow-ups scheduled for today 🎉</p>
          </div>
        ) : (
          followUpLeads.map((lead) => (
            <div
              key={lead.id}
              className={`rounded-2xl bg-[var(--surface)] border border-[var(--outline)]/10 p-4 shadow-sm transition-all duration-300 ${
                removingIds.includes(lead.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--on-surface)]">{lead.customerName}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{lead.phone}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    lead.followUpType === 'Call'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {lead.followUpType}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {lead.followUpType === 'Call' ? <Phone size={12} /> : <MapPin size={12} />}
                <span className="text-xs text-[var(--on-surface-variant)]">Scheduled: {lead.followUpDate}</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--primary-container)] text-[var(--on-primary-container)]">
                  {lead.status}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 py-2 rounded-full text-center text-xs font-medium border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-container)] transition-colors"
                >
                  Call Now
                </a>
                <button
                  onClick={() => setConfirmLead(lead.id)}
                  className="flex-1 py-2 rounded-full text-xs font-medium bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity"
                >
                  Mark Done
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog
        open={confirmLead !== null}
        title="Mark as Done"
        message="Are you sure you want to mark this follow-up as done? The lead will be moved to Closed status."
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleMarkDone}
        onCancel={() => setConfirmLead(null)}
      />

      <BottomNav activeTab="Follow-ups" />
    </div>
  )
}
