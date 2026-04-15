'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppStore, type Activity } from '@/lib/store'
import LoadingOverlay from '@/components/loading-overlay'
import Snackbar from '@/components/snackbar'

const visitTypes: Activity['type'][] = ['Call', 'Visit']
const outcomes = ['Interested', 'Not Interested', 'Follow-up Required', 'Closed']

export default function CheckinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId') ?? ''
  const { updateLead, leads } = useAppStore()

  const lead = leads.find((l) => l.id === leadId)

  const now = new Date()
  const formattedDateTime = now.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const simLat = (24.86 + (Math.random() - 0.5) * 0.01).toFixed(6)
  const simLng = (67.0 + (Math.random() - 0.5) * 0.01).toFixed(6)

  const [form, setForm] = useState({
    visitType: 'Call' as Activity['type'],
    outcome: 'Interested',
    followUpDate: '',
    remarks: '',
  })
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as const })

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      if (lead) {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          type: form.visitType,
          date: now.toISOString().split('T')[0],
          outcome: form.outcome,
          remarks: form.remarks.trim(),
        }
        const updates: Partial<typeof lead> = {
          activities: [...lead.activities, newActivity],
        }
        if (form.outcome === 'Follow-up Required' && form.followUpDate) {
          updates.followUpDate = form.followUpDate
          updates.followUpType = form.visitType === 'Visit' ? 'Visit' : 'Call'
          updates.status = 'Follow-up'
        } else if (form.outcome === 'Not Interested') {
          updates.status = 'Not Interested'
        } else if (form.outcome === 'Closed') {
          updates.status = 'Closed'
        } else if (form.outcome === 'Interested') {
          updates.status = 'In Process'
        }
        updateLead(lead.id, updates)
      }
      setLoading(false)
      setSnackbar({ visible: true, message: 'Data uploaded successfully', type: 'success' })
      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    }, 800)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--on-surface)]'
  const readOnlyClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--outline)]/50 bg-[var(--surface-variant)]/30 text-sm text-[var(--on-surface-variant)]'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-6">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-[var(--on-surface)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Check-In</h1>
      </div>

      {/* Form */}
      <div className="px-4 mt-4 space-y-4">
        {/* Date & Time */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Date & Time</label>
          <input type="text" readOnly value={formattedDateTime} className={readOnlyClass} />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Location</label>
          <input type="text" readOnly value={`${simLat}, ${simLng}`} className={readOnlyClass} />
        </div>

        {/* Visit Type */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Visit Type</label>
          <select
            value={form.visitType}
            onChange={(e) => setForm({ ...form, visitType: e.target.value as Activity['type'] })}
            className={inputClass}
          >
            {visitTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Meeting Outcome */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Meeting Outcome</label>
          <select
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value })}
            className={inputClass}
          >
            {outcomes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Follow-up Date (conditional) */}
        {form.outcome === 'Follow-up Required' && (
          <div>
            <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Follow-up Date</label>
            <input
              type="date"
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
              className={inputClass}
            />
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Remarks</label>
          <textarea
            placeholder="Enter remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className={`${inputClass} min-h-[100px]`}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Submit Check-In
        </button>
      </div>

      <LoadingOverlay visible={loading} />
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </div>
  )
}
