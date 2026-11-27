import { useState } from 'react'

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
  const [editingLabel, setEditingLabel] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [pending, setPending] = useState(false)

  const resetForm = () => {
    setEditingLabel(null)
    setName('')
    setColor('')
    setFormError('')
    setFormSuccess('')
  }

  const startEditing = (label) => {
    setEditingLabel(label)
    setName(label.name)
    setColor(label.color || '')
    setFormError('')
    setFormSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!name.trim()) {
      setFormError('Label name is required.')
      return
    }

    if (name.trim().length > LABEL_NAME_LIMIT) {
      setFormError('Label name cannot exceed 50 characters.')
      return
    }

    if (color.length > LABEL_COLOR_LIMIT) {
      setFormError('Label color cannot exceed 7 characters.')
      return
    }

    setPending(true)
    try {
      const labelData = {
        name: name.trim(),
        color: color.trim() || null,
      }

      if (editingLabel) {
        await onUpdate(editingLabel.id, labelData)
        setFormSuccess('Label updated.')
      } else {
        await onCreate(labelData)
        setFormSuccess('Label created.')
      }

      resetForm()
      setFormSuccess(editingLabel ? 'Label updated.' : 'Label created.')
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to save the label.')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async (label) => {
    if (!window.confirm(`Delete the label "${label.name}"?`)) return

    setPending(true)
    setFormError('')
    setFormSuccess('')
    try {
      await onDelete(label.id)
      if (editingLabel?.id === label.id) resetForm()
      setFormSuccess('Label deleted.')
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to delete the label.')
    } finally {
      setPending(false)
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
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close label manager">
            Close
          </button>
        </div>

        <form className="label-form" onSubmit={handleSubmit} noValidate>
          <div className="label-form-field">
            <label htmlFor="label-name">Label name</label>
            <input
              id="label-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={LABEL_NAME_LIMIT}
              placeholder="For example, Personal"
              aria-invalid={Boolean(formError)}
            />
            <span className="field-count">{name.length}/{LABEL_NAME_LIMIT}</span>
          </div>
          <div className="label-form-field">
            <label htmlFor="label-color">Color (optional)</label>
            <input
              id="label-color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              maxLength={LABEL_COLOR_LIMIT}
              placeholder="#F4B400"
              aria-describedby="label-color-help"
            />
            <span id="label-color-help" className="label-help">Backend accepts an optional color value up to 7 characters.</span>
          </div>
          {formError && <p className="label-error" role="alert">{formError}</p>}
          {formSuccess && <p className="label-success" role="status">{formSuccess}</p>}
          <div className="label-form-actions">
            {editingLabel && (
              <button type="button" className="label-secondary-button" onClick={resetForm} disabled={pending}>
                Cancel edit
              </button>
            )}
            <button type="submit" className="label-primary-button" disabled={pending}>
              {pending ? 'Saving...' : editingLabel ? 'Save changes' : 'Create label'}
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
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        )}
        {!loading && !error && labels.length === 0 && (
          <p className="label-empty">You have not created any labels yet.</p>
        )}
        {!loading && !error && labels.length > 0 && (
          <ul className="managed-label-list">
            {labels.map((label) => (
              <li key={label.id}>
                <span className="managed-label-name">{label.name}</span>
                {label.color && <span className="managed-label-color">{label.color}</span>}
                <button type="button" onClick={() => startEditing(label)} disabled={pending} aria-label={`Edit ${label.name}`}>
                  Edit
                </button>
                <button type="button" className="label-delete-button" onClick={() => handleDelete(label)} disabled={pending} aria-label={`Delete ${label.name}`}>
                  Delete
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
