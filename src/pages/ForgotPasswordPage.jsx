import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails, getSuccessMessage } from '../utils/apiError'
import { requestPasswordReset } from '../services/authService'
import { useSubmitGuard } from '../hooks/useSubmitGuard'
import { validateEmail } from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Forgot Password Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated forgot-password email form UI integrated with the reset API.
 */

function ForgotPasswordPage({ onNavigate }) {
  const guard = useSubmitGuard()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextError = validateEmail(email)

    setEmailError(nextError)
    setApiError('')
    setSuccessMessage('')

    if (nextError) return

    const requestId = guard.begin()
    if (requestId === null) return

    setLoading(true)

    try {
      const response = await requestPasswordReset({ email: email.trim() })

      if (!guard.isCurrent(requestId)) return
      setSuccessMessage(getSuccessMessage(
        response,
        'If the email is registered, a password reset OTP has been sent.',
      ))
    } catch (requestError) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(requestError)
      setApiError(details.message)
      setEmailError(details.validationErrors?.email || '')
    } finally {
      if (guard.isCurrent(requestId)) setLoading(false)
      guard.end(requestId)
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
            setEmailError('')
            setApiError('')
            setSuccessMessage('')
          }}
          error={emailError}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
          disabled={loading}
        />

        {apiError && <p className="auth-error" role="alert">{apiError}</p>}
        {successMessage && !apiError && (
          <p className="auth-success" role="status">{successMessage}</p>
        )}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Sending...' : 'Continue'}
        </button>
      </form>

      <p className="auth-link-copy">
        Remembered your password?{' '}
        <button type="button" onClick={() => onNavigate('login')} disabled={loading}>
          Log in
        </button>
      </p>
      <p className="auth-link-copy">
        Already received an OTP?{' '}
        <button type="button" onClick={() => onNavigate('reset-password')} disabled={loading}>
          Reset password
        </button>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
