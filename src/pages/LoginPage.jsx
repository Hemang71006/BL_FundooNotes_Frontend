import { useState } from 'react'
import AuthInput from '../components/auth/AuthInput'
import PasswordInput from '../components/auth/PasswordInput'
import AuthLayout from '../components/auth/AuthLayout'
import { validateEmail } from '../utils/validators'

/*
 * Project: Fundoo Notes Frontend
 * Module: Login Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated login form UI without authentication API calls.
 */

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {
      email: validateEmail(email),
      password: !password ? 'Password is required' : '',
    }

    setErrors(nextErrors)
    setSubmitted(Object.values(nextErrors).every((error) => !error))
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
            setSubmitted(false)
          }}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={100}
        />

        <PasswordInput
          id="loginPassword"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setSubmitted(false)
          }}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button
          type="button"
          className="auth-text-button auth-align-right"
          onClick={() => onNavigate('forgot-password')}
        >
          Forgot password?
        </button>

        {submitted && (
          <p className="auth-success" role="status">
            Login details are valid.
          </p>
        )}

        <button type="submit" className="auth-primary-button">Log in</button>
      </form>

      <p className="auth-link-copy">
        New to Fundoo Notes?{' '}
        <button type="button" onClick={() => onNavigate('register')}>Create account</button>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
