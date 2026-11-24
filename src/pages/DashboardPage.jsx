import { useEffect, useState } from 'react'
import NoteList from '../components/NoteList'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'
import NoteModal from '../components/NoteModal'
import { createNote, getAllNotes } from '../services/noteService'
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
  const [creating, setCreating] = useState(false)
  const [openNoteId, setOpenNoteId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

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

  useEffect(() => {
    if (!creating) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setCreating(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [creating])

  const handleRetry = () => {
    setRetryKey((current) => current + 1)
  }

  const refreshNotes = async () => {
    try {
      const response = await getAllNotes()
      setNotes(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (requestError) {
      setError(getApiErrorDetails(requestError).message)
    }
  }

  const handleCreate = async (noteData) => {
    try {
      await createNote(noteData)
      setCreating(false)
      setSuccessMessage('Note created successfully')
      await refreshNotes()
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  const handleUpdated = async () => {
    setSuccessMessage('Note updated successfully')
    await refreshNotes()
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
          <button type="button" className="create-note-button" onClick={() => setCreating(true)}>
            Create note
          </button>
        </div>

        {successMessage && (
          <p className="dashboard-success" role="status">{successMessage}</p>
        )}

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

        {!loading && !error && notes.length > 0 && (
          <NoteList notes={notes} onOpenNote={setOpenNoteId} />
        )}
      </section>

      {creating && (
        <div className="note-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCreating(false)
        }}>
          <section className="note-modal" role="dialog" aria-modal="true" aria-label="Create note">
            <NoteEditor mode="create" onSave={handleCreate} onCancel={() => setCreating(false)} />
          </section>
        </div>
      )}

      {openNoteId !== null && (
        <NoteModal
          noteId={openNoteId}
          onClose={() => setOpenNoteId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}

export default DashboardPage
