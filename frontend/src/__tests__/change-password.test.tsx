/**
 * Tests for the Change Password page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ChangePasswordPage from '@/app/change-password/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
let mockFlow = 'NewUser'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: jest.fn() }),
  useSearchParams: () => ({ get: (key: string) => (key === 'flow' ? mockFlow : null) }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  mockFlow = 'NewUser'
  useAppStore.setState({ deviceRegistered: false })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

const VALID_NEW_PW = 'NewSecure@12345'

function fillForm(oldPw: string, newPw: string, confirmPw = newPw) {
  const oldInput = screen.getByPlaceholderText('Old Password')
  const newInput = screen.getByPlaceholderText('New Password')
  const confirmInput = screen.getByPlaceholderText('Re-enter New Password')
  fireEvent.change(oldInput, { target: { value: oldPw } })
  fireEvent.change(newInput, { target: { value: newPw } })
  fireEvent.change(confirmInput, { target: { value: confirmPw } })
}

describe('ChangePasswordPage', () => {
  it('renders all three password fields', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByPlaceholderText('Old Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Re-enter New Password')).toBeInTheDocument()
  })

  it('Change Password button is disabled when form is incomplete', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeDisabled()
  })

  it('shows error when old password is wrong', () => {
    render(<ChangePasswordPage />)
    fillForm('WrongOld123!', VALID_NEW_PW)
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(screen.getByText('Old password is incorrect')).toBeInTheDocument()
  })

  it('navigates to /shift-start after success in NewUser flow', () => {
    mockFlow = 'NewUser'
    render(<ChangePasswordPage />)
    fillForm('Admin@12345', VALID_NEW_PW)
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })

  it('sets deviceRegistered=true after success in NewUser flow', () => {
    mockFlow = 'NewUser'
    render(<ChangePasswordPage />)
    fillForm('Admin@12345', VALID_NEW_PW)
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(useAppStore.getState().deviceRegistered).toBe(true)
  })

  it('navigates to /login after success in ForgotPassword flow', () => {
    mockFlow = 'ForgotPassword'
    render(<ChangePasswordPage />)
    fillForm('Admin@12345', VALID_NEW_PW)
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('shows success snackbar on valid submission', () => {
    render(<ChangePasswordPage />)
    fillForm('Admin@12345', VALID_NEW_PW)
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(screen.getByText('Password changed successfully')).toBeInTheDocument()
  })

  it('shows "Passwords do not match" when confirm differs', () => {
    render(<ChangePasswordPage />)
    const newInput = screen.getByPlaceholderText('New Password')
    const confirmInput = screen.getByPlaceholderText('Re-enter New Password')
    fireEvent.change(newInput, { target: { value: VALID_NEW_PW } })
    fireEvent.change(confirmInput, { target: { value: 'Different@99999' } })
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('shows "Passwords match" when both fields are identical', () => {
    render(<ChangePasswordPage />)
    const newInput = screen.getByPlaceholderText('New Password')
    const confirmInput = screen.getByPlaceholderText('Re-enter New Password')
    fireEvent.change(newInput, { target: { value: VALID_NEW_PW } })
    fireEvent.change(confirmInput, { target: { value: VALID_NEW_PW } })
    expect(screen.getByText('Passwords match')).toBeInTheDocument()
  })

  it('shows password strength indicator after typing new password', () => {
    render(<ChangePasswordPage />)
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'weak' },
    })
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders all 5 password criteria checklist items', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByText('Min 12 characters')).toBeInTheDocument()
    expect(screen.getByText('Contains lowercase')).toBeInTheDocument()
    expect(screen.getByText('Contains uppercase')).toBeInTheDocument()
    expect(screen.getByText('Contains numbers')).toBeInTheDocument()
    expect(screen.getByText('Contains special characters')).toBeInTheDocument()
  })
})
