import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

/*
 * Project: Fundoo Notes Frontend
 * Module: Protected Route
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Guards authenticated application content while restoring or redirecting sessions.
 */

function ProtectedRoute({ children, onUnauthenticated }) {
  const { isAuthenticated, isRestoring } = useAuth()

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      onUnauthenticated()
    }
  }, [isAuthenticated, isRestoring, onUnauthenticated])

  if (isRestoring) {
    return <p className="auth-loading" role="status">Restoring your session...</p>
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}

export default ProtectedRoute
