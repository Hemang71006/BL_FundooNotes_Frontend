import { useState } from 'react'
import { getApiErrorDetails } from '../utils/apiError'
import { formatReminderParts } from '../utils/reminderTime'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reminder Item
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Displays one backend reminder with only the actions allowed for its status.
 */

const EDITABLE_STATUSES = ['PENDING', 'FAILED']

function ReminderItem({ reminder, onEdit, onAction, onOpenNote }) {
  const [pendingAction, setPendingAction] = useState('')
  const [actionError, setActionError] = useState('')
  const { date, time } = formatReminderParts(reminder.reminderAt)
  const editable = EDITABLE_STATUSES.includes(reminder.status)

  const performAction = async (action) => {
    if (pendingAction) return

    if (action === 'delete' && !window.confirm('Delete this reminder? This action cannot be undone.')) {
      return
    }

    setPendingAction(action)
    setActionError('')
    try {
      await onAction(reminder, action)
    } catch (requestError) {
      setActionError(getApiErrorDetails(requestError).message)
    } finally {
      setPendingAction('')
    }
  }

  return (
    <article className="reminder-card">
      <div className="reminder-card-heading">
        <h3>{reminder.noteTitle?.trim() || `Note #${reminder.noteId}`}</h3>
        <span className={`reminder-status status-${String(reminder.status).toLowerCase()}`}>
          {reminder.status}
        </span>
      </div>

      <p className="reminder-meta">
        <span>{date}</span>
        <span>{time} Asia/Kolkata</span>
        <span>Note #{reminder.noteId}</span>
      </p>
      {reminder.retryCount > 0 && (
        <p className="reminder-retry">Delivery attempts: {reminder.retryCount}</p>
      )}

      <div className="reminder-actions" aria-label={`Actions for reminder ${reminder.id}`}>
        {editable && (
          <>
            <button type="button" onClick={() => onEdit(reminder)} disabled={Boolean(pendingAction)}>
              Edit
            </button>
            <button
              type="button"
              onClick={() => performAction('cancel')}
              disabled={Boolean(pendingAction)}
            >
              {pendingAction === 'cancel' ? 'Cancelling...' : 'Cancel reminder'}
            </button>
            <button
              type="button"
              onClick={() => performAction('complete')}
              disabled={Boolean(pendingAction)}
            >
              {pendingAction === 'complete' ? 'Completing...' : 'Mark complete'}
            </button>
          </>
        )}
        <button
          type="button"
          className="reminder-delete-action"
          onClick={() => performAction('delete')}
          disabled={Boolean(pendingAction)}
        >
          {pendingAction === 'delete' ? 'Deleting...' : 'Delete'}
        </button>
        {onOpenNote && (
          <button type="button" onClick={() => onOpenNote(reminder.noteId)} disabled={Boolean(pendingAction)}>
            Open note
          </button>
        )}
      </div>
      {actionError && <p className="reminder-action-error" role="alert">{actionError}</p>}
    </article>
  )
}

export default ReminderItem
