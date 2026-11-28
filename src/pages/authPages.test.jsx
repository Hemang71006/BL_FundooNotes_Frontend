import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import ResetPasswordPage from './ResetPasswordPage'
import {
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/authService'

const authState = vi.hoisted(() => ({ login: vi.fn(), notice: '' }))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: authState.login, authNotice: authState.notice }),
}))

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}))

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function fillRegistrationForm() {
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Hemang' } })
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Shah' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hemang@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } })
}

describe('authentication UI', () => {
  beforeEach(() => {
    authState.login.mockReset()
    authState.notice = ''
    registerUser.mockReset()
    requestPasswordReset.mockReset()
    resetPassword.mockReset()
  })

  it('validates email domains before calling login', async () => {
    const onNavigate = vi.fn()
    render(<LoginPage onNavigate={onNavigate} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Please provide a valid email address')).toBeInTheDocument()
    expect(authState.login).not.toHaveBeenCalled()
  })

  it('shows backend login errors and session-expiry notices', async () => {
    authState.login.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Invalid email or password' } },
    })
    const firstRender = render(<LoginPage onNavigate={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')

    firstRender.unmount()
    authState.notice = 'Your session has expired. Please log in again.'
    render(<LoginPage onNavigate={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Your session has expired')
  })

  it('prevents duplicate login submissions and navigates only after success', async () => {
    const pending = createDeferred()
    const onNavigate = vi.fn()
    authState.login.mockReturnValueOnce(pending.promise)
    render(<LoginPage onNavigate={onNavigate} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })

    const form = screen.getByRole('button', { name: 'Log in' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(authState.login).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled()

    await act(async () => {
      pending.resolve({ message: 'Login successful' })
      await pending.promise
    })

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('dashboard'))
  })

  it('shows registration success only after the API resolves', async () => {
    const pending = createDeferred()
    registerUser.mockReturnValueOnce(pending.promise)
    render(<RegisterPage onNavigate={vi.fn()} />)
    fillRegistrationForm()

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled()

    await act(async () => {
      pending.resolve({ data: { id: 1 } })
      await pending.promise
    })

    expect(await screen.findByRole('status')).toHaveTextContent('Account created successfully')
  })

  it('maps registration conflicts to an error message', async () => {
    registerUser.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Email is already registered' } },
    })
    render(<RegisterPage onNavigate={vi.fn()} />)
    fillRegistrationForm()

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered')
  })

  it('shows the plain-text forgot-password response', async () => {
    requestPasswordReset.mockResolvedValueOnce({
      data: 'If the email is registered, a password reset OTP has been sent.',
    })
    render(<ForgotPasswordPage onNavigate={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'If the email is registered, a password reset OTP has been sent.',
    )
  })

  it('maps backend password validation errors to the new-password field', async () => {
    resetPassword.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'Invalid or expired OTP',
          validationErrors: { password: 'Password is too short' },
        },
      },
    })
    render(<ResetPasswordPage onNavigate={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('6-digit OTP'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired OTP')
    expect(screen.getByText('Password is too short')).toBeInTheDocument()
  })
})
