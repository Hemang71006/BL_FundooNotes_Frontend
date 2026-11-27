import { useEffect, useState } from 'react'
import NoteList from '../components/NoteList'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'
import NoteModal from '../components/NoteModal'
import {
  archiveNote,
  createNote,
  deleteNote,
  getAllNotes,
  getArchivedNotes,
  getTrashedNotes,
  pinNote,
  restoreNote,
  trashNote,
  unarchiveNote,
  unpinNote,
} from '../services/noteService'
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
  const [activeView, setActiveView] = useState('Notes')

  useEffect(() => {
    let cancelled = false

    async function fetchNotes() {
      setLoading(true)
      setError('')

      try {
        const fetchByView = {
          Notes: getAllNotes,
          Archive: getArchivedNotes,
          Trash: getTrashedNotes,
        }
        const response = await fetchByView[activeView]()
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
  }, [activeView, retryKey])

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
      const fetchByView = {
        Notes: getAllNotes,
        Archive: getArchivedNotes,
        Trash: getTrashedNotes,
      }
      const response = await fetchByView[activeView]()
      setNotes(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (requestError) {
      setError(getApiErrorDetails(requestError).message)
    }
  }

  const handleAction = async (note, actionName) => {
    if (actionName === 'delete' && !window.confirm('Permanently delete this note? This action cannot be undone.')) {
      return
    }

    const actions = {
      pin: pinNote,
      unpin: unpinNote,
      archive: archiveNote,
      unarchive: unarchiveNote,
      trash: trashNote,
      restore: restoreNote,
      delete: deleteNote,
    }

    try {
      await actions[actionName](note.id)
      await refreshNotes()
      const successMessages = {
        pin: 'Note pinned',
        unpin: 'Note unpinned',
        archive: 'Note archived',
        unarchive: 'Note unarchived',
        trash: 'Note moved to trash',
        restore: 'Note restored',
        delete: 'Note permanently deleted',
      }
      setSuccessMessage(successMessages[actionName])
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
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
      <Sidebar activeItem={activeView} onNavigate={setActiveView} />
      <section className="dashboard-content" aria-labelledby="notes-heading">
        <div className="dashboard-heading">
          <div>
            <h1 id="notes-heading">{activeView === 'Notes' ? 'Your Notes' : activeView}</h1>
            <p>
              {activeView === 'Notes'
                ? 'Keep your thoughts organized in one place.'
                : activeView === 'Archive'
                  ? 'Notes you have archived.'
                  : 'Notes you have moved to trash.'}
            </p>
          </div>
          {activeView === 'Notes' && (
            <button type="button" className="create-note-button" onClick={() => setCreating(true)}>
              Create note
            </button>
          )}
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
            <h2>
              {activeView === 'Notes'
                ? 'No notes yet'
                : activeView === 'Archive'
                  ? 'No archived notes'
                  : 'Trash is empty'}
            </h2>
            <p>
              {activeView === 'Notes'
                ? 'Your active notes will appear here when you create them.'
                : activeView === 'Archive'
                  ? 'Archived notes will appear here.'
                  : 'Notes moved to trash will appear here.'}
            </p>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <NoteList
            notes={notes}
            onOpenNote={setOpenNoteId}
            onAction={handleAction}
            view={activeView}
          />
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
