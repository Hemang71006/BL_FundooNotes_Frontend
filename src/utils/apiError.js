/*
 * Project: Fundoo Notes Frontend
 * Module: API Error Utilities
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Normalizes backend and network errors for authentication pages.
 */

const DEFAULT_ERROR_MESSAGE = 'Unable to complete the request. Please try again.'
const NETWORK_ERROR_MESSAGE = 'Unable to reach the backend. Check that the server is running.'

export function getApiErrorDetails(error) {
  if (!error.response) {
    return {
      message: error.request ? NETWORK_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE,
      validationErrors: {},
    }
  }

  const responseData = error.response.data

  if (typeof responseData === 'string') {
    return {
      message: responseData || DEFAULT_ERROR_MESSAGE,
      validationErrors: {},
    }
  }

  return {
    message: responseData?.message || DEFAULT_ERROR_MESSAGE,
    validationErrors: responseData?.validationErrors || {},
  }
}
