'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppStore, type Lead } from '@/lib/store'
import AlertDialog from '@/components/alert-dialog'

const channelOptions: Lead['channel'][] = ['Own', 'BTL', 'Social Media', 'Website', 'Call Center', 'SMS']

export default function AddLeadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillPhone = searchParams.get('phone') ?? ''
  const { addLead } = useAppStore()

  const [form, setForm] = useState({
    customerName: '',
    phone: prefillPhone,
    email: '',
    channel: 'Own' as Lead['channel'],
    source: '',
    remarks: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const isDirty = useCallback(() => {
    return form.customerName !== '' || form.phone !== prefillPhone || form.email !== '' || form.source !== '' || form.remarks !== ''
  }, [form, prefillPhone])

  // Warn before unload if form is dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleBack = () => {
    if (isDirty()) {
      setPendingNavigation('back')
      setShowDiscardDialog(true)
    } else {
      router.back()
    }
  }

  const handleDiscard = () => {
    setShowDiscardDialog(false)
    if (pendingNavigation === 'back') {
      router.back()
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName.trim()) errs.customerName = 'Customer name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const newId = crypto.randomUUID()
    const newLead: Lead = {
      id: newId,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      channel: form.channel,
      status: 'Open',
      source: form.source.trim(),
      remarks: form.remarks.trim(),
      address: '',
      dateCreated: new Date().toISOString().split('T')[0],
      activities: [],
    }
    addLead(newLead)
    router.push(`/checkin?leadId=${newId}`)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--on-surface)]'
  const errorInputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--error)] bg-transparent text-sm focus:outline-none focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20 text-[var(--on-surface)]'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-6">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-[var(--on-surface)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Add Lead</h1>
      </div>

      {/* Form */}
      <div className="px-4 mt-4 space-y-4">
        {/* Customer Name */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">
            Customer Name <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter customer name"
            value={form.customerName}
            onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setErrors({ ...errors, customerName: '' }) }}
            className={errors.customerName ? errorInputClass : inputClass}
          />
          {errors.customerName && <p className="text-xs text-[var(--error)] mt-1">{errors.customerName}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">
            Phone Number <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }}
            className={errors.phone ? errorInputClass : inputClass}
          />
          {errors.phone && <p className="text-xs text-[var(--error)] mt-1">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Email Address</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Channel */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Lead Channel</label>
          <select
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as Lead['channel'] })}
            className={inputClass}
          >
            {channelOptions.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Lead Source</label>
          <input
            type="text"
            placeholder="Enter lead source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Notes / Remarks</label>
          <textarea
            placeholder="Enter notes or remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className={`${inputClass} min-h-[100px]`}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Add Lead
        </button>
      </div>

      {/* Discard Dialog */}
      <AlertDialog
        open={showDiscardDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Discard?"
        confirmLabel="Discard"
        cancelLabel="Cancel"
        onConfirm={handleDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </div>
  )
}
