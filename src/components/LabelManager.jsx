import { useState } from 'react'
import { getApiErrorDetails } from '../utils/apiError'
import { useSubmitGuard } from '../hooks/useSubmitGuard'

/*
 * Project: Fundoo Notes Frontend
 * Module: Label Manager
 * Author: Hemang
 * Date: 27-11-2026
 * Description: Provides validated label creation, editing, and deletion controls.
 */

const LABEL_NAME_LIMIT = 50
const LABEL_COLOR_LIMIT = 7

function LabelManager({ labels, loading, error, onRetry, onCreate, onUpdate, onDelete, onClose }) {
  const guard = useSubmitGuard()
  const [editingLabel, setEditingLabel] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ name: '', color: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [pending, setPending] = useState(false)
  const [deletingLabelId, setDeletingLabelId] = useState(null)

  const resetForm = () => {
    setEditingLabel(null)
    setName('')
    setColor('')
    setFieldErrors({ name: '', color: '' })
    setFormError('')
    setFormSuccess('')
  }

  const startEditing = (label) => {
    setEditingLabel(label)
    setName(label.name)
    setColor(label.color || '')
    setFieldErrors({ name: '', color: '' })
    setFormError('')
    setFormSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (pending) return

    const nextErrors = { name: '', color: '' }
    if (!name.trim()) {
      nextErrors.name = 'Label name is required.'
    } else if (name.trim().length > LABEL_NAME_LIMIT) {
      nextErrors.name = 'Label name cannot exceed 50 characters.'
    }
    if (color.length > LABEL_COLOR_LIMIT) {
      nextErrors.color = 'Label color cannot exceed 7 characters.'
    }

    setFieldErrors(nextErrors)
    setFormError('')
    setFormSuccess('')

    if (nextErrors.name || nextErrors.color) return

    const requestId = guard.begin()
    if (requestId === null) return

    const wasEditing = Boolean(editingLabel)
    setPending(true)

    try {
      const labelData = {
        name: name.trim(),
        color: color.trim() || null,
      }

      if (editingLabel) {
        await onUpdate(editingLabel.id, labelData)
      } else {
        await onCreate(labelData)
      }

      if (!guard.isCurrent(requestId)) return
      resetForm()
      setFormSuccess(wasEditing ? 'Label updated.' : 'Label created.')
    } catch (requestError) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(requestError)
      setFormError(details.message || 'Unable to save the label.')
      setFieldErrors({
        name: details.validationErrors?.name || '',
        color: details.validationErrors?.color || '',
      })
    } finally {
      if (guard.isCurrent(requestId)) setPending(false)
      guard.end(requestId)
    }
  }

  const handleDelete = async (label) => {
    if (pending) return
    if (!window.confirm(`Delete the label "${label.name}"?`)) return

    const requestId = guard.begin()
    if (requestId === null) return

    setPending(true)
    setDeletingLabelId(label.id)
    setFieldErrors({ name: '', color: '' })
    setFormError('')
    setFormSuccess('')

    try {
      await onDelete(label.id)
      if (!guard.isCurrent(requestId)) return
      if (editingLabel?.id === label.id) resetForm()
      setFormSuccess('Label deleted.')
    } catch (requestError) {
      if (!guard.isCurrent(requestId)) return
      setFormError(getApiErrorDetails(requestError).message || 'Unable to delete the label.')
    } finally {
      if (guard.isCurrent(requestId)) {
        setPending(false)
        setDeletingLabelId(null)
      }
      guard.end(requestId)
    }
  }

  return (
    <div className="label-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) onClose()
    }}>
      <section className="label-manager" role="dialog" aria-modal="true" aria-labelledby="label-manager-title">
        <div className="label-manager-heading">
          <div>
            <h2 id="label-manager-title">Manage labels</h2>
            <p>Create, rename, or remove your labels.</p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close label manager"
          >
            Close
          </button>
        </div>

        <form className="label-form" onSubmit={handleSubmit} noValidate>
          <div className="label-form-field">
            <label htmlFor="label-name">Label name</label>
            <input
              id="label-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFieldErrors((current) => ({ ...current, name: '' }))
                setFormError('')
                setFormSuccess('')
              }}
              maxLength={LABEL_NAME_LIMIT}
              placeholder="For example, Personal"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'label-name-error' : undefined}
            />
            {fieldErrors.name && <span id="label-name-error" className="label-error">{fieldErrors.name}</span>}
            <span className="field-count">{name.length}/{LABEL_NAME_LIMIT}</span>
          </div>
          <div className="label-form-field">
            <label htmlFor="label-color">Color (optional)</label>
            <input
              id="label-color"
              value={color}
              onChange={(event) => {
                setColor(event.target.value)
                setFieldErrors((current) => ({ ...current, color: '' }))
                setFormError('')
                setFormSuccess('')
              }}
              maxLength={LABEL_COLOR_LIMIT}
              placeholder="#F4B400"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.color)}
              aria-describedby={fieldErrors.color ? 'label-color-error' : 'label-color-help'}
            />
            {fieldErrors.color && <span id="label-color-error" className="label-error">{fieldErrors.color}</span>}
            <span id="label-color-help" className="label-help">Backend accepts an optional color value up to 7 characters.</span>
          </div>
          {formError && <p className="label-error" role="alert">{formError}</p>}
          {formSuccess && !formError && !error && (
            <p className="label-success" role="status">{formSuccess}</p>
          )}
          <div className="label-form-actions">
            {editingLabel && (
              <button type="button" className="label-secondary-button" onClick={resetForm} disabled={pending}>
                Cancel edit
              </button>
            )}
            <button type="submit" className="label-primary-button" disabled={pending}>
              {pending && !deletingLabelId ? 'Saving...' : editingLabel ? 'Save changes' : 'Create label'}
            </button>
          </div>
        </form>

        <div className="label-list-heading">
          <h3>Your labels</h3>
          {loading && <span role="status">Loading...</span>}
        </div>
        {error && (
          <div className="label-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRetry} disabled={loading}>Retry</button>
          </div>
        )}
        {!loading && !error && labels.length === 0 && (
          <p className="label-empty">You have not created any labels yet.</p>
        )}
        {!loading && !error && labels.length > 0 && (
          <ul className="managed-label-list" aria-busy={pending}>
            {labels.map((label) => (
              <li key={label.id}>
                <span className="managed-label-name">{label.name}</span>
                {label.color && <span className="managed-label-color">{label.color}</span>}
                <button
                  type="button"
                  onClick={() => startEditing(label)}
                  disabled={pending}
                  aria-label={`Edit ${label.name}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="label-delete-button"
                  onClick={() => handleDelete(label)}
                  disabled={pending}
                  aria-label={`Delete ${label.name}`}
                >
                  {deletingLabelId === label.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default LabelManager
