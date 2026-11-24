import { useState } from 'react'

/*
 * Project: Fundoo Notes Frontend
 * Module: Password Input
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Renders a controlled password field with an accessible show and hide control.
 */

function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete = 'current-password',
  maxLength,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <span id={`${id}-error`} className="auth-field-error">{error}</span>}
    </div>
  )
}

export default PasswordInput
