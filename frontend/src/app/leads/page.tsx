'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Inbox, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import BottomNav from '@/components/bottom-nav'

const channels = ['All', 'Own', 'BTL', 'Social Media', 'Website', 'Call Center', 'SMS'] as const
const statuses = ['All', 'Open', 'In Process', 'Qualified', 'Follow-up', 'Not Interested', 'Closed'] as const

const statusColors: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Process': 'bg-orange-100 text-orange-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Follow-up': 'bg-yellow-100 text-yellow-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'Closed': 'bg-gray-100 text-gray-800',
}

export default function LeadsPage() {
  const router = useRouter()
  const { leads } = useAppStore()
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((l) => {
      if (q && !l.customerName.toLowerCase().includes(q) && !l.phone.toLowerCase().includes(q)) return false
      if (channelFilter !== 'All' && l.channel !== channelFilter) return false
      if (statusFilter !== 'All' && l.status !== statusFilter) return false
      return true
    })
  }, [leads, search, channelFilter, statusFilter])

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-[var(--on-surface)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Lead Management</h1>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]"
          />
        </div>
      </div>

      {/* Channel Filter */}
      <div className="mt-3 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                channelFilter === ch
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mt-1 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Cards */}
      <div className="px-4 mt-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--on-surface-variant)]">
            <Inbox size={48} className="mb-3 opacity-50" />
            <p className="text-sm">No leads found</p>
          </div>
        ) : (
          filtered.map((lead) => (
            <button
              key={lead.id}
              onClick={() => router.push(`/lead-detail?id=${lead.id}`)}
              className="w-full text-left bg-[var(--surface)] rounded-2xl p-4 shadow-sm border border-[var(--outline)]/10 transition-colors hover:bg-[var(--surface-variant)]/30"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--on-surface)]">{lead.customerName}</h3>
                <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">{lead.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--surface-variant)] text-[10px] font-medium text-[var(--on-surface-variant)]">
                  {lead.channel}
                </span>
                <span className="text-[10px] text-[var(--on-surface-variant)]">{lead.dateCreated}</span>
              </div>
              {lead.address && (
                <p className="text-xs text-[var(--on-surface-variant)] mt-1 truncate">{lead.address}</p>
              )}
            </button>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/add-lead')}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Add lead"
      >
        <Plus size={24} />
      </button>

      <BottomNav activeTab="Leads" />
    </div>
  )
}
