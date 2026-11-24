import { useEffect, useState } from 'react'
import NoteList from '../components/NoteList'
import Sidebar from '../components/Sidebar'
import { getAllNotes } from '../services/noteService'
import { getApiErrorDetails } from '../utils/apiError'

/*
 * Project: Fundoo Notes Frontend
 * Module: Dashboard Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Fetches and displays the authenticated user's active notes.
 */

function DashboardPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchNotes() {
      setLoading(true)
      setError('')

      try {
        const response = await getAllNotes()
        if (!cancelled) setNotes(Array.isArray(response.data) ? response.data : [])
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNotes()

    return () => {
      cancelled = true
    }
  }, [retryKey])

  const handleRetry = () => {
    setRetryKey((current) => current + 1)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-content" aria-labelledby="notes-heading">
        <div className="dashboard-heading">
          <div>
            <h1 id="notes-heading">Your Notes</h1>
            <p>Keep your thoughts organized in one place.</p>
          </div>
        </div>

        {loading && (
          <p className="dashboard-status" role="status">Loading your notes...</p>
        )}

        {!loading && error && (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>Try again</button>
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="dashboard-empty">
            <h2>No notes yet</h2>
            <p>Your active notes will appear here when you create them.</p>
          </div>
        )}

        {!loading && !error && notes.length > 0 && <NoteList notes={notes} />}
      </section>
    </div>
  )
}

export default DashboardPage
