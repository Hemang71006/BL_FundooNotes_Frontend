import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails } from '../utils/apiError'
import { resetPassword } from '../services/authService'
import {
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validateResetPassword,
} from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reset Password Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated reset-password form UI without API integration.
 */

function ResetPasswordPage({ onNavigate }) {
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
    setApiError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {
      email: validateEmail(form.email),
      otp: validateOtp(form.otp),
      newPassword: validateResetPassword(form.newPassword),
      confirmPassword: validateConfirmPassword(form.newPassword, form.confirmPassword),
    }

    setErrors(nextErrors)
    setApiError('')

    if (!Object.values(nextErrors).every((error) => !error)) {
      return
    }

    setLoading(true)

    try {
      const response = await resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        newPassword: form.newPassword,
      })
      setSubmitted(true)
      setApiError(response.data)
    } catch (error) {
      const details = getApiErrorDetails(error)
      setSubmitted(false)
      setApiError(details.message)
      setErrors((current) => ({
        ...current,
        ...details.validationErrors,
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your OTP and choose a new password"
      onNavigate={onNavigate}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="resetEmail"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField('email', value)}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
        />

        <AuthInput
          id="otp"
          label="6-digit OTP"
          value={form.otp}
          onChange={(value) => updateField('otp', value)}
          error={errors.otp}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
        />

        <PasswordInput
          id="newPassword"
          label="New password"
          value={form.newPassword}
          onChange={(value) => updateField('newPassword', value)}
          error={errors.newPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <PasswordInput
          id="resetConfirmPassword"
          label="Confirm new password"
          value={form.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />

        {submitted && (
          <p className="auth-success" role="status">
            {apiError}
          </p>
        )}

        {!submitted && apiError && <p className="auth-error" role="alert">{apiError}</p>}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>

      <p className="auth-link-copy">
        Back to{' '}
        <button type="button" onClick={() => onNavigate('login')}>Log in</button>
      </p>
    </AuthLayout>
  )
}

export default ResetPasswordPage
