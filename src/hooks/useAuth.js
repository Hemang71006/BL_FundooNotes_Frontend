import { useContext } from 'react'
import { AuthContext } from '../context/authContext'

/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Hook
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides authenticated components access to the shared authentication state.
 */

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
