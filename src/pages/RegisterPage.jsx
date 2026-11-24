import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
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
 * Description: Provides validated registration form UI without backend integration.
 */

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {
      firstName: validateRequiredName(form.firstName, 'First name', 50),
      lastName: validateRequiredName(form.lastName, 'Last name', 50),
      email: validateEmail(form.email, 100),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).every((error) => !error)) {
      setSubmitted(true)
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
        />

        {submitted && (
          <p className="auth-success" role="status">
            Registration details are valid.
          </p>
        )}

        <button type="submit" className="auth-primary-button">Create account</button>
      </form>

      <p className="auth-link-copy">
        Already have an account?{' '}
        <button type="button" onClick={() => onNavigate('login')}>Log in</button>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage
