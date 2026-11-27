import { useEffect, useMemo, useState } from 'react'
import ReminderForm from '../components/ReminderForm'
import ReminderItem from '../components/ReminderItem'
import {
  cancelReminder,
  completeReminder,
  deleteReminder,
  getAllReminders,
  getUpcomingReminders,
  updateReminder,
} from '../services/reminderService'
import { getApiErrorDetails } from '../utils/apiError'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reminders Page
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Displays the authenticated user's persisted reminders grouped by real backend status.
 */

function RemindersPage({ refreshKey = 0, onOpenNote }) {
  const [reminders, setReminders] = useState([])
  const [upcomingIds, setUpcomingIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [editingReminder, setEditingReminder] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchReminders() {
      setLoading(true)
      setError('')

      try {
        const [allResponse, upcomingResponse] = await Promise.all([
          getAllReminders(),
          getUpcomingReminders(),
        ])

        if (!cancelled) {
          setReminders(Array.isArray(allResponse.data) ? allResponse.data : [])
          const upcoming = Array.isArray(upcomingResponse.data) ? upcomingResponse.data : []
          setUpcomingIds(new Set(upcoming.map((reminder) => reminder.id)))
        }
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReminders()

    return () => {
      cancelled = true
    }
  }, [retryKey, refreshKey])

  const sections = useMemo(() => {
    const grouped = {
      Upcoming: [],
      Overdue: [],
      Completed: [],
      Delivered: [],
      'Cancelled or failed': [],
    }

    reminders.forEach((reminder) => {
      if (upcomingIds.has(reminder.id)) {
        grouped.Upcoming.push(reminder)
      } else if (reminder.status === 'COMPLETED') {
        grouped.Completed.push(reminder)
      } else if (reminder.status === 'SENT') {
        grouped.Delivered.push(reminder)
      } else if (reminder.status === 'CANCELLED' || reminder.status === 'FAILED') {
        grouped['Cancelled or failed'].push(reminder)
      } else {
        grouped.Overdue.push(reminder)
      }
    })

    return Object.entries(grouped)
  }, [reminders, upcomingIds])

  const handleAction = async (reminder, action) => {
    const actions = {
      cancel: cancelReminder,
      complete: completeReminder,
      delete: deleteReminder,
    }

    try {
      await actions[action](reminder.id)
      setMessage(`Reminder ${action === 'delete' ? 'deleted' : action === 'cancel' ? 'cancelled' : 'completed'}`)
      setRetryKey((current) => current + 1)
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, { cause: requestError })
    }
  }

  const handleUpdate = async (reminderAt) => {
    await updateReminder(editingReminder.id, reminderAt)
    setEditingReminder(null)
    setMessage('Reminder updated')
    setRetryKey((current) => current + 1)
  }

  return (
    <div className="reminders-view">
      {message && <p className="dashboard-success" role="status">{message}</p>}

      {loading && <p className="dashboard-status" role="status">Loading your reminders...</p>}

      {!loading && error && (
        <div className="dashboard-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button>
        </div>
      )}

      {!loading && !error && reminders.length === 0 && (
        <div className="dashboard-empty">
          <h2>No reminders yet</h2>
          <p>Open a note and choose Set Reminder to schedule one with the backend.</p>
        </div>
      )}

      {!loading && !error && reminders.length > 0 && sections.map(([label, items]) => (
        items.length > 0 && (
          <section className="reminder-section" key={label} aria-labelledby={`reminder-section-${label.replace(/\s/g, '-')}`}>
            <h2 id={`reminder-section-${label.replace(/\s/g, '-')}`}>{label}</h2>
            <div className="reminder-list">
              {items.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={setEditingReminder}
                  onAction={handleAction}
                  onOpenNote={onOpenNote}
                />
              ))}
            </div>
          </section>
        )
      ))}

      {editingReminder && (
        <ReminderForm
          reminder={editingReminder}
          onSave={handleUpdate}
          onCancel={() => setEditingReminder(null)}
        />
      )}
    </div>
  )
}

export default RemindersPage
