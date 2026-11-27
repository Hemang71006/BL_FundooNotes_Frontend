import { useEffect, useState } from 'react'
import NoteEditor from './NoteEditor'
import ReminderForm from './ReminderForm'
import ReminderItem from './ReminderItem'
import { getApiErrorDetails } from '../utils/apiError'
import { getNoteById, updateNote } from '../services/noteService'
import {
  cancelReminder,
  completeReminder,
  createReminder,
  deleteReminder,
  getNoteReminders,
  updateReminder,
} from '../services/reminderService'

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
  onReminderChanged,
}) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [selectedLabelId, setSelectedLabelId] = useState('')
  const [labelAction, setLabelAction] = useState('')
  const [labelMessage, setLabelMessage] = useState('')
  const [labelError, setLabelError] = useState('')
  const [reminders, setReminders] = useState([])
  const [remindersLoading, setRemindersLoading] = useState(true)
  const [remindersError, setRemindersError] = useState('')
  const [remindersRetryKey, setRemindersRetryKey] = useState(0)
  const [reminderForm, setReminderForm] = useState(null)
  const [reminderMessage, setReminderMessage] = useState('')

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
    let cancelled = false

    async function fetchReminders() {
      setRemindersLoading(true)
      setRemindersError('')

      try {
        const response = await getNoteReminders(noteId)
        if (!cancelled) setReminders(Array.isArray(response.data) ? response.data : [])
      } catch (requestError) {
        if (!cancelled) setRemindersError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setRemindersLoading(false)
      }
    }

    fetchReminders()

    return () => {
      cancelled = true
    }
  }, [noteId, remindersRetryKey])

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

  const notifyReminderChanged = () => {
    setRemindersRetryKey((current) => current + 1)
    onReminderChanged?.()
  }

  const handleReminderSave = async (reminderAt) => {
    if (reminderForm?.reminder) {
      await updateReminder(reminderForm.reminder.id, reminderAt)
      setReminderMessage('Reminder updated')
    } else {
      await createReminder(noteId, reminderAt)
      setReminderMessage('Reminder scheduled')
    }

    setReminderForm(null)
    notifyReminderChanged()
  }

  const handleReminderAction = async (reminder, action) => {
    const actions = {
      cancel: cancelReminder,
      complete: completeReminder,
      delete: deleteReminder,
    }

    await actions[action](reminder.id)
    setReminderMessage(`Reminder ${action === 'delete' ? 'deleted' : action === 'cancel' ? 'cancelled' : 'completed'}`)
    notifyReminderChanged()
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
                {!note?.trashed && (
                  <section className="note-reminder-section" aria-labelledby="note-reminder-heading">
                    <div className="reminder-section-heading">
                      <h3 id="note-reminder-heading">Reminders</h3>
                      <button type="button" onClick={() => setReminderForm({})}>Set reminder</button>
                    </div>
                    {reminderMessage && <p className="label-success" role="status">{reminderMessage}</p>}
                    {remindersLoading && <p className="note-modal-status" role="status">Loading reminders...</p>}
                    {!remindersLoading && remindersError && (
                      <div className="note-modal-error" role="alert">
                        <p>{remindersError}</p>
                        <button type="button" onClick={() => setRemindersRetryKey((current) => current + 1)}>
                          Retry reminders
                        </button>
                      </div>
                    )}
                    {!remindersLoading && !remindersError && reminders.length === 0 && (
                      <p className="note-modal-status">No reminders are set for this note.</p>
                    )}
                    {!remindersLoading && !remindersError && reminders.length > 0 && (
                      <div className="reminder-list">
                        {reminders.map((reminder) => (
                          <ReminderItem
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={(selectedReminder) => setReminderForm({ reminder: selectedReminder })}
                            onAction={handleReminderAction}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
                <div className="note-modal-actions">
                  <button type="button" onClick={() => setEditing(true)}>Edit</button>
                </div>
              </>
            )}
          </>
        )}
        {!editing && reminderForm && (
          <ReminderForm
            reminder={reminderForm.reminder}
            onSave={handleReminderSave}
            onCancel={() => setReminderForm(null)}
          />
        )}
      </section>
    </div>
  )
}

export default NoteModal
