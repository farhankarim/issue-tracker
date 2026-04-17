/**
 * Tests for the Settings page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  useAppStore.setState({
    user: { name: 'Sales User', email: 'user01@example.com', role: 'sales_rep', loginId: 'user01' },
    fingerprintEnabled: false,
    allowScreenshots: false,
    darkMode: false,
    shiftActive: false,
  })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('SettingsPage', () => {
  it('renders user name and email', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Sales User')).toBeInTheDocument()
    expect(screen.getByText('user01@example.com')).toBeInTheDocument()
  })

  it('navigates to /change-password when Change Password is clicked', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Change Password'))
    expect(pushMock).toHaveBeenCalledWith('/change-password')
  })

  it('navigates to /sync when Sync Data is clicked', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Sync Data'))
    expect(pushMock).toHaveBeenCalledWith('/sync')
  })

  it('enables fingerprint after toggle', async () => {
    render(<SettingsPage />)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])
    await act(async () => { jest.advanceTimersByTime(1000) })
    expect(useAppStore.getState().fingerprintEnabled).toBe(true)
  })

  it('shows "Fingerprint registered" snackbar when fingerprint is enabled', async () => {
    render(<SettingsPage />)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0]) // fingerprint toggle
    await act(async () => { jest.advanceTimersByTime(1000) })
    expect(screen.getByText(/Fingerprint registered/)).toBeInTheDocument()
  })

  it('shows "Fingerprint disabled" snackbar when fingerprint is disabled', () => {
    useAppStore.setState({ fingerprintEnabled: true })
    render(<SettingsPage />)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])
    expect(screen.getByText(/Fingerprint disabled/)).toBeInTheDocument()
  })

  it('toggles Allow Screenshots', () => {
    render(<SettingsPage />)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[1]) // screenshots toggle
    expect(useAppStore.getState().allowScreenshots).toBe(true)
  })

  it('toggles Dark Mode', () => {
    render(<SettingsPage />)
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[2]) // dark mode toggle
    expect(useAppStore.getState().darkMode).toBe(true)
  })

  it('adds "dark" class to <html> when dark mode is on', () => {
    useAppStore.setState({ darkMode: true })
    render(<SettingsPage />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('shows "Shift Active" badge when shift is active', () => {
    useAppStore.setState({ shiftActive: true })
    render(<SettingsPage />)
    expect(screen.getByText('Shift Active')).toBeInTheDocument()
  })

  it('shows "No Active Shift" badge when shift is inactive', () => {
    render(<SettingsPage />)
    expect(screen.getByText('No Active Shift')).toBeInTheDocument()
  })

  it('shows app version in the About section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Sales CRM v1.0.0')).toBeInTheDocument()
  })
})
