/*
 * Project: Fundoo Notes Frontend
 * Module: API Error Utilities
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Normalizes backend and network errors into safe, user-facing messages.
 */

const DEFAULT_ERROR_MESSAGE = 'Unable to complete the request. Please try again.'
const NETWORK_ERROR_MESSAGE = 'Unable to reach the backend. Check that the server is running.'
const TIMEOUT_ERROR_MESSAGE = 'The request took too long. Please try again.'
const SERVER_ERROR_MESSAGE = 'The server had a problem completing this request. Please try again.'
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please log in again.'

function asMessage(value) {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value)) {
    return value.map(asMessage).filter(Boolean).join(', ')
  }
  if (value && typeof value === 'object') {
    return asMessage(value.message || value.error || value.detail || value.title)
  }
  return ''
}

function normalizeValidationErrors(responseData) {
  const source = responseData?.validationErrors
    || responseData?.fieldErrors
    || responseData?.errors
    || {}

  if (typeof source !== 'object' || Array.isArray(source)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(source).map(([field, value]) => [field, asMessage(value)]),
  )
}

export function getSuccessMessage(response, fallback) {
  const data = response?.data
  return asMessage(data) || fallback
}

export function getApiErrorDetails(error) {
  const status = error?.response?.status

  if (status === 401 || status === 403) {
    return {
      message: asMessage(error.response.data) || SESSION_ERROR_MESSAGE,
      validationErrors: normalizeValidationErrors(error.response.data),
    }
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return { message: TIMEOUT_ERROR_MESSAGE, validationErrors: {} }
  }

  if (!error?.response) {
    if (error?.request) {
      return { message: NETWORK_ERROR_MESSAGE, validationErrors: {} }
    }
    return {
      message: asMessage(error?.message) || DEFAULT_ERROR_MESSAGE,
      validationErrors: {},
    }
  }

  const responseData = error.response.data
  const backendMessage = typeof responseData === 'string'
    ? asMessage(responseData)
    : asMessage(responseData)

  return {
    message: backendMessage
      || (status >= 500 ? SERVER_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE),
    validationErrors: normalizeValidationErrors(responseData),
  }
}
