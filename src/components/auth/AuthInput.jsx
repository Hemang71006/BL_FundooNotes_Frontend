/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Input
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Renders a reusable controlled authentication input with validation feedback.
 */

function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  maxLength,
  inputMode,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <span id={`${id}-error`} className="auth-field-error">{error}</span>}
    </div>
  )
}

export default AuthInput
