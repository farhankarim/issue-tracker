import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Lead {
  id: string
  customerName: string
  phone: string
  email: string
  channel: 'Own' | 'BTL' | 'Social Media' | 'Website' | 'Call Center' | 'SMS'
  status: 'Open' | 'In Process' | 'Qualified' | 'Follow-up' | 'Not Interested' | 'Closed'
  source: string
  remarks: string
  address: string
  dateCreated: string
  lat?: number
  lng?: number
  followUpDate?: string
  followUpType?: 'Call' | 'Visit'
  activities: Activity[]
}

export interface Activity {
  id: string
  type: 'Call' | 'Visit' | 'SMS'
  date: string
  outcome: string
  remarks: string
}

export type FlowType = 'NewUser' | 'NewDevice' | 'ForgotPassword'

interface AppState {
  // Auth
  isLoggedIn: boolean
  user: { name: string; email: string; role: string; loginId: string } | null
  deviceRegistered: boolean
  fingerprintEnabled: boolean
  allowScreenshots: boolean
  failedLoginAttempts: number
  accountBlockedUntil: number | null
  accountPermanentlyBlocked: boolean
  
  // Shift
  shiftActive: boolean
  shiftStartTime: string | null
  
  // Theme
  darkMode: boolean

  // Leads
  leads: Lead[]
  
  // Sync
  syncStatus: Record<string, 'idle' | 'syncing' | 'success' | 'error'>
  
  // Update banner
  updateDismissed: boolean

  // Actions
  login: (user: AppState['user']) => void
  logout: () => void
  setDeviceRegistered: (val: boolean) => void
  setFingerprintEnabled: (val: boolean) => void
  setAllowScreenshots: (val: boolean) => void
  incrementFailedLogin: () => void
  resetFailedLogin: () => void
  blockAccount: (until: number) => void
  permanentlyBlockAccount: () => void
  startShift: () => void
  endShift: () => void
  toggleDarkMode: () => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  setSyncStatus: (module: string, status: 'idle' | 'syncing' | 'success' | 'error') => void
  dismissUpdate: () => void
}

