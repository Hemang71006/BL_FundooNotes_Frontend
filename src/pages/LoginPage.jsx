import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails } from '../utils/apiError'
import { useAuth } from '../hooks/useAuth'
import { useSubmitGuard } from '../hooks/useSubmitGuard'
import { validateEmail } from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Login Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated login form UI integrated with centralized authentication state.
 */

function LoginPage({ onNavigate }) {
  const { login, authNotice } = useAuth()
  const guard = useSubmitGuard()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {
      email: validateEmail(email),
      password: !password ? 'Password is required' : '',
    }

    setErrors(nextErrors)
    setApiError('')

    if (!Object.values(nextErrors).every((error) => !error)) {
      return
    }

    const requestId = guard.begin()
    if (requestId === null) return

    setLoading(true)

    try {
      await login({
        email: email.trim(),
        password,
      })

      if (!guard.isCurrent(requestId)) return
      onNavigate('dashboard')
    } catch (error) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(error)
      setApiError(details.message)
      setErrors((current) => ({
        ...current,
        ...details.validationErrors,
      }))
    } finally {
      if (guard.isCurrent(requestId)) setLoading(false)
      guard.end(requestId)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to Fundoo Notes"
      onNavigate={onNavigate}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="loginEmail"
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setErrors((current) => ({ ...current, email: '' }))
            setApiError('')
          }}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
          disabled={loading}
        />

        <PasswordInput
          id="loginPassword"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setErrors((current) => ({ ...current, password: '' }))
            setApiError('')
          }}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={loading}
        />

        <button
          type="button"
          className="auth-text-button auth-align-right"
          onClick={() => onNavigate('forgot-password')}
          disabled={loading}
        >
          Forgot password?
        </button>

        {(authNotice || apiError) && (
          <p className="auth-error" role="alert">{authNotice || apiError}</p>
        )}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="auth-link-copy">
        New to Fundoo Notes?{' '}
        <button
          type="button"
          onClick={() => onNavigate('register')}
          disabled={loading}
        >
          Create account
        </button>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
