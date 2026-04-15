'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Camera, MapPin, BookUser, Phone, ChevronRight } from 'lucide-react'

const permissions = [
  { name: 'Camera', icon: Camera, description: 'To take pictures and record videos', key: 'camera' },
  { name: 'Location', icon: MapPin, description: 'Required for attendance, visits, and shift tracking', key: 'location', mandatory: true },
  { name: 'Contacts', icon: BookUser, description: 'Access your contacts for quick calling', key: 'contacts' },
  { name: 'Phone', icon: Phone, description: 'Make and manage calls', key: 'phone' },
]

export default function SplashScreen() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [currentPermission, setCurrentPermission] = useState(-1)
  const [permissionResults, setPermissionResults] = useState<Record<string, string>>({})
  const [showLocationDenied, setShowLocationDenied] = useState(false)
  const [processingDone, setProcessingDone] = useState(false)

  useEffect(() => {
    const visited = typeof window !== 'undefined' && localStorage.getItem('splash-completed')
    if (visited) {
      router.replace('/login')
    }
  }, [router])

  const handleGotIt = () => {
    setShowOnboarding(false)
    setCurrentPermission(0)
  }

  const handlePermissionResponse = (key: string, response: string) => {
    const newResults = { ...permissionResults, [key]: response }
    setPermissionResults(newResults)

    if (key === 'location' && response === 'denied') {
      setShowLocationDenied(true)
      return
    }

    const nextIdx = currentPermission + 1
    if (nextIdx < permissions.length) {
      setCurrentPermission(nextIdx)
    } else {
      completePermissions()
    }
  }

  const completePermissions = () => {
    setProcessingDone(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('splash-completed', 'true')
    }
    setTimeout(() => router.replace('/login'), 500)
  }

  if (showLocationDenied) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-sm w-full shadow-xl">
          <h3 className="text-lg font-semibold text-[var(--error)] mb-2">Location Required</h3>
          <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Location permission is mandatory for attendance tracking, customer visits, and shift management. The app cannot function without it.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { if (typeof window !== 'undefined') window.close() }}
              className="px-4 py-2 text-sm font-medium text-[var(--error)] rounded-full"
            >
              Exit App
            </button>
            <button
              onClick={() => {
                setShowLocationDenied(false)
                const newResults = { ...permissionResults, location: 'granted' }
                setPermissionResults(newResults)
                const nextIdx = currentPermission + 1
                if (nextIdx < permissions.length) {
                  setCurrentPermission(nextIdx)
                } else {
                  completePermissions()
                }
              }}
              className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-[var(--on-primary)] rounded-full"
            >
              Grant Permission
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[var(--primary-container)] to-[var(--background)]">
        <div className="bg-[var(--surface)] rounded-3xl p-8 max-w-sm w-full shadow-xl text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--primary-container)] flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)] mb-2">App Permissions Required</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Sales CRM needs a few permissions to work properly. We&apos;ll ask for camera, location, contacts, and phone access to enable all features.
          </p>
          <div className="space-y-3 mb-8 text-left">
            {permissions.map((p) => (
              <div key={p.key} className="flex items-center gap-3 text-sm">
                <p.icon size={18} className="text-[var(--primary)] shrink-0" />
                <div>
                  <span className="font-medium">{p.name}</span>
                  {p.mandatory && <span className="text-[var(--error)] text-xs ml-1">(Required)</span>}
                  <p className="text-xs text-[var(--on-surface-variant)]">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleGotIt}
            className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Got It <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (currentPermission >= 0 && currentPermission < permissions.length) {
    const perm = permissions[currentPermission]
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[var(--primary-container)] to-[var(--background)]">
        <div className="bg-[var(--surface)] rounded-3xl p-8 max-w-sm w-full shadow-xl text-center">
          <div className="text-xs text-[var(--on-surface-variant)] mb-4">
            Permission {currentPermission + 1} of {permissions.length}
          </div>
          <div className="w-16 h-16 rounded-full bg-[var(--primary-container)] flex items-center justify-center mx-auto mb-4">
            <perm.icon size={32} className="text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Allow {perm.name}?</h2>
          <p className="text-sm text-[var(--on-surface-variant)] mb-2">{perm.description}</p>
          {perm.mandatory && (
            <p className="text-xs text-[var(--error)] mb-4 font-medium">⚠ This permission is mandatory</p>
          )}
          <div className="space-y-2 mt-6">
            <button
              onClick={() => handlePermissionResponse(perm.key, 'granted')}
              className="w-full py-2.5 bg-[var(--primary)] text-[var(--on-primary)] rounded-full text-sm font-medium"
            >
              Allow While Using the App
            </button>
            <button
              onClick={() => handlePermissionResponse(perm.key, 'once')}
              className="w-full py-2.5 border border-[var(--outline)] text-[var(--primary)] rounded-full text-sm font-medium"
            >
              Allow Only This Time
            </button>
            <button
              onClick={() => handlePermissionResponse(perm.key, 'denied')}
              className="w-full py-2.5 text-[var(--on-surface-variant)] text-sm"
            >
              Don&apos;t Allow
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
