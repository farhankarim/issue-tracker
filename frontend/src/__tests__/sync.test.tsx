/**
 * Tests for the Sync page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SyncPage from '@/app/sync/page'
import { useAppStore } from '@/lib/store'

const backMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  backMock.mockClear()
  useAppStore.setState({ syncStatus: {} })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('SyncPage', () => {
  it('renders all 5 sync modules', () => {
    render(<SyncPage />)
    expect(screen.getByText('Visits')).toBeInTheDocument()
    expect(screen.getByText('Calls')).toBeInTheDocument()
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Follow-ups')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows "0/5 modules synced" initially', () => {
    render(<SyncPage />)
    expect(screen.getByText('0/5 modules synced')).toBeInTheDocument()
  })

  it('shows "Not synced" status for all modules initially', () => {
    render(<SyncPage />)
    const notSyncedItems = screen.getAllByText('Not synced')
    expect(notSyncedItems).toHaveLength(5)
  })

  it('sets module to "syncing" immediately when Sync button clicked', () => {
    render(<SyncPage />)
    // Click the first module's sync button (Visits)
    const syncButtons = screen.getAllByRole('button')
    // Find individual module sync buttons (not "Sync All")
    fireEvent.click(syncButtons[1]) // first module button (index 0 is back)
    expect(screen.getByText('Syncing...')).toBeInTheDocument()
  })

  it('resolves sync status after 2 seconds', () => {
    // Mock Math.random to always succeed
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    render(<SyncPage />)
    const syncButtons = screen.getAllByRole('button')
    fireEvent.click(syncButtons[1])
    act(() => { jest.advanceTimersByTime(2000) })
    // Should be either 'Sync successful' or 'Issue occurred.'
    const successOrError = screen.queryByText('Sync successful') || screen.queryByText('Issue occurred. Please try again.')
    expect(successOrError).not.toBeNull()
    jest.spyOn(Math, 'random').mockRestore()
  })

  it('Sync All button triggers sync for all modules', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5) // 0.5 < 0.8 → always success
    render(<SyncPage />)
    fireEvent.click(screen.getByText('Sync All'))
    await act(async () => {
      await jest.runAllTimersAsync()
    })
    expect(screen.getByText(/All modules synced successfully/)).toBeInTheDocument()
    jest.spyOn(Math, 'random').mockRestore()
  })

  it('shows error snackbar when some modules fail during Sync All', async () => {
    let callCount = 0
    jest.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      return callCount % 2 === 0 ? 0.1 : 0.9 // alternate success/fail
    })
    render(<SyncPage />)
    fireEvent.click(screen.getByText('Sync All'))
    await act(async () => {
      await jest.runAllTimersAsync()
    })
    expect(screen.getByText(/Some modules failed/)).toBeInTheDocument()
    jest.spyOn(Math, 'random').mockRestore()
  })

  it('goes back when back button is clicked', () => {
    render(<SyncPage />)
    const backBtn = screen.getAllByRole('button')[0]
    fireEvent.click(backBtn)
    expect(backMock).toHaveBeenCalled()
  })
})
