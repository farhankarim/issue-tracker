/**
 * Tests for the Dashboard page.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

function setActiveShift() {
  useAppStore.setState({
    shiftActive: true,
    user: { name: 'John Doe', email: 'john@example.com', role: 'sales_rep', loginId: 'user01' },
    updateDismissed: false,
  })
}

beforeEach(() => {
  pushMock.mockClear()
  replaceMock.mockClear()
  setActiveShift()
})

describe('DashboardPage', () => {
  it('renders the welcome message with user name', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome, John Doe/)).toBeInTheDocument()
  })

  it('redirects to /shift-start when shiftActive is false', () => {
    useAppStore.setState({ shiftActive: false })
    render(<DashboardPage />)
    expect(replaceMock).toHaveBeenCalledWith('/shift-start')
  })

  it('shows update banner when updateDismissed is false', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/A new update is available/)).toBeInTheDocument()
  })

  it('hides update banner when updateDismissed is true', () => {
    useAppStore.setState({ updateDismissed: true, shiftActive: true })
    render(<DashboardPage />)
    expect(screen.queryByText(/A new update is available/)).not.toBeInTheDocument()
  })

  it('dismisses update banner when X button is clicked', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByLabelText('Dismiss update'))
    expect(screen.queryByText(/A new update is available/)).not.toBeInTheDocument()
  })

  it('shows follow-up leads count from store', () => {
    // Default dummy leads have some follow-up entries
    const followUpCount = useAppStore.getState().leads.filter((l) => l.status === 'Follow-up').length
    render(<DashboardPage />)
    expect(screen.getByText(String(followUpCount))).toBeInTheDocument()
  })

  it('navigates to /leads when a summary card is clicked', () => {
    render(<DashboardPage />)
    const callsCard = screen.getByText("Today's Calls").closest('button')!
    fireEvent.click(callsCard)
    expect(pushMock).toHaveBeenCalledWith('/leads')
  })

  it('navigates to /follow-ups when Follow-up Leads card is clicked', () => {
    render(<DashboardPage />)
    const followCard = screen.getByText('Follow-up Leads').closest('button')!
    fireEvent.click(followCard)
    expect(pushMock).toHaveBeenCalledWith('/follow-ups')
  })

  it('opens speed-dial FAB when Plus button is clicked', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByLabelText('Quick actions'))
    expect(screen.getByText('Sync')).toBeInTheDocument()
    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('Visit')).toBeInTheDocument()
    expect(screen.getByText('Follow-up')).toBeInTheDocument()
  })

  it('opens End Shift dialog from options menu', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByLabelText('More options'))
    fireEvent.click(screen.getByText('End Shift'))
    expect(screen.getByText('End Shift', { selector: 'h3' })).toBeInTheDocument()
  })

  it('ends shift and navigates to /shift-start when confirmed', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByLabelText('More options'))
    fireEvent.click(screen.getByText('End Shift'))
    // AlertDialog confirm button
    const confirmButtons = screen.getAllByRole('button', { name: /End Shift/i })
    // Last button is the confirm in the dialog
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(useAppStore.getState().shiftActive).toBe(false)
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })
})
