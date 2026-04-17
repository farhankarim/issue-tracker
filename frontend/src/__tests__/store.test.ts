/**
 * Tests for the Zustand store — auth, shift, leads, and settings actions.
 */
import { act } from 'react'
import { useAppStore } from '@/lib/store'

// Reset store state between tests
beforeEach(() => {
  useAppStore.setState({
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
    syncStatus: {},
    updateDismissed: false,
  })
})

const mockUser = { name: 'Test User', email: 'test@example.com', role: 'sales_rep', loginId: 'test01' }

describe('auth actions', () => {
  it('login sets isLoggedIn, user and resets failedLoginAttempts', () => {
    useAppStore.setState({ failedLoginAttempts: 3 })
    act(() => useAppStore.getState().login(mockUser))
    const state = useAppStore.getState()
    expect(state.isLoggedIn).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.failedLoginAttempts).toBe(0)
  })

  it('logout clears user, isLoggedIn, and shift state', () => {
    useAppStore.setState({ isLoggedIn: true, user: mockUser, shiftActive: true, shiftStartTime: 'now' })
    act(() => useAppStore.getState().logout())
    const state = useAppStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.user).toBeNull()
    expect(state.shiftActive).toBe(false)
    expect(state.shiftStartTime).toBeNull()
  })

  it('setDeviceRegistered updates deviceRegistered', () => {
    expect(useAppStore.getState().deviceRegistered).toBe(false)
    act(() => useAppStore.getState().setDeviceRegistered(true))
    expect(useAppStore.getState().deviceRegistered).toBe(true)
  })

  it('incrementFailedLogin increases failedLoginAttempts by 1', () => {
    act(() => useAppStore.getState().incrementFailedLogin())
    act(() => useAppStore.getState().incrementFailedLogin())
    expect(useAppStore.getState().failedLoginAttempts).toBe(2)
  })

  it('resetFailedLogin resets failedLoginAttempts to 0', () => {
    useAppStore.setState({ failedLoginAttempts: 5 })
    act(() => useAppStore.getState().resetFailedLogin())
    expect(useAppStore.getState().failedLoginAttempts).toBe(0)
  })

  it('blockAccount sets accountBlockedUntil', () => {
    const until = Date.now() + 60_000
    act(() => useAppStore.getState().blockAccount(until))
    expect(useAppStore.getState().accountBlockedUntil).toBe(until)
  })

  it('permanentlyBlockAccount sets accountPermanentlyBlocked to true', () => {
    act(() => useAppStore.getState().permanentlyBlockAccount())
    expect(useAppStore.getState().accountPermanentlyBlocked).toBe(true)
  })
})

describe('shift actions', () => {
  it('startShift activates shift and records start time', () => {
    act(() => useAppStore.getState().startShift())
    const state = useAppStore.getState()
    expect(state.shiftActive).toBe(true)
    expect(state.shiftStartTime).not.toBeNull()
  })

  it('endShift deactivates shift and clears start time', () => {
    useAppStore.setState({ shiftActive: true, shiftStartTime: new Date().toISOString() })
    act(() => useAppStore.getState().endShift())
    const state = useAppStore.getState()
    expect(state.shiftActive).toBe(false)
    expect(state.shiftStartTime).toBeNull()
  })
})

describe('lead actions', () => {
  it('addLead prepends a lead to the leads list', () => {
    const before = useAppStore.getState().leads.length
    const newLead = {
      id: 'test-1',
      customerName: 'New Customer',
      phone: '123',
      email: '',
      channel: 'Own' as const,
      status: 'Open' as const,
      source: '',
      remarks: '',
      address: '',
      dateCreated: '2026-04-15',
      activities: [],
    }
    act(() => useAppStore.getState().addLead(newLead))
    const after = useAppStore.getState().leads
    expect(after.length).toBe(before + 1)
    expect(after[0]).toEqual(newLead)
  })

  it('updateLead merges fields into the matching lead', () => {
    const leads = useAppStore.getState().leads
    const target = leads[0]
    act(() => useAppStore.getState().updateLead(target.id, { status: 'Closed' }))
    const updated = useAppStore.getState().leads.find((l) => l.id === target.id)
    expect(updated?.status).toBe('Closed')
    expect(updated?.customerName).toBe(target.customerName)
  })
})

describe('settings actions', () => {
  it('toggleDarkMode flips darkMode', () => {
    expect(useAppStore.getState().darkMode).toBe(false)
    act(() => useAppStore.getState().toggleDarkMode())
    expect(useAppStore.getState().darkMode).toBe(true)
    act(() => useAppStore.getState().toggleDarkMode())
    expect(useAppStore.getState().darkMode).toBe(false)
  })

  it('setFingerprintEnabled updates fingerprintEnabled', () => {
    act(() => useAppStore.getState().setFingerprintEnabled(true))
    expect(useAppStore.getState().fingerprintEnabled).toBe(true)
  })

  it('setAllowScreenshots updates allowScreenshots', () => {
    act(() => useAppStore.getState().setAllowScreenshots(true))
    expect(useAppStore.getState().allowScreenshots).toBe(true)
  })

  it('dismissUpdate sets updateDismissed to true', () => {
    act(() => useAppStore.getState().dismissUpdate())
    expect(useAppStore.getState().updateDismissed).toBe(true)
  })

  it('setSyncStatus records the status per module key', () => {
    act(() => useAppStore.getState().setSyncStatus('leads', 'syncing'))
    expect(useAppStore.getState().syncStatus['leads']).toBe('syncing')
    act(() => useAppStore.getState().setSyncStatus('leads', 'success'))
    expect(useAppStore.getState().syncStatus['leads']).toBe('success')
  })
})
