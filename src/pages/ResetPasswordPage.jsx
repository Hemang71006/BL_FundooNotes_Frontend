import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails, getSuccessMessage } from '../utils/apiError'
import { resetPassword } from '../services/authService'
import { useSubmitGuard } from '../hooks/useSubmitGuard'
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
 * Description: Provides validated reset-password form UI integrated with the password reset API.
 */

function ResetPasswordPage({ onNavigate }) {
  const guard = useSubmitGuard()
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSuccessMessage('')
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
    setSuccessMessage('')

    if (!Object.values(nextErrors).every((error) => !error)) {
      return
    }

    const requestId = guard.begin()
    if (requestId === null) return

    setLoading(true)

    try {
      const response = await resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        newPassword: form.newPassword,
      })

      if (!guard.isCurrent(requestId)) return
      setSuccessMessage(getSuccessMessage(response, 'Password has been reset successfully'))
    } catch (error) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(error)
      setApiError(details.message)

      const backendErrors = { ...details.validationErrors }
      if (backendErrors.password && !backendErrors.newPassword) {
        backendErrors.newPassword = backendErrors.password
      }
      delete backendErrors.password
      setErrors((current) => ({ ...current, ...backendErrors }))
    } finally {
      if (guard.isCurrent(requestId)) setLoading(false)
      guard.end(requestId)
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
          disabled={loading}
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
          disabled={loading}
        />

        <PasswordInput
          id="newPassword"
          label="New password"
          value={form.newPassword}
          onChange={(value) => updateField('newPassword', value)}
          error={errors.newPassword}
          placeholder="8 to 100 characters"
          autoComplete="new-password"
          maxLength={100}
          disabled={loading}
        />

        <PasswordInput
          id="resetConfirmPassword"
          label="Confirm new password"
          value={form.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          maxLength={100}
          disabled={loading}
        />

        {apiError && <p className="auth-error" role="alert">{apiError}</p>}
        {successMessage && !apiError && (
          <p className="auth-success" role="status">{successMessage}</p>
        )}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>

      <p className="auth-link-copy">
        Back to{' '}
        <button type="button" onClick={() => onNavigate('login')} disabled={loading}>
          Log in
        </button>
      </p>
    </AuthLayout>
  )
}

export default ResetPasswordPage
