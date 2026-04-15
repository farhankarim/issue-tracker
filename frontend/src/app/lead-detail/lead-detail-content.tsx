'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit3,
  Phone,
  ClipboardCheck,
  MessageSquare,
  X,
  Home,
  Calculator,
  DollarSign,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import Snackbar from '@/components/snackbar'

const tabs = ['Details', 'Activities', 'Calculators', 'Location'] as const

const statusColors: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Process': 'bg-orange-100 text-orange-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Follow-up': 'bg-yellow-100 text-yellow-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'Closed': 'bg-gray-100 text-gray-800',
}

const activityIcons: Record<string, typeof Phone> = {
  Call: Phone,
  Visit: MapPin,
  SMS: MessageSquare,
}

export default function LeadDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const { leads, updateLead } = useAppStore()

  const lead = leads.find((l) => l.id === id)

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Details')
  const [editMode, setEditMode] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as const })
  const smsRef = useRef<HTMLDivElement>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    customerName: lead?.customerName ?? '',
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
    channel: lead?.channel ?? 'Own',
    status: lead?.status ?? 'Open',
    source: lead?.source ?? '',
    remarks: lead?.remarks ?? '',
  })

  if (!lead) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-sm text-[var(--on-surface-variant)]">Lead not found</p>
      </div>
    )
  }

  const handleSave = () => {
    updateLead(lead.id, editForm)
    setEditMode(false)
    setSnackbar({ visible: true, message: 'Lead updated successfully', type: 'success' })
  }

  const toggleEdit = () => {
    if (editMode) {
      // Cancel edit – reset form
      setEditForm({
        customerName: lead.customerName,
        phone: lead.phone,
        email: lead.email,
        channel: lead.channel,
        status: lead.status,
        source: lead.source,
        remarks: lead.remarks,
      })
    }
    setEditMode(!editMode)
  }

  const smsTemplates = [
    `Hello ${lead.customerName}, thank you for your interest in our properties. We would love to assist you further.`,
    `Your follow-up is scheduled for ${lead.followUpDate ?? 'a later date'}. We look forward to connecting with you.`,
    'Please contact us at your earliest convenience.',
  ]

  const calculators = [
    { label: 'Home Loan Calculator', icon: Home },
    { label: 'EMI Calculator', icon: Calculator },
    { label: 'Down Payment Calculator', icon: DollarSign },
    { label: 'Affordability Calculator', icon: TrendingUp },
  ]

  const handleUpdateLocation = () => {
    const baseLat = lead.lat ?? 24.86
    const baseLng = lead.lng ?? 67.0
    const newLat = baseLat + (Math.random() - 0.5) * 0.01
    const newLng = baseLng + (Math.random() - 0.5) * 0.01
    updateLead(lead.id, { lat: parseFloat(newLat.toFixed(6)), lng: parseFloat(newLng.toFixed(6)) })
    setSnackbar({ visible: true, message: 'Location updated', type: 'success' })
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--on-surface)]'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-6">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="text-[var(--on-surface)]" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--on-surface)] truncate max-w-[200px]">
            {lead.customerName}
          </h1>
        </div>
        <button
          onClick={toggleEdit}
          className={`p-2 rounded-full transition-colors ${
            editMode ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'hover:bg-[var(--surface-variant)]'
          }`}
          aria-label="Toggle edit"
        >
          <Edit3 size={20} className={editMode ? '' : 'text-[var(--on-surface-variant)]'} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-4 flex gap-3">
        <a
          href={`tel:${lead.phone}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm font-medium transition-colors hover:opacity-90"
        >
          <Phone size={16} />
          Call
        </a>
        <button
          onClick={() => router.push(`/checkin?leadId=${lead.id}`)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm font-medium transition-colors hover:opacity-90"
        >
          <ClipboardCheck size={16} />
          Check-In
        </button>
        <button
          onClick={() => setSmsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm font-medium transition-colors hover:opacity-90"
        >
          <MessageSquare size={16} />
          SMS
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex border-b border-[var(--outline)]/20">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {/* Details Tab */}
        {activeTab === 'Details' && (
          <div className="space-y-4">
            {editMode ? (
              <>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Name</label>
                  <input className={inputClass} value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Phone</label>
                  <input className={inputClass} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Email</label>
                  <input className={inputClass} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Channel</label>
                  <select
                    className={inputClass}
                    value={editForm.channel}
                    onChange={(e) => setEditForm({ ...editForm, channel: e.target.value as typeof editForm.channel })}
                  >
                    {['Own', 'BTL', 'Social Media', 'Website', 'Call Center', 'SMS'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Status</label>
                  <select
                    className={inputClass}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })}
                  >
                    {['Open', 'In Process', 'Qualified', 'Follow-up', 'Not Interested', 'Closed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Source</label>
                  <input className={inputClass} value={editForm.source} onChange={(e) => setEditForm({ ...editForm, source: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--on-surface-variant)] mb-1 block">Remarks</label>
                  <textarea className={`${inputClass} min-h-[80px]`} value={editForm.remarks} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })} />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </>
            ) : (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--outline)]/10 divide-y divide-[var(--outline)]/10">
                {[
                  { label: 'Name', value: lead.customerName },
                  { label: 'Phone', value: lead.phone },
                  { label: 'Email', value: lead.email },
                  { label: 'Channel', value: lead.channel },
                  { label: 'Status', value: lead.status, badge: true },
                  { label: 'Source', value: lead.source },
                  { label: 'Date Created', value: lead.dateCreated },
                  { label: 'Remarks', value: lead.remarks },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between px-4 py-3">
                    <span className="text-xs text-[var(--on-surface-variant)]">{item.label}</span>
                    {item.badge ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[item.value]}`}>
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--on-surface)] text-right max-w-[60%]">{item.value || '—'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'Activities' && (
          <div className="space-y-3">
            {lead.activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--on-surface-variant)]">
                <ClipboardCheck size={40} className="mb-3 opacity-50" />
                <p className="text-sm">No activities recorded yet</p>
              </div>
            ) : (
              lead.activities.map((act) => {
                const Icon = activityIcons[act.type] ?? Phone
                return (
                  <div
                    key={act.id}
                    className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--outline)]/10 shadow-sm flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[var(--on-primary-container)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--on-surface)]">{act.type}</span>
                        <span className="text-[10px] text-[var(--on-surface-variant)]">{act.date}</span>
                      </div>
                      <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Outcome: {act.outcome}</p>
                      {act.remarks && (
                        <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{act.remarks}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Calculators Tab */}
        {activeTab === 'Calculators' && (
          <div className="grid grid-cols-2 gap-3">
            {calculators.map((calc) => (
              <a
                key={calc.label}
                href="https://example.com/calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--outline)]/10 shadow-sm flex flex-col items-center gap-3 hover:bg-[var(--surface-variant)]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
                  <calc.icon size={22} className="text-[var(--on-primary-container)]" />
                </div>
                <span className="text-xs font-medium text-[var(--on-surface)] text-center">{calc.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'Location' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--outline)]/10 overflow-hidden">
              {/* Placeholder map area */}
              <div className="h-48 bg-[var(--surface-variant)] flex flex-col items-center justify-center gap-2">
                <MapPin size={32} className="text-[var(--on-surface-variant)] opacity-50" />
                {lead.lat && lead.lng ? (
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    {lead.lat.toFixed(6)}, {lead.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--on-surface-variant)]">No location data</p>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-[var(--on-surface)]">{lead.address || 'No address available'}</p>
                {lead.lat && lead.lng && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                    Lat: {lead.lat.toFixed(6)} | Lng: {lead.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleUpdateLocation}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Update Location
            </button>
          </div>
        )}
      </div>

      {/* SMS Bottom Sheet */}
      {smsOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSmsOpen(false)} />
          <div ref={smsRef} className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-[var(--surface)] rounded-t-3xl p-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--on-surface)]">Select SMS Template</h3>
              <button onClick={() => setSmsOpen(false)} className="p-2 rounded-full hover:bg-[var(--surface-variant)]">
                <X size={18} className="text-[var(--on-surface-variant)]" />
              </button>
            </div>
            <div className="space-y-2">
              {smsTemplates.map((tpl, i) => (
                <a
                  key={i}
                  href={`sms:${lead.phone}?body=${encodeURIComponent(tpl)}`}
                  onClick={() => setSmsOpen(false)}
                  className="block w-full text-left p-3 rounded-xl border border-[var(--outline)]/20 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-variant)]/30 transition-colors"
                >
                  {tpl}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </div>
  )
}
