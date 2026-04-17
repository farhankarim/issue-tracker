/**
 * Tests for the Follow-ups page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import FollowUpsPage from '@/app/follow-ups/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  backMock.mockClear()
  // Set up leads with follow-up entries matching TODAY = '2026-04-15'
  useAppStore.setState({
    leads: [
      {
        id: 'fu1',
        customerName: 'Fatima Noor',
        phone: '+92-345-7778899',
        email: '',
        channel: 'BTL' as const,
        status: 'Follow-up' as const,
        source: '',
        remarks: '',
        address: '',
        dateCreated: '2026-04-07',
        followUpDate: '2026-04-15',
        followUpType: 'Call' as const,
        activities: [],
      },
      {
        id: 'fu2',
        customerName: 'Zainab Shah',
        phone: '+92-322-8889900',
        email: '',
        channel: 'Social Media' as const,
        status: 'Follow-up' as const,
        source: '',
        remarks: '',
        address: '',
        dateCreated: '2026-04-03',
        followUpDate: '2026-04-15',
        followUpType: 'Visit' as const,
        activities: [],
      },
    ],
  })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('FollowUpsPage', () => {
  it('shows both follow-up leads for today', () => {
    render(<FollowUpsPage />)
    expect(screen.getByText('Fatima Noor')).toBeInTheDocument()
    expect(screen.getByText('Zainab Shah')).toBeInTheDocument()
  })

  it('shows summary card with correct count', () => {
    render(<FollowUpsPage />)
    expect(screen.getByText(/2 leads require follow-up today/)).toBeInTheDocument()
  })

  it('filters out Call leads when Call chip is toggled off', () => {
    render(<FollowUpsPage />)
    // The Call chip is the first button in the filter area
    const filterButtons = screen.getAllByRole('button')
    const callChip = filterButtons.find((b) => b.textContent === 'Call')!
    fireEvent.click(callChip)
    expect(screen.queryByText('Fatima Noor')).not.toBeInTheDocument()
    expect(screen.getByText('Zainab Shah')).toBeInTheDocument()
  })

  it('filters out Visit leads when Visit chip is toggled off', () => {
    render(<FollowUpsPage />)
    const filterButtons = screen.getAllByRole('button')
    const visitChip = filterButtons.find((b) => b.textContent === 'Visit')!
    fireEvent.click(visitChip)
    expect(screen.getByText('Fatima Noor')).toBeInTheDocument()
    expect(screen.queryByText('Zainab Shah')).not.toBeInTheDocument()
  })

  it('shows empty state when all leads are filtered out', () => {
    render(<FollowUpsPage />)
    const filterButtons = screen.getAllByRole('button')
    const callChip = filterButtons.find((b) => b.textContent === 'Call')!
    const visitChip = filterButtons.find((b) => b.textContent === 'Visit')!
    fireEvent.click(callChip)
    fireEvent.click(visitChip)
    expect(screen.getByText(/No follow-ups scheduled for today/)).toBeInTheDocument()
  })

  it('shows confirmation dialog when Mark Done is clicked', () => {
    render(<FollowUpsPage />)
    const markDoneButtons = screen.getAllByText('Mark Done')
    fireEvent.click(markDoneButtons[0])
    expect(screen.getByText('Mark as Done')).toBeInTheDocument()
  })

  it('cancels without updating when Cancel is clicked in dialog', () => {
    render(<FollowUpsPage />)
    fireEvent.click(screen.getAllByText('Mark Done')[0])
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('Fatima Noor')).toBeInTheDocument()
    expect(useAppStore.getState().leads.find((l) => l.id === 'fu1')?.status).toBe('Follow-up')
  })

  it('marks lead as Closed in store when confirmed', () => {
    render(<FollowUpsPage />)
    fireEvent.click(screen.getAllByText('Mark Done')[0])
    fireEvent.click(screen.getByText('Confirm'))
    act(() => { jest.advanceTimersByTime(300) })
    expect(useAppStore.getState().leads.find((l) => l.id === 'fu1')?.status).toBe('Closed')
  })

  it('goes back when back button is clicked', () => {
    render(<FollowUpsPage />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(backMock).toHaveBeenCalled()
  })
})
