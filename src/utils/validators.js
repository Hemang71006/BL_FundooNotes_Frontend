/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Validators
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides reusable frontend validation matching authentication DTO rules.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/

export function validateEmail(email, maxLength) {
  if (!email.trim()) return 'Email is required'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please provide a valid email address'
  if (maxLength && email.trim().length > maxLength) {
    return `Email cannot exceed ${maxLength} characters`
  }
  return ''
}

export function validateRequiredName(name, fieldLabel, maxLength) {
  if (!name.trim()) return `${fieldLabel} is required`
  if (name.trim().length > maxLength) return `${fieldLabel} cannot exceed ${maxLength} characters`
  return ''
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8 || password.length > 100) {
    return 'Password must be between 8 and 100 characters'
  }
  return ''
}

export function validateResetPassword(password) {
  if (!password) return 'New password is required'
  if (password.length < 8) return 'Password must contain at least 8 characters'
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirm password is required'
  if (password !== confirmPassword) return 'Passwords do not match'
  return ''
}

export function validateOtp(otp) {
  if (!otp.trim()) return 'OTP is required'
  if (!/^[0-9]{6}$/.test(otp)) return 'OTP must contain exactly 6 digits'
  return ''
}
