import { describe, expect, it } from 'vitest'
import { getApiErrorDetails, getSuccessMessage } from './apiError'

describe('getApiErrorDetails', () => {
  it('extracts backend messages and field errors', () => {
    const details = getApiErrorDetails({
      response: {
        status: 400,
        data: {
          message: 'Request validation failed',
          validationErrors: { title: 'Note title is required' },
        },
      },
    })

    expect(details).toEqual({
      message: 'Request validation failed',
      validationErrors: { title: 'Note title is required' },
    })
  })

  it('keeps backend authorization messages and supplies a session fallback', () => {
    const withBackendMessage = getApiErrorDetails({
      response: { status: 401, data: { message: 'Unauthorized' } },
    })
    const withoutBackendMessage = getApiErrorDetails({
      response: { status: 403, data: {} },
    })

    expect(withBackendMessage.message).toBe('Unauthorized')
    expect(withoutBackendMessage.message).toBe('Your session has expired. Please log in again.')
  })

  it('distinguishes timeouts, network failures and server failures', () => {
    expect(getApiErrorDetails({ code: 'ECONNABORTED' }).message)
      .toBe('The request took too long. Please try again.')
    expect(getApiErrorDetails({ request: {} }).message)
      .toBe('Unable to reach the backend. Check that the server is running.')
    expect(getApiErrorDetails({ response: { status: 500, data: {} } }).message)
      .toBe('The server had a problem completing this request. Please try again.')
  })

  it('falls back to plain error messages', () => {
    expect(getApiErrorDetails(new Error('Custom failure')).message).toBe('Custom failure')
  })
})

describe('getSuccessMessage', () => {
  it('reads plain-text backend responses', () => {
    expect(getSuccessMessage(
      { data: 'Password has been reset successfully' },
      'Fallback',
    )).toBe('Password has been reset successfully')
  })

  it('reads object messages and uses the fallback when absent', () => {
    expect(getSuccessMessage({ data: { message: 'Saved' } }, 'Fallback')).toBe('Saved')
    expect(getSuccessMessage({ data: { id: 1 } }, 'Fallback')).toBe('Fallback')
  })
})
