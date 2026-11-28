import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
import { getApiErrorDetails, getSuccessMessage } from '../utils/apiError'
import { registerUser } from '../services/authService'
import { useSubmitGuard } from '../hooks/useSubmitGuard'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequiredName,
} from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Registration Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated registration form UI integrated with the backend registration API.
 */

function RegisterPage({ onNavigate }) {
  const guard = useSubmitGuard()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
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
      firstName: validateRequiredName(form.firstName, 'First name', 50),
      lastName: validateRequiredName(form.lastName, 'Last name', 50),
      email: validateEmail(form.email, 100),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
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
      const response = await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      if (!guard.isCurrent(requestId)) return
      setSuccessMessage(getSuccessMessage(
        response,
        'Account created successfully. You can now log in.',
      ))
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
      title="Create account"
      subtitle="Start organizing your notes"
      onNavigate={onNavigate}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-name-row">
          <AuthInput
            id="firstName"
            label="First name"
            value={form.firstName}
            onChange={(value) => updateField('firstName', value)}
            error={errors.firstName}
            placeholder="First name"
            autoComplete="given-name"
            maxLength={50}
            disabled={loading}
          />
          <AuthInput
            id="lastName"
            label="Last name"
            value={form.lastName}
            onChange={(value) => updateField('lastName', value)}
            error={errors.lastName}
            placeholder="Last name"
            autoComplete="family-name"
            maxLength={50}
            disabled={loading}
          />
        </div>

        <AuthInput
          id="registerEmail"
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

        <PasswordInput
          id="registerPassword"
          label="Password"
          value={form.password}
          onChange={(value) => updateField('password', value)}
          error={errors.password}
          placeholder="8 to 100 characters"
          autoComplete="new-password"
          maxLength={100}
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder="Re-enter password"
          autoComplete="new-password"
          maxLength={100}
          disabled={loading}
        />

        {apiError && <p className="auth-error" role="alert">{apiError}</p>}
        {successMessage && !apiError && (
          <p className="auth-success" role="status">{successMessage}</p>
        )}

        <button type="submit" className="auth-primary-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-link-copy">
        Already have an account?{' '}
        <button type="button" onClick={() => onNavigate('login')} disabled={loading}>
          Log in
        </button>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage
