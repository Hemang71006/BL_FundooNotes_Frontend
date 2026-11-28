import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { loginUser, logoutUser } from '../services/authService'
import { setUnauthorizedHandler } from '../services/apiClient'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../utils/token'
import { AuthContext } from './authContext'

/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Provider
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Centralizes authentication state, session restoration, login and logout behavior.
 */

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.'

function getInitialAuthState() {
  const restoredSession = getAuthSession()
  return {
    session: restoredSession,
    status: restoredSession ? 'authenticated' : 'unauthenticated',
  }
}

function AuthProvider({ children }) {
  const [initialState] = useState(getInitialAuthState)
  const [session, setSession] = useState(initialState.session)
  const [status, setStatus] = useState(initialState.status)
  const [authNotice, setAuthNotice] = useState('')

  const handleUnauthorized = useCallback(() => {
    clearAuthSession()
    setSession(null)
    setStatus('unauthenticated')
    setAuthNotice(SESSION_EXPIRED_MESSAGE)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized)
    return () => setUnauthorizedHandler(null)
  }, [handleUnauthorized])

  const login = useCallback(async (credentials) => {
    setAuthNotice('')
    const response = await loginUser(credentials)
    const nextSession = saveAuthSession(response.data)
    setSession(nextSession)
    setStatus('authenticated')
    return response.data
  }, [])

  const logout = useCallback(async () => {
    const currentSession = getAuthSession()
    let remoteLogoutSucceeded = true

    try {
      if (currentSession) {
        await logoutUser(currentSession.token)
      }
    } catch {
      remoteLogoutSucceeded = false
    } finally {
      clearAuthSession()
      setSession(null)
      setStatus('unauthenticated')
      setAuthNotice('')
    }

    return remoteLogoutSucceeded
  }, [])

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    status,
    authNotice,
    isAuthenticated: status === 'authenticated',
    isRestoring: status === 'restoring',
    login,
    logout,
  }), [authNotice, login, logout, session, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
