/**
 * Tests for the Login page.
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { useAppStore } from '@/lib/store'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  pushMock.mockClear()
  useAppStore.setState({
    isLoggedIn: false,
    user: null,
    deviceRegistered: false,
    fingerprintEnabled: false,
    failedLoginAttempts: 0,
    accountBlockedUntil: null,
    accountPermanentlyBlocked: false,
    shiftActive: false,
    shiftStartTime: null,
  })
})
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

function fillAndSubmit(loginId: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText('Login ID'), { target: { value: loginId } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: password } })
  fireEvent.click(screen.getByText('Login'))
}

describe('LoginPage', () => {
  it('renders Login ID and Password fields', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('Login ID')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('shows error when fields are empty', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getByText('Please enter both Login ID and Password')).toBeInTheDocument()
  })

  it('shows error for invalid credentials', () => {
    render(<LoginPage />)
    fillAndSubmit('wrongUser', 'wrongPass')
    expect(screen.getByText('Invalid Login ID or Password')).toBeInTheDocument()
  })

  it('navigates to /shift-start for registered device on valid login (user01)', () => {
    useAppStore.setState({ deviceRegistered: true })
    render(<LoginPage />)
    fillAndSubmit('user01', 'Admin@12345')
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })

  it('navigates to /verify-otp?flow=NewUser for unregistered device on valid login', () => {
    useAppStore.setState({ deviceRegistered: false })
    render(<LoginPage />)
    fillAndSubmit('user01', 'Admin@12345')
    expect(pushMock).toHaveBeenCalledWith('/verify-otp?flow=NewUser')
  })

  it('accepts the Christine_Brakus56 user credentials', () => {
    useAppStore.setState({ deviceRegistered: true })
    render(<LoginPage />)
    fillAndSubmit('Christine_Brakus56@yahoo.com', 'farhan')
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })

  it('sets isLoggedIn and user in store after successful login', () => {
    render(<LoginPage />)
    fillAndSubmit('user01', 'Admin@12345')
    const { isLoggedIn, user } = useAppStore.getState()
    expect(isLoggedIn).toBe(true)
    expect(user?.loginId).toBe('user01')
  })

  it('increments failed attempts on wrong credentials', () => {
    render(<LoginPage />)
    fillAndSubmit('bad', 'bad')
    expect(useAppStore.getState().failedLoginAttempts).toBe(1)
  })

  it('shows temporary block alert after 3 failed attempts', () => {
    useAppStore.setState({ failedLoginAttempts: 2 })
    render(<LoginPage />)
    fillAndSubmit('bad', 'bad')
    expect(screen.getByText('Account Temporarily Blocked')).toBeInTheDocument()
  })

  it('shows permanent block alert after 5 failed attempts', () => {
    useAppStore.setState({ failedLoginAttempts: 4 })
    render(<LoginPage />)
    fillAndSubmit('bad', 'bad')
    expect(screen.getByText('Account Permanently Blocked')).toBeInTheDocument()
  })

  it('allows correct credentials through even when temporarily blocked', () => {
    useAppStore.setState({ accountBlockedUntil: Date.now() + 900_000, deviceRegistered: true })
    render(<LoginPage />)
    fillAndSubmit('user01', 'Admin@12345')
    expect(pushMock).toHaveBeenCalledWith('/shift-start')
  })

  it('shows Forgot Password link', () => {
    render(<LoginPage />)
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
  })

  it('navigates to /forgot-password on Forgot Password click', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Forgot Password?'))
    expect(pushMock).toHaveBeenCalledWith('/forgot-password')
  })

  it('toggles password visibility', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    // click the eye toggle button (second button in the form area)
    const toggleBtn = passwordInput.parentElement?.querySelector('button')!
    fireEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('does not show fingerprint button when fingerprintEnabled is false', () => {
    render(<LoginPage />)
    expect(screen.queryByText('Login with Fingerprint')).not.toBeInTheDocument()
  })

  it('shows fingerprint button when fingerprintEnabled is true', () => {
    useAppStore.setState({ fingerprintEnabled: true })
    render(<LoginPage />)
    expect(screen.getByText('Login with Fingerprint')).toBeInTheDocument()
  })
})
