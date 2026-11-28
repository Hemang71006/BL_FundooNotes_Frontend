import { useId, useState } from 'react'
import { getApiErrorDetails } from '../utils/apiError'
import { useSubmitGuard } from '../hooks/useSubmitGuard'
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

function ReminderForm({ reminder, onSave, onCancel, onBusyChange }) {
  const guard = useSubmitGuard()
  const fieldPrefix = useId()
  const initialParts = reminder
    ? formatReminderParts(reminder.reminderAt)
    : { date: '', time: '' }
  const [date, setDate] = useState(initialParts.date === 'Unknown date' ? '' : initialParts.date)
  const [time, setTime] = useState(initialParts.time === 'Unknown time' ? '' : initialParts.time)
  const [savedValueInvalid, setSavedValueInvalid] = useState(
    Boolean(reminder && (initialParts.date === 'Unknown date' || initialParts.time === 'Unknown time')),
  )
  const [fieldErrors, setFieldErrors] = useState({ date: '', time: '' })
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFieldErrors({ date: '', time: '' })
    setApiError('')

    if (saving) return

    if (savedValueInvalid) {
      setFieldErrors({ date: 'Saved reminder time is invalid; choose a new time', time: '' })
      return
    }

    const inputError = validateReminderInput(date, time)
    if (inputError) {
      if (inputError.includes('time')) {
        setFieldErrors({ date: '', time: inputError })
      } else {
        setFieldErrors({ date: inputError, time: '' })
      }
      return
    }

    const requestId = guard.begin()
    if (requestId === null) return

    setSaving(true)
    onBusyChange?.(true)

    try {
      await onSave(`${date}T${time}:00`)
    } catch (requestError) {
      if (!guard.isCurrent(requestId)) return
      const details = getApiErrorDetails(requestError)
      setApiError(details.message || 'Unable to save the reminder.')
      if (details.validationErrors?.reminderAt) {
        setFieldErrors((current) => ({
          ...current,
          date: details.validationErrors.reminderAt,
        }))
      }
    } finally {
      if (guard.isCurrent(requestId)) {
        setSaving(false)
        onBusyChange?.(false)
      }
      guard.end(requestId)
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
                onChange={(event) => {
                  setDate(event.target.value)
                  setSavedValueInvalid(false)
                  setFieldErrors((current) => ({ ...current, date: '' }))
                  setApiError('')
                }}
                disabled={saving}
                aria-invalid={Boolean(fieldErrors.date)}
                aria-describedby={fieldErrors.date ? `${fieldPrefix}-date-error` : undefined}
              />
              {fieldErrors.date && (
                <span id={`${fieldPrefix}-date-error`} className="reminder-form-error">
                  {fieldErrors.date}
                </span>
              )}
            </div>
            <div className="reminder-form-field">
              <label htmlFor={`${fieldPrefix}-time`}>Time</label>
              <input
                id={`${fieldPrefix}-time`}
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value)
                  setSavedValueInvalid(false)
                  setFieldErrors((current) => ({ ...current, time: '' }))
                  setApiError('')
                }}
                disabled={saving}
                aria-invalid={Boolean(fieldErrors.time)}
                aria-describedby={fieldErrors.time ? `${fieldPrefix}-time-error` : undefined}
              />
              {fieldErrors.time && (
                <span id={`${fieldPrefix}-time-error`} className="reminder-form-error">
                  {fieldErrors.time}
                </span>
              )}
            </div>
          </div>

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
