/**
 * Tests for the Check-In page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import CheckinContent from '@/app/checkin/checkin-content'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
let mockLeadId = 'lead-1'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
  useSearchParams: () => ({ get: (key: string) => (key === 'leadId' ? mockLeadId : null) }),
}))

const sampleLead = {
  id: 'lead-1',
  customerName: 'Ahmad Khan',
  phone: '+92-300-1234567',
  email: '',
  channel: 'Own' as const,
  status: 'Open' as const,
  source: '',
  remarks: '',
  address: '',
  dateCreated: '2026-04-10',
  activities: [],
}

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  backMock.mockClear()
  mockLeadId = 'lead-1'
  useAppStore.setState({ leads: [sampleLead] })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('CheckinContent', () => {
  it('renders Check-In heading', () => {
    render(<CheckinContent />)
    expect(screen.getByText('Check-In')).toBeInTheDocument()
  })

  it('renders read-only Date & Time and Location fields', () => {
    render(<CheckinContent />)
    expect(screen.getByLabelText ? screen.getByText('Date & Time') : screen.getByText('Date & Time')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('renders Visit Type and Meeting Outcome selects', () => {
    render(<CheckinContent />)
    expect(screen.getByText('Visit Type')).toBeInTheDocument()
    expect(screen.getByText('Meeting Outcome')).toBeInTheDocument()
  })

  it('shows Follow-up Date field when outcome is Follow-up Required', () => {
    render(<CheckinContent />)
    const outcomeSelect = screen.getByDisplayValue('Interested')
    fireEvent.change(outcomeSelect, { target: { value: 'Follow-up Required' } })
    expect(screen.getByText('Follow-up Date')).toBeInTheDocument()
  })

  it('hides Follow-up Date field when outcome is not Follow-up Required', () => {
    render(<CheckinContent />)
    expect(screen.queryByText('Follow-up Date')).not.toBeInTheDocument()
  })

  it('submits check-in, updates lead to "In Process" for Interested outcome', () => {
    render(<CheckinContent />)
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800) })
    const lead = useAppStore.getState().leads.find((l) => l.id === 'lead-1')
    expect(lead?.status).toBe('In Process')
    expect(lead?.activities).toHaveLength(1)
  })

  it('updates lead status to "Not Interested" when outcome matches', () => {
    render(<CheckinContent />)
    fireEvent.change(screen.getByDisplayValue('Interested'), { target: { value: 'Not Interested' } })
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800) })
    expect(useAppStore.getState().leads.find((l) => l.id === 'lead-1')?.status).toBe('Not Interested')
  })

  it('updates lead status to "Closed" when outcome is Closed', () => {
    render(<CheckinContent />)
    fireEvent.change(screen.getByDisplayValue('Interested'), { target: { value: 'Closed' } })
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800) })
    expect(useAppStore.getState().leads.find((l) => l.id === 'lead-1')?.status).toBe('Closed')
  })

  it('sets follow-up status and date for Follow-up Required outcome', () => {
    render(<CheckinContent />)
    fireEvent.change(screen.getByDisplayValue('Interested'), { target: { value: 'Follow-up Required' } })
    // The follow-up date input is the only date input
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-05-01' } })
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800) })
    const lead = useAppStore.getState().leads.find((l) => l.id === 'lead-1')
    expect(lead?.status).toBe('Follow-up')
    expect(lead?.followUpDate).toBe('2026-05-01')
  })

  it('shows success snackbar after submission', () => {
    render(<CheckinContent />)
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800) })
    expect(screen.getByText('Data uploaded successfully')).toBeInTheDocument()
  })

  it('navigates to /dashboard after submission', () => {
    render(<CheckinContent />)
    fireEvent.click(screen.getByText('Submit Check-In'))
    act(() => { jest.advanceTimersByTime(800 + 1200) })
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('disables Submit button while loading', () => {
    render(<CheckinContent />)
    fireEvent.click(screen.getByText('Submit Check-In'))
    // immediately after click, loading is true
    expect(screen.getByRole('button', { name: /Submit Check-In/i })).toBeDisabled()
    act(() => { jest.advanceTimersByTime(1000) })
  })
})
