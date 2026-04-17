/**
 * Tests for the Shift Start page.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ShiftStartPage from '@/app/shift-start/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

beforeEach(() => {
  pushMock.mockClear()
  replaceMock.mockClear()
  useAppStore.setState({ shiftActive: false, shiftStartTime: null, isLoggedIn: true, user: { name: 'Test', email: 't@t.com', role: 'sales_rep', loginId: 'user01' } })
})

describe('ShiftStartPage', () => {
  it('renders "Ready to Start Your Shift?" card', () => {
    render(<ShiftStartPage />)
    expect(screen.getByText('Ready to Start Your Shift?')).toBeInTheDocument()
  })

  it('renders Start Shift button', () => {
    render(<ShiftStartPage />)
    expect(screen.getByRole('button', { name: /Start Shift/i })).toBeInTheDocument()
  })

  it('redirects to /dashboard when shiftActive is already true', () => {
    useAppStore.setState({ shiftActive: true })
    render(<ShiftStartPage />)
    expect(replaceMock).toHaveBeenCalledWith('/dashboard')
  })

  it('starts shift and navigates to /dashboard on button click', () => {
    render(<ShiftStartPage />)
    fireEvent.click(screen.getByRole('button', { name: /Start Shift/i }))
    expect(useAppStore.getState().shiftActive).toBe(true)
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('logs out and navigates to /login when logout button is clicked', () => {
    render(<ShiftStartPage />)
    fireEvent.click(screen.getByLabelText('Logout'))
    expect(useAppStore.getState().isLoggedIn).toBe(false)
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
