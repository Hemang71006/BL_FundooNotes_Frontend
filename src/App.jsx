
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import NoteList from './components/NoteList'
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

const initialNotes = [
  {
    id: 1,
    title: 'Welcome to Fundoo Notes',
    description: 'This is your personal space to capture ideas and important thoughts.',
    pinned: true,
    date: '24 Nov 2026',
  },
  {
    id: 2,
    title: 'Learn React',
    description: 'Understand components, JSX, props, state and React hooks.',
    pinned: false,
    date: '24 Nov 2026',
  },
  {
    id: 3,
    title: 'Project Tasks',
    description: 'Build authentication, dashboard and note management features.',
    pinned: false,
    date: '24 Nov 2026',
  },
]

function App() {
  const [notes, setNotes] = useState(initialNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [authView, setAuthView] = useState(null)

  useEffect(() => {
    document.title = 'Fundoo Notes'
  }, [])

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase()

    return (
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query)
    )
  })

  const handleTogglePin = (noteId) => {
    setNotes((previousNotes) =>
      previousNotes.map((note) =>
        note.id === noteId
          ? { ...note, pinned: !note.pinned }
          : note
      )
    )
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
    <div className="app-container">
      <Navbar
        authActions={{
          onLogin: () => setAuthView('login'),
          onRegister: () => setAuthView('register'),
        }}
      />

      <main className="main-content">
        <section className="welcome-section">
          <h1>Your Notes</h1>
          <p>Organize your thoughts in one place.</p>
        </section>

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <section className="notes-section">
          <h2>All Notes ({filteredNotes.length})</h2>

          <NoteList
            notes={filteredNotes}
            onTogglePin={handleTogglePin}
          />
        </section>
      </main>
    </div>
  )
}

export default App