const dummyLeads: Lead[] = [
  { id: '1', customerName: 'Ahmad Khan', phone: '+92-300-1234567', email: 'ahmad@email.com', channel: 'Own', status: 'Open', source: 'Walk-in', remarks: 'Interested in 3-bed apartment', address: 'Block A, DHA Phase 5', dateCreated: '2026-04-10', lat: 24.8607, lng: 67.0011, activities: [{ id: 'a1', type: 'Call', date: '2026-04-10', outcome: 'Interested', remarks: 'Will visit next week' }] },
  { id: '2', customerName: 'Sara Ahmed', phone: '+92-321-9876543', email: 'sara@email.com', channel: 'Social Media', status: 'In Process', source: 'Facebook Ad', remarks: 'Looking for investment plot', address: 'Gulshan-e-Iqbal', dateCreated: '2026-04-09', activities: [{ id: 'a2', type: 'Visit', date: '2026-04-09', outcome: 'Follow-up Required', remarks: 'Needs pricing details' }] },
  { id: '3', customerName: 'Bilal Hussain', phone: '+92-333-5551234', email: 'bilal@email.com', channel: 'Website', status: 'Qualified', source: 'Website Form', remarks: 'Ready to book', address: 'Clifton Block 8', dateCreated: '2026-04-08', lat: 24.8138, lng: 66.9922, activities: [] },
  { id: '4', customerName: 'Fatima Noor', phone: '+92-345-7778899', email: 'fatima@email.com', channel: 'BTL', status: 'Follow-up', source: 'Exhibition', remarks: 'Budget conscious buyer', address: 'North Nazimabad', dateCreated: '2026-04-07', followUpDate: '2026-04-15', followUpType: 'Call', activities: [{ id: 'a3', type: 'Call', date: '2026-04-07', outcome: 'Not Interested', remarks: 'Price too high' }, { id: 'a4', type: 'SMS', date: '2026-04-08', outcome: 'Sent', remarks: 'Follow-up message sent' }] },
  { id: '5', customerName: 'Usman Ali', phone: '+92-311-2223344', email: 'usman@email.com', channel: 'Call Center', status: 'Not Interested', source: 'Cold Call', remarks: 'Not looking to buy right now', address: 'Bahria Town', dateCreated: '2026-04-06', activities: [{ id: 'a5', type: 'Call', date: '2026-04-06', outcome: 'Not Interested', remarks: 'Not interested currently' }] },
  { id: '6', customerName: 'Ayesha Malik', phone: '+92-302-4445566', email: 'ayesha@email.com', channel: 'SMS', status: 'Open', source: 'SMS Campaign', remarks: 'Responded to campaign', address: 'Johar Town, Lahore', dateCreated: '2026-04-05', activities: [] },
  { id: '7', customerName: 'Hassan Raza', phone: '+92-315-6667788', email: 'hassan@email.com', channel: 'Own', status: 'Closed', source: 'Referral', remarks: 'Deal closed - 2 bed apt', address: 'Model Town, Lahore', dateCreated: '2026-04-04', activities: [{ id: 'a6', type: 'Visit', date: '2026-04-04', outcome: 'Interested', remarks: 'Visited site' }, { id: 'a7', type: 'Call', date: '2026-04-05', outcome: 'Interested', remarks: 'Final negotiation' }] },
  { id: '8', customerName: 'Zainab Shah', phone: '+92-322-8889900', email: 'zainab@email.com', channel: 'Social Media', status: 'Follow-up', source: 'Instagram', remarks: 'Wants virtual tour', address: 'F-8, Islamabad', dateCreated: '2026-04-03', followUpDate: '2026-04-15', followUpType: 'Visit', activities: [{ id: 'a8', type: 'Call', date: '2026-04-03', outcome: 'Follow-up Required', remarks: 'Schedule visit' }] },
  { id: '9', customerName: 'Omar Farooq', phone: '+92-340-1112233', email: 'omar@email.com', channel: 'Website', status: 'In Process', source: 'Google Ads', remarks: 'Comparing options', address: 'E-11, Islamabad', dateCreated: '2026-04-02', activities: [] },
  { id: '10', customerName: 'Mariam Bibi', phone: '+92-331-3334455', email: 'mariam@email.com', channel: 'BTL', status: 'Follow-up', source: 'Seminar', remarks: 'Family decision pending', address: 'G-9, Islamabad', dateCreated: '2026-04-01', followUpDate: '2026-04-15', followUpType: 'Call', activities: [{ id: 'a9', type: 'Visit', date: '2026-04-01', outcome: 'Follow-up Required', remarks: 'Needs family approval' }] },
]

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      deviceRegistered: false,
      fingerprintEnabled: false,
      allowScreenshots: false,
      failedLoginAttempts: 0,
      accountBlockedUntil: null,
      accountPermanentlyBlocked: false,
      shiftActive: false,
      shiftStartTime: null,
      darkMode: false,
      leads: dummyLeads,
      syncStatus: {},
      updateDismissed: false,

      login: (user) => set({ isLoggedIn: true, user, failedLoginAttempts: 0 }),
      logout: () => set({ isLoggedIn: false, user: null, shiftActive: false, shiftStartTime: null }),
      setDeviceRegistered: (val) => set({ deviceRegistered: val }),
      setFingerprintEnabled: (val) => set({ fingerprintEnabled: val }),
      setAllowScreenshots: (val) => set({ allowScreenshots: val }),
      incrementFailedLogin: () => set((state) => ({ failedLoginAttempts: state.failedLoginAttempts + 1 })),
      resetFailedLogin: () => set({ failedLoginAttempts: 0 }),
      blockAccount: (until) => set({ accountBlockedUntil: until }),
      permanentlyBlockAccount: () => set({ accountPermanentlyBlocked: true }),
      startShift: () => set({ shiftActive: true, shiftStartTime: new Date().toISOString() }),
      endShift: () => set({ shiftActive: false, shiftStartTime: null }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      })),
      setSyncStatus: (module, status) => set((state) => ({
        syncStatus: { ...state.syncStatus, [module]: status },
      })),
      dismissUpdate: () => set({ updateDismissed: true }),
    }),
    { name: 'sales-crm-storage' }
  )
)
