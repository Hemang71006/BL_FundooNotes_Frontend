import { describe, expect, it } from 'vitest'
import { validateEmail, validateResetPassword } from './validators'

describe('authentication validators', () => {
  it('requires a dotted domain in email addresses', () => {
    expect(validateEmail('person@example.com')).toBe('')
    expect(validateEmail('person@example')).toBe('Please provide a valid email address')
  })

  it('applies the same password bounds to reset as registration', () => {
    expect(validateResetPassword('1234567')).toBe('Password must be between 8 and 100 characters')
    expect(validateResetPassword('a'.repeat(101))).toBe('Password must be between 8 and 100 characters')
    expect(validateResetPassword('12345678')).toBe('')
  })
})
