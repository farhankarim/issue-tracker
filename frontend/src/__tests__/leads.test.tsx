/**
 * Tests for the Leads page.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LeadsPage from '@/app/leads/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}))

beforeEach(() => {
  pushMock.mockClear()
  backMock.mockClear()
  // Restore default dummy leads
  useAppStore.setState({
    leads: [
      { id: '1', customerName: 'Ahmad Khan', phone: '+92-300-1234567', email: '', channel: 'Own', status: 'Open', source: '', remarks: '', address: 'DHA', dateCreated: '2026-04-10', activities: [] },
      { id: '2', customerName: 'Sara Ahmed', phone: '+92-321-9876543', email: '', channel: 'Social Media', status: 'In Process', source: '', remarks: '', address: 'Gulshan', dateCreated: '2026-04-09', activities: [] },
      { id: '3', customerName: 'Bilal Hussain', phone: '+92-333-5551234', email: '', channel: 'Website', status: 'Qualified', source: '', remarks: '', address: 'Clifton', dateCreated: '2026-04-08', activities: [] },
    ],
  })
})

describe('LeadsPage', () => {
  it('renders all leads from the store', () => {
    render(<LeadsPage />)
    expect(screen.getByText('Ahmad Khan')).toBeInTheDocument()
    expect(screen.getByText('Sara Ahmed')).toBeInTheDocument()
    expect(screen.getByText('Bilal Hussain')).toBeInTheDocument()
  })

  it('filters leads by name search query', () => {
    render(<LeadsPage />)
    fireEvent.change(screen.getByPlaceholderText('Search by name or phone...'), {
      target: { value: 'Ahmad' },
    })
    expect(screen.getByText('Ahmad Khan')).toBeInTheDocument()
    expect(screen.queryByText('Sara Ahmed')).not.toBeInTheDocument()
  })

  it('filters leads by phone search query', () => {
    render(<LeadsPage />)
    fireEvent.change(screen.getByPlaceholderText('Search by name or phone...'), {
      target: { value: '321' },
    })
    expect(screen.getByText('Sara Ahmed')).toBeInTheDocument()
    expect(screen.queryByText('Ahmad Khan')).not.toBeInTheDocument()
  })

  it('shows empty state when no leads match', () => {
    render(<LeadsPage />)
    fireEvent.change(screen.getByPlaceholderText('Search by name or phone...'), {
      target: { value: 'ZZZZZ' },
    })
    expect(screen.getByText('No leads found')).toBeInTheDocument()
  })

  it('filters by channel', () => {
    render(<LeadsPage />)
    // Click the Social Media filter chip (in the channel filter row)
    const channelChips = screen.getAllByText('Social Media')
    // The first occurrence is the channel chip button
    fireEvent.click(channelChips[0])
    expect(screen.getByText('Sara Ahmed')).toBeInTheDocument()
    expect(screen.queryByText('Ahmad Khan')).not.toBeInTheDocument()
  })

  it('filters by status', () => {
    render(<LeadsPage />)
    const qualifiedChips = screen.getAllByText('Qualified')
    // First occurrence is the status chip button
    fireEvent.click(qualifiedChips[0])
    expect(screen.getByText('Bilal Hussain')).toBeInTheDocument()
    expect(screen.queryByText('Ahmad Khan')).not.toBeInTheDocument()
  })

  it('navigates to lead detail when a lead card is clicked', () => {
    render(<LeadsPage />)
    fireEvent.click(screen.getByText('Ahmad Khan'))
    expect(pushMock).toHaveBeenCalledWith('/lead-detail?id=1')
  })

  it('navigates to /add-lead when FAB is clicked', () => {
    render(<LeadsPage />)
    fireEvent.click(screen.getByLabelText('Add lead'))
    expect(pushMock).toHaveBeenCalledWith('/add-lead')
  })

  it('goes back when the back button is clicked', () => {
    render(<LeadsPage />)
    fireEvent.click(screen.getByLabelText('Back'))
    expect(backMock).toHaveBeenCalled()
  })
})
