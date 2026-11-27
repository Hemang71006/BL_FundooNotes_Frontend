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

function NoteModal({
  noteId,
  onClose,
  onUpdated,
  labels = [],
  labelsLoading = false,
  labelsError = '',
  onRetryLabels,
  onLabelAction,
}) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [selectedLabelId, setSelectedLabelId] = useState('')
  const [labelAction, setLabelAction] = useState('')
  const [labelMessage, setLabelMessage] = useState('')
  const [labelError, setLabelError] = useState('')

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

  const handleLabelAction = async (action) => {
    if (!selectedLabelId || labelAction) return

    setLabelAction(action)
    setLabelMessage('')
    setLabelError('')
    try {
      await onLabelAction(noteId, Number(selectedLabelId), action)
      setLabelMessage(action === 'assign'
        ? 'Label assignment request completed.'
        : 'Label removal request completed.')
    } catch (requestError) {
      setLabelError(requestError.message || 'Unable to update the note label.')
    } finally {
      setLabelAction('')
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
                {!note?.trashed && (
                  <section className="note-label-controls" aria-labelledby="note-label-heading">
                    <h3 id="note-label-heading">Labels</h3>
                    <p className="note-label-limitation">
                      This API does not return the labels already assigned to a note. Choose a label to send an add or remove request; assignment status cannot be displayed here.
                    </p>
                    {labelsLoading ? (
                      <p className="note-modal-status" role="status">Loading available labels...</p>
                    ) : labelsError ? (
                      <div className="note-modal-error" role="alert">
                        <p>{labelsError}</p>
                        <button type="button" onClick={onRetryLabels}>Retry labels</button>
                      </div>
                    ) : labels.length === 0 ? (
                      <p className="note-modal-status">Create a label before assigning one to this note.</p>
                    ) : (
                      <>
                        <label htmlFor="note-label-select">Choose a label</label>
                        <select
                          id="note-label-select"
                          value={selectedLabelId}
                          onChange={(event) => setSelectedLabelId(event.target.value)}
                        >
                          <option value="">Select a label</option>
                          {labels.map((label) => (
                            <option key={label.id} value={label.id}>{label.name}</option>
                          ))}
                        </select>
                        <div className="note-modal-actions">
                          <button
                            type="button"
                            onClick={() => handleLabelAction('assign')}
                            disabled={!selectedLabelId || Boolean(labelAction)}
                          >
                            {labelAction === 'assign' ? 'Adding...' : 'Assign label'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLabelAction('remove')}
                            disabled={!selectedLabelId || Boolean(labelAction)}
                          >
                            {labelAction === 'remove' ? 'Removing...' : 'Remove label'}
                          </button>
                        </div>
                      </>
                    )}
                    {labelMessage && <p className="label-success" role="status">{labelMessage}</p>}
                    {labelError && <p className="label-error" role="alert">{labelError}</p>}
                  </section>
                )}
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
