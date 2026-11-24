import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'
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

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextError = validateEmail(email)

    setError(nextError)
    setSubmitted(!nextError)
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
          }}
          error={error}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
        />

        {submitted && (
          <p className="auth-success" role="status">
            Password recovery details are valid.
          </p>
        )}

        <button type="submit" className="auth-primary-button">Continue</button>
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
