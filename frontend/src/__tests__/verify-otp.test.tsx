/**
 * Tests for the Verify OTP page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import VerifyOTPPage from '@/app/verify-otp/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
const backMock = jest.fn()
let mockFlow = 'NewUser'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
  useSearchParams: () => ({ get: (key: string) => (key === 'flow' ? mockFlow : null) }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  backMock.mockClear()
  mockFlow = 'NewUser'
  useAppStore.setState({ deviceRegistered: false })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

/** Enter 4 digits into the OTP inputs */
function enterOtp(code: string) {
  const inputs = screen.getAllByRole('textbox')
  code.split('').forEach((digit, i) => {
    fireEvent.change(inputs[i], { target: { value: digit } })
  })
}

describe('VerifyOTPPage', () => {
  it('renders 4 OTP input boxes', () => {
    render(<VerifyOTPPage />)
    expect(screen.getAllByRole('textbox')).toHaveLength(4)
  })

  it('shows "OTP expires in" timer text initially', () => {
    render(<VerifyOTPPage />)
    expect(screen.getByText(/OTP expires in/)).toBeInTheDocument()
  })

  it('Verify button is disabled until all 4 digits are entered', () => {
    render(<VerifyOTPPage />)
    const btn = screen.getByRole('button', { name: /Verify/i })
    expect(btn).toBeDisabled()
  })

  it('shows error snackbar on wrong OTP', () => {
    render(<VerifyOTPPage />)
    enterOtp('0000')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    expect(screen.getByText('Invalid OTP. Please try again.')).toBeInTheDocument()
  })

  it('shows success snackbar on correct OTP (1234)', () => {
    render(<VerifyOTPPage />)
    enterOtp('1234')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    expect(screen.getByText('OTP verified successfully!')).toBeInTheDocument()
  })

  it('navigates to /change-password?flow=NewUser after correct OTP (NewUser flow)', () => {
    mockFlow = 'NewUser'
    render(<VerifyOTPPage />)
    enterOtp('1234')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    act(() => { jest.advanceTimersByTime(500) })
    expect(pushMock).toHaveBeenCalledWith('/change-password?flow=NewUser')
  })

  it('navigates to /shift-start after correct OTP (NewDevice flow)', () => {
    mockFlow = 'NewDevice'
    render(<VerifyOTPPage />)
    enterOtp('1234')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    act(() => { jest.advanceTimersByTime(500) })
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })

  it('sets deviceRegistered=true after correct OTP (NewDevice flow)', () => {
    mockFlow = 'NewDevice'
    render(<VerifyOTPPage />)
    enterOtp('1234')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    act(() => { jest.advanceTimersByTime(500) })
    expect(useAppStore.getState().deviceRegistered).toBe(true)
  })

  it('navigates to /change-password?flow=ForgotPassword (ForgotPassword flow)', () => {
    mockFlow = 'ForgotPassword'
    render(<VerifyOTPPage />)
    enterOtp('1234')
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }))
    act(() => { jest.advanceTimersByTime(500) })
    expect(pushMock).toHaveBeenCalledWith('/change-password?flow=ForgotPassword')
  })

  it('shows OTP expired message after 60 seconds', () => {
    render(<VerifyOTPPage />)
    act(() => { jest.advanceTimersByTime(60_000) })
    expect(screen.getByText('OTP expired')).toBeInTheDocument()
  })

  it('OTP inputs are disabled after expiry', () => {
    render(<VerifyOTPPage />)
    act(() => { jest.advanceTimersByTime(60_000) })
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => expect(input).toBeDisabled())
  })

  it('resets OTP and timer when Generate OTP Again is clicked', () => {
    render(<VerifyOTPPage />)
    act(() => { jest.advanceTimersByTime(60_000) })
    fireEvent.click(screen.getByText('Generate OTP Again'))
    expect(screen.queryByText('OTP expired')).not.toBeInTheDocument()
    expect(screen.getByText(/OTP expires in/)).toBeInTheDocument()
  })

  it('navigates to /login when Back to Login is clicked', () => {
    render(<VerifyOTPPage />)
    fireEvent.click(screen.getByText('Back to Login'))
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
