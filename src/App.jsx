
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import './App.css'

/*
 * Project: Fundoo Notes Frontend
 * Module: App
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Main application component demonstrating React fundamentals.
 */

function App() {
  const { isAuthenticated, isRestoring, logout } = useAuth()
  const [authView, setAuthView] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.title = 'Fundoo Notes'
  }, [])

  const handleLogout = async () => {
    await logout()
    setSearchQuery('')
    setAuthView('login')
  }

  if (authView === 'login') {
    return <LoginPage onNavigate={setAuthView} />
  }

  if (authView === 'register') {
    return <RegisterPage onNavigate={setAuthView} />
  }

  if (authView === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={setAuthView} />
  }

  if (authView === 'reset-password') {
    return <ResetPasswordPage onNavigate={setAuthView} />
  }

  return (
    <ProtectedRoute
      onUnauthenticated={() => {
        if (!isRestoring) setAuthView('login')
      }}
    >
      <div className="app-container">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          authActions={isAuthenticated ? {
            onLogout: handleLogout,
          } : {
            onLogin: () => setAuthView('login'),
            onRegister: () => setAuthView('register'),
          }}
        />
        <DashboardPage searchQuery={searchQuery} />
      </div>
    </ProtectedRoute>
  )
}

export default App
