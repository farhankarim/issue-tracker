'use client'

import { Suspense } from 'react'
import CheckinContent from './checkin-content'

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckinContent />
    </Suspense>
  )
}
