'use client'

import { Suspense } from 'react'
import LeadDetailContent from './lead-detail-content'

export default function LeadDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LeadDetailContent />
    </Suspense>
  )
}
