import { useState } from 'react'
import { getApiErrorDetails } from '../utils/apiError'
import { useSubmitGuard } from '../hooks/useSubmitGuard'

/*
 * Project: Fundoo Notes Frontend
 * Module: Note Editor
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides validated create and edit forms for notes.
 */

const TITLE_LIMIT = 255
const DESCRIPTION_LIMIT = 5000

function NoteEditor({ mode = 'create', note, onSave, onCancel, onBusyChange }) {
  const guard = useSubmitGuard()
  const [title, setTitle] = useState(mode === 'edit' ? note?.title || '' : '')
  const [description, setDescription] = useState(mode === 'edit' ? note?.description || '' : '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const nextErrors = {}

    if (!title.trim()) {
      nextErrors.title = 'Note title is required'
    } else if (title.length > TITLE_LIMIT) {
      nextErrors.title = 'Title cannot exceed 255 characters'
    }

    if (description.length > DESCRIPTION_LIMIT) {
      nextErrors.description = 'Description cannot exceed 5000 characters'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError('')

    if (!validate() || saving) return

    const requestId = guard.begin()
    if (requestId === null) return

    setSaving(true)
    onBusyChange?.(true)

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
      })
    } catch (error) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(error)
      setApiError(details.message)
      setErrors((current) => ({
        ...current,
        ...details.validationErrors,
      }))
    } finally {
      if (guard.isCurrent(requestId)) {
        setSaving(false)
        onBusyChange?.(false)
      }
      guard.end(requestId)
    }
  }

  return (
    <form className="note-editor" onSubmit={handleSubmit} noValidate>
      <div className="note-editor-heading">
        <h2>{mode === 'edit' ? 'Edit note' : 'Create note'}</h2>
        <button
          type="button"
          className="modal-close"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close editor"
        >
          Close
        </button>
      </div>

      <div className="note-editor-field">
        <label htmlFor="note-title">Title</label>
        <input
          id="note-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setErrors((current) => ({ ...current, title: '' }))
            setApiError('')
          }}
          maxLength={TITLE_LIMIT}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'note-title-error' : undefined}
          placeholder="Note title"
          autoFocus
        />
        {errors.title && <span id="note-title-error" className="note-editor-error">{errors.title}</span>}
        <span className="field-count">{title.length}/{TITLE_LIMIT}</span>
      </div>

      <div className="note-editor-field">
        <label htmlFor="note-description">Description</label>
        <textarea
          id="note-description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value)
            setErrors((current) => ({ ...current, description: '' }))
            setApiError('')
          }}
          maxLength={DESCRIPTION_LIMIT}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'note-description-error' : undefined}
          placeholder="Add a description"
          rows={8}
        />
        {errors.description && (
          <span id="note-description-error" className="note-editor-error">{errors.description}</span>
        )}
        <span className="field-count">{description.length}/{DESCRIPTION_LIMIT}</span>
      </div>

      {apiError && <p className="note-editor-api-error" role="alert">{apiError}</p>}

      <div className="note-editor-actions">
        <button type="button" className="note-editor-cancel" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="note-editor-save" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default NoteEditor
