'use client'

import { useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CalendarCheck, Settings } from 'lucide-react'

const tabs = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Leads', icon: Users, href: '/leads' },
  { label: 'Follow-ups', icon: CalendarCheck, href: '/follow-ups' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--outline)]/20 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label
          return (
            <button
              key={tab.label}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px] ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--primary)]'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-[var(--primary-container)]' : ''}`}>
                <tab.icon size={20} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
