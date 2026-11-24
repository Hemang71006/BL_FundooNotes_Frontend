import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails } from '../utils/apiError'
import { requestPasswordReset } from '../services/authService'
import { validateEmail } from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Forgot Password Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated forgot-password email form UI without API integration.
 */

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextError = validateEmail(email)

    setError(nextError)
    setApiError('')

    if (nextError) {
      setSubmitted(false)
      return
    }

    setLoading(true)

    try {
      const response = await requestPasswordReset({ email: email.trim() })
      setSubmitted(true)
      setApiError(response.data)
    } catch (requestError) {
      const details = getApiErrorDetails(requestError)
      setSubmitted(false)
      setApiError(details.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email to receive a reset OTP"
      onNavigate={onNavigate}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="forgotEmail"
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setSubmitted(false)
            setApiError('')
          }}
          error={error}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
        />

        {submitted && (
          <p className="auth-success" role="status">
            {apiError}
          </p>
        )}

        {!submitted && apiError && <p className="auth-error" role="alert">{apiError}</p>}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Sending...' : 'Continue'}
        </button>
      </form>

      <p className="auth-link-copy">
        Remembered your password?{' '}
        <button type="button" onClick={() => onNavigate('login')}>Log in</button>
      </p>
      <p className="auth-link-copy">
        Already received an OTP?{' '}
        <button type="button" onClick={() => onNavigate('reset-password')}>Reset password</button>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
