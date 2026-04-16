/**
 * Tests for the Forgot Password page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ForgotPasswordPage from '@/app/forgot-password/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: jest.fn() }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('ForgotPasswordPage', () => {
  it('renders Login ID input and Generate OTP button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByPlaceholderText('Login ID')).toBeInTheDocument()
    expect(screen.getByText('Generate OTP')).toBeInTheDocument()
  })

  it('shows error snackbar when Login ID is empty', () => {
    render(<ForgotPasswordPage />)
    fireEvent.click(screen.getByText('Generate OTP'))
    expect(screen.getByText('Please enter your Login ID')).toBeInTheDocument()
  })

  it('navigates to /verify-otp?flow=ForgotPassword after entering a Login ID', () => {
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByPlaceholderText('Login ID'), { target: { value: 'user01' } })
    fireEvent.click(screen.getByText('Generate OTP'))
    // The page uses a 1500 ms loading delay before navigating
    act(() => { jest.advanceTimersByTime(1500) })
    expect(pushMock).toHaveBeenCalledWith('/verify-otp?flow=ForgotPassword')
  })

  it('triggers Generate OTP on Enter key press', () => {
    render(<ForgotPasswordPage />)
    const input = screen.getByPlaceholderText('Login ID')
    fireEvent.change(input, { target: { value: 'user01' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    act(() => { jest.advanceTimersByTime(1500) })
    expect(pushMock).toHaveBeenCalledWith('/verify-otp?flow=ForgotPassword')
  })
})
