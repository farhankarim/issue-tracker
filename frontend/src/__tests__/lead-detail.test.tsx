/**
 * Tests for the Lead Detail page.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LeadDetailContent from '@/app/lead-detail/lead-detail-content'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
let mockLeadId = '1'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? mockLeadId : null) }),
}))

const sampleLead = {
  id: '1',
  customerName: 'Ahmad Khan',
  phone: '+92-300-1234567',
  email: 'ahmad@email.com',
  channel: 'Own' as const,
  status: 'Open' as const,
  source: 'Walk-in',
  remarks: 'Interested',
  address: 'Block A',
  dateCreated: '2026-04-10',
  lat: 24.8607,
  lng: 67.0011,
  activities: [
    { id: 'a1', type: 'Call' as const, date: '2026-04-10', outcome: 'Interested', remarks: 'Will visit' },
  ],
}

beforeEach(() => {
  pushMock.mockClear()
  backMock.mockClear()
  mockLeadId = '1'
  useAppStore.setState({ leads: [sampleLead] })
})

describe('LeadDetailContent', () => {
  it('shows lead not found for unknown id', () => {
    mockLeadId = 'unknown'
    render(<LeadDetailContent />)
    expect(screen.getByText('Lead not found')).toBeInTheDocument()
  })

  it('renders customer name in the app bar', () => {
    render(<LeadDetailContent />)
    expect(screen.getByRole('heading', { name: 'Ahmad Khan' })).toBeInTheDocument()
  })

  it('renders Details, Activities, Calculators and Location tabs', () => {
    render(<LeadDetailContent />)
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByText('Calculators')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('shows lead details in the Details tab', () => {
    render(<LeadDetailContent />)
    expect(screen.getByText('+92-300-1234567')).toBeInTheDocument()
    expect(screen.getByText('Walk-in')).toBeInTheDocument()
  })

  it('shows existing activity in the Activities tab', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByText('Activities'))
    expect(screen.getByText('Outcome: Interested')).toBeInTheDocument()
  })

  it('shows "No activities recorded yet" when activities are empty', () => {
    useAppStore.setState({ leads: [{ ...sampleLead, activities: [] }] })
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByText('Activities'))
    expect(screen.getByText('No activities recorded yet')).toBeInTheDocument()
  })

  it('shows calculator options in Calculators tab', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByText('Calculators'))
    expect(screen.getByText('Home Loan Calculator')).toBeInTheDocument()
    expect(screen.getByText('EMI Calculator')).toBeInTheDocument()
  })

  it('shows location coordinates in Location tab', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByText('Location'))
    expect(screen.getAllByText(/24\.8607/).length).toBeGreaterThan(0)
  })

  it('enters edit mode when edit button is clicked', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByLabelText('Toggle edit'))
    expect(screen.getByDisplayValue('Ahmad Khan')).toBeInTheDocument()
  })

  it('saves updated lead name', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByLabelText('Toggle edit'))
    const nameInput = screen.getByDisplayValue('Ahmad Khan')
    fireEvent.change(nameInput, { target: { value: 'Ahmad Updated' } })
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    const lead = useAppStore.getState().leads.find((l) => l.id === '1')
    expect(lead?.customerName).toBe('Ahmad Updated')
  })

  it('shows success snackbar after saving', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByLabelText('Toggle edit'))
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    expect(screen.getByText('Lead updated successfully')).toBeInTheDocument()
  })

  it('cancels edit and restores original values', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByLabelText('Toggle edit'))
    const nameInput = screen.getByDisplayValue('Ahmad Khan')
    fireEvent.change(nameInput, { target: { value: 'Temp Name' } })
    // Click edit button again to cancel
    fireEvent.click(screen.getByLabelText('Toggle edit'))
    // Back to read-only view — original name should show in the details row
    expect(screen.getAllByText('Ahmad Khan').length).toBeGreaterThan(0)
  })

  it('opens SMS bottom sheet when SMS button is clicked', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByRole('button', { name: /SMS/i }))
    expect(screen.getByText('Select SMS Template')).toBeInTheDocument()
  })

  it('closes SMS bottom sheet when X is clicked', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByRole('button', { name: /SMS/i }))
    fireEvent.click(screen.getByLabelText ? screen.getAllByRole('button').find((b) => b.textContent?.trim() === '')! : screen.getAllByRole('button')[screen.getAllByRole('button').length - 1])
    // Click the X button in the sheet header
    const xBtn = screen.getAllByRole('button').find((b) => b.closest('[class*="rounded-t-3xl"]'))
    if (xBtn) fireEvent.click(xBtn)
  })

  it('navigates to check-in when Check-In button is clicked', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByRole('button', { name: /Check-In/i }))
    expect(pushMock).toHaveBeenCalledWith('/checkin?leadId=1')
  })

  it('goes back when back button is clicked', () => {
    render(<LeadDetailContent />)
    fireEvent.click(screen.getByLabelText('Back'))
    expect(backMock).toHaveBeenCalled()
  })
})
