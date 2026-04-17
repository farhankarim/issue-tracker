/**
 * Tests for the Add Lead page.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AddLeadContent from '@/app/add-lead/add-lead-content'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
let mockPhone = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
  useSearchParams: () => ({ get: (key: string) => (key === 'phone' ? mockPhone : null) }),
}))

beforeEach(() => {
  pushMock.mockClear()
  backMock.mockClear()
  mockPhone = ''
  // Reset leads so we can check additions cleanly
  useAppStore.setState({ leads: [] })
})

function fillRequiredFields(name = 'Test Customer', phone = '0300-1234567') {
  fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: name } })
  fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: phone } })
}

describe('AddLeadContent', () => {
  it('renders all form fields', () => {
    render(<AddLeadContent />)
    expect(screen.getByPlaceholderText('Enter customer name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter lead source')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter notes or remarks')).toBeInTheDocument()
  })

  it('shows validation error when customer name is missing', () => {
    render(<AddLeadContent />)
    fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Lead' }))
    expect(screen.getByText('Customer name is required')).toBeInTheDocument()
  })

  it('shows validation error when phone is missing', () => {
    render(<AddLeadContent />)
    fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: 'John' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Lead' }))
    expect(screen.getByText('Phone number is required')).toBeInTheDocument()
  })

  it('adds a new lead to the store on valid submission', () => {
    render(<AddLeadContent />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Add Lead' }))
    const leads = useAppStore.getState().leads
    expect(leads).toHaveLength(1)
    expect(leads[0].customerName).toBe('Test Customer')
    expect(leads[0].status).toBe('Open')
  })

  it('navigates to checkin page for the new lead after submission', () => {
    render(<AddLeadContent />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Add Lead' }))
    const newLeadId = useAppStore.getState().leads[0].id
    expect(pushMock).toHaveBeenCalledWith(`/checkin?leadId=${newLeadId}`)
  })

  it('pre-fills phone when ?phone param is set', () => {
    mockPhone = '+92-999-0000000'
    render(<AddLeadContent />)
    expect(screen.getByPlaceholderText('Enter phone number')).toHaveValue('+92-999-0000000')
  })

  it('shows discard dialog when navigating back with dirty form', () => {
    render(<AddLeadContent />)
    fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: 'Dirty' } })
    fireEvent.click(screen.getByLabelText('Back'))
    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
  })

  it('cancels discard and stays on page', () => {
    render(<AddLeadContent />)
    fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: 'Dirty' } })
    fireEvent.click(screen.getByLabelText('Back'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(backMock).not.toHaveBeenCalled()
  })

  it('discards and goes back when Discard is confirmed', () => {
    render(<AddLeadContent />)
    fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: 'Dirty' } })
    fireEvent.click(screen.getByLabelText('Back'))
    fireEvent.click(screen.getByText('Discard'))
    expect(backMock).toHaveBeenCalled()
  })

  it('goes back immediately when form is clean', () => {
    render(<AddLeadContent />)
    fireEvent.click(screen.getByLabelText('Back'))
    expect(backMock).toHaveBeenCalled()
  })

  it('Lead Channel dropdown contains all options', () => {
    render(<AddLeadContent />)
    const select = screen.getByDisplayValue('Own') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(expect.arrayContaining(['Own', 'BTL', 'Social Media', 'Website', 'Call Center', 'SMS']))
  })
})
