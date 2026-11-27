import { useId, useState } from 'react'
import { getApiErrorDetails } from '../utils/apiError'
import {
  formatReminderParts,
  getKolkataNowValue,
  validateReminderInput,
} from '../utils/reminderTime'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reminder Form
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Collects a future Asia/Kolkata date and time for reminder creation or update.
 */

function ReminderForm({ reminder, onSave, onCancel }) {
  const initialParts = reminder
    ? formatReminderParts(reminder.reminderAt)
    : { date: '', time: '' }
  const [date, setDate] = useState(initialParts.date === 'Unknown date' ? '' : initialParts.date)
  const [time, setTime] = useState(initialParts.time === 'Unknown time' ? '' : initialParts.time)
  const [validationError, setValidationError] = useState('')
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const fieldPrefix = useId()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')
    setApiError('')

    if (saving) return

    const inputError = validateReminderInput(date, time)
    if (inputError) {
      setValidationError(inputError)
      return
    }

    setSaving(true)
    try {
      await onSave(`${date}T${time}:00`)
    } catch (requestError) {
      const details = getApiErrorDetails(requestError)
      const fieldError = details.validationErrors?.reminderAt
      setApiError(
        (Array.isArray(fieldError) ? fieldError.join(' ') : fieldError)
        || details.message
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="reminder-form-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onCancel()
    }}>
      <section
        className="reminder-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldPrefix}-title`}
      >
        <div className="note-modal-heading">
          <h2 id={`${fieldPrefix}-title`}>{reminder ? 'Edit reminder' : 'Set reminder'}</h2>
          <button type="button" className="modal-close" onClick={onCancel} disabled={saving}>
            Close
          </button>
        </div>

        <p className="note-label-limitation">
          Date and time are interpreted in Asia/Kolkata. The backend rejects past values.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="reminder-form-row">
            <div className="reminder-form-field">
              <label htmlFor={`${fieldPrefix}-date`}>Date</label>
              <input
                id={`${fieldPrefix}-date`}
                type="date"
                value={date}
                min={getKolkataNowValue().slice(0, 10)}
                onChange={(event) => setDate(event.target.value)}
                disabled={saving}
                aria-invalid={Boolean(validationError)}
              />
            </div>
            <div className="reminder-form-field">
              <label htmlFor={`${fieldPrefix}-time`}>Time</label>
              <input
                id={`${fieldPrefix}-time`}
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={saving}
                aria-invalid={Boolean(validationError)}
              />
            </div>
          </div>

          {validationError && <p className="reminder-form-error" role="alert">{validationError}</p>}
          {apiError && <p className="reminder-form-error" role="alert">{apiError}</p>}

          <div className="note-editor-actions">
            <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className="label-primary-button" disabled={saving}>
              {saving ? 'Saving...' : reminder ? 'Save reminder' : 'Set reminder'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ReminderForm
