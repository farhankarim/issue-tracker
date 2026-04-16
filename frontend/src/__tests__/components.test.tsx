/**
 * Tests for shared UI components: Snackbar, AlertDialog, BottomNav.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Snackbar from '@/components/snackbar'
import AlertDialog from '@/components/alert-dialog'
import BottomNav from '@/components/bottom-nav'

// ──────────────────────────────────────────────
// Mock next/navigation for BottomNav
// ──────────────────────────────────────────────
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

// ──────────────────────────────────────────────
// Snackbar
// ──────────────────────────────────────────────
describe('Snackbar', () => {
  it('renders message when visible', () => {
    render(<Snackbar message="Hello world" visible onClose={jest.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders nothing when not visible', () => {
    render(<Snackbar message="Hidden" visible={false} onClose={jest.fn()} />)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn()
    render(<Snackbar message="Close me" visible onClose={onClose} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('auto-dismisses after 4 seconds', () => {
    const onClose = jest.fn()
    render(<Snackbar message="Auto" visible onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    act(() => { jest.advanceTimersByTime(4000) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies error styling for type error', () => {
    render(<Snackbar message="Error" type="error" visible onClose={jest.fn()} />)
    const el = screen.getByText('Error').closest('div')
    expect(el?.className).toMatch(/error/)
  })

  it('applies success styling for type success', () => {
    render(<Snackbar message="OK" type="success" visible onClose={jest.fn()} />)
    const el = screen.getByText('OK').closest('div')
    expect(el?.className).toMatch(/success/)
  })
})

// ──────────────────────────────────────────────
// AlertDialog
// ──────────────────────────────────────────────
describe('AlertDialog', () => {
  it('renders title and message when open', () => {
    render(
      <AlertDialog
        open
        title="Delete item?"
        message="This cannot be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <AlertDialog
        open={false}
        title="Not shown"
        message="Invisible"
        onConfirm={jest.fn()}
      />,
    )
    expect(screen.queryByText('Not shown')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(<AlertDialog open title="T" message="M" confirmLabel="Yes" onConfirm={onConfirm} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByText('Yes'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    render(<AlertDialog open title="T" message="M" cancelLabel="No" onConfirm={jest.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('No'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('hides cancel button when showCancel is false', () => {
    render(<AlertDialog open title="T" message="M" showCancel={false} confirmLabel="OK" onConfirm={jest.fn()} />)
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('shows default confirm label "OK" when none provided', () => {
    render(<AlertDialog open title="T" message="M" onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// BottomNav
// ──────────────────────────────────────────────
describe('BottomNav', () => {
  it('renders all four tabs', () => {
    render(<BottomNav activeTab="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Follow-ups')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('navigates to /dashboard when Dashboard tab is clicked', () => {
    render(<BottomNav activeTab="Leads" />)
    fireEvent.click(screen.getByText('Dashboard'))
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('navigates to /leads when Leads tab is clicked', () => {
    render(<BottomNav activeTab="Dashboard" />)
    fireEvent.click(screen.getByText('Leads'))
    expect(pushMock).toHaveBeenCalledWith('/leads')
  })

  it('navigates to /follow-ups when Follow-ups tab is clicked', () => {
    render(<BottomNav activeTab="Dashboard" />)
    fireEvent.click(screen.getByText('Follow-ups'))
    expect(pushMock).toHaveBeenCalledWith('/follow-ups')
  })

  it('navigates to /settings when Settings tab is clicked', () => {
    render(<BottomNav activeTab="Dashboard" />)
    fireEvent.click(screen.getByText('Settings'))
    expect(pushMock).toHaveBeenCalledWith('/settings')
  })

  it('marks the active tab with primary colour class', () => {
    render(<BottomNav activeTab="Leads" />)
    const leadsBtn = screen.getByText('Leads').closest('button')
    expect(leadsBtn?.className).toMatch(/primary/)
  })
})
