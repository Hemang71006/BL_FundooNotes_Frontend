/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Session Storage
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Safely persists and restores the backend JWT session without storing credentials.
 */

const SESSION_KEY = 'fundoo-auth-session'

function isValidToken(token) {
  if (typeof token !== 'string' || !token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function saveAuthSession(response) {
  if (!response || response.tokenType !== 'Bearer' || !isValidToken(response.token)) {
    throw new Error('Authentication response did not contain a valid token.')
  }

  const session = {
    token: response.token,
    user: {
      email: response.email,
    },
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getAuthSession() {
  const storedSession = localStorage.getItem(SESSION_KEY)
  if (!storedSession) return null

  try {
    const session = JSON.parse(storedSession)
    if (!isValidToken(session.token) || !session.user?.email) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_KEY)
}
