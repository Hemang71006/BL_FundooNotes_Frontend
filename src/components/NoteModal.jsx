import { useEffect, useState } from 'react'
import NoteEditor from './NoteEditor'
import { getApiErrorDetails } from '../utils/apiError'
import { getNoteById, updateNote } from '../services/noteService'

/*
 * Project: Fundoo Notes Frontend
 * Module: Note Modal
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays fetched note details and switches to the edit interface.
 */

function NoteModal({ noteId, onClose, onUpdated }) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchNote() {
      setLoading(true)
      setError('')

      try {
        const response = await getNoteById(noteId)
        if (!cancelled) setNote(response.data)
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNote()

    return () => {
      cancelled = true
    }
  }, [noteId])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleUpdate = async (noteData) => {
    try {
      const response = await updateNote(noteId, noteData)
      setNote(response.data)
      setEditing(false)
      onUpdated(response.data)
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  return (
    <div className="note-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="note-modal" role="dialog" aria-modal="true" aria-labelledby="note-modal-title">
        {editing ? (
          <NoteEditor mode="edit" note={note} onSave={handleUpdate} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <div className="note-modal-heading">
              <h2 id="note-modal-title">{loading ? 'Loading note...' : note?.title?.trim() || 'Untitled note'}</h2>
              <button type="button" className="modal-close" onClick={onClose} aria-label="Close note">
                Close
              </button>
            </div>
            {loading && <p className="note-modal-status" role="status">Fetching latest note...</p>}
            {!loading && error && <p className="note-modal-error" role="alert">{error}</p>}
            {!loading && !error && (
              <>
                <p className="note-modal-description">
                  {note?.description?.trim() || 'No description'}
                </p>
                <div className="note-modal-actions">
                  <button type="button" onClick={() => setEditing(true)}>Edit</button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default NoteModal
