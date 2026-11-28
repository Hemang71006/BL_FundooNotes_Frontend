import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useSubmitGuard } from '../hooks/useSubmitGuard'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reminders Page
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Displays the authenticated user's persisted reminders grouped by real backend status.
 */

function RemindersPage({ refreshKey = 0, onOpenNote }) {
  const guard = useSubmitGuard()
  const initialLoadRef = useRef(true)
  const [reminders, setReminders] = useState([])
  const [upcomingIds, setUpcomingIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [editingReminder, setEditingReminder] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const isInitialLoad = initialLoadRef.current
    initialLoadRef.current = false

    async function fetchReminders() {
      setError('')
      if (isInitialLoad) setLoading(true)
      else setRefreshing(true)

      try {
        const [allResponse, upcomingResponse] = await Promise.all([
          getAllReminders(),
          getUpcomingReminders(),
        ])

        if (!Array.isArray(allResponse.data) || !Array.isArray(upcomingResponse.data)) {
          throw new Error('The backend returned an unexpected reminders response.')
        }

        if (!cancelled) {
          setReminders(allResponse.data)
          setUpcomingIds(new Set(upcomingResponse.data.map((reminder) => reminder.id)))
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorDetails(requestError).message)
          setMessage('')
        }
      } finally {
        if (!cancelled) {
          if (isInitialLoad) setLoading(false)
          else setRefreshing(false)
        }
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
      Sent: [],
      'Cancelled or failed': [],
    }

    reminders.forEach((reminder) => {
      if (upcomingIds.has(reminder.id)) {
        grouped.Upcoming.push(reminder)
      } else if (reminder.status === 'COMPLETED') {
        grouped.Completed.push(reminder)
      } else if (reminder.status === 'SENT') {
        grouped.Sent.push(reminder)
      } else if (reminder.status === 'CANCELLED' || reminder.status === 'FAILED') {
        grouped['Cancelled or failed'].push(reminder)
      } else {
        grouped.Overdue.push(reminder)
      }
    })

    return Object.entries(grouped)
  }, [reminders, upcomingIds])

  const handleAction = async (reminder, action) => {
    const requestId = guard.begin()
    if (requestId === null) return

    const actions = {
      cancel: cancelReminder,
      complete: completeReminder,
      delete: deleteReminder,
    }

    setMessage('')

    try {
      await actions[action](reminder.id)
      if (!guard.isCurrent(requestId)) return
      setMessage(`Reminder ${action === 'delete' ? 'deleted' : action === 'cancel' ? 'cancelled' : 'completed'}`)
      setRetryKey((current) => current + 1)
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, { cause: requestError })
    } finally {
      guard.end(requestId)
    }
  }

  const handleUpdate = async (reminderAt) => {
    if (!editingReminder) return

    const requestId = guard.begin()
    if (requestId === null) return

    setMessage('')

    try {
      await updateReminder(editingReminder.id, reminderAt)
      if (!guard.isCurrent(requestId)) return
      setEditingReminder(null)
      setMessage('Reminder updated')
      setRetryKey((current) => current + 1)
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, { cause: requestError })
    } finally {
      guard.end(requestId)
    }
  }

  return (
    <div className="reminders-view">
      {message && !error && <p className="dashboard-success" role="status">{message}</p>}
      {refreshing && <p className="dashboard-status" role="status">Refreshing reminders...</p>}

      {loading && <p className="dashboard-status" role="status">Loading your reminders...</p>}

      {!loading && !refreshing && error && (
        <div className="dashboard-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            disabled={refreshing}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && reminders.length === 0 && (
        <div className="dashboard-empty">
          <h2>No reminders yet</h2>
          <p>Open a note and choose Set Reminder to schedule one with the backend.</p>
        </div>
      )}

      {!loading && !error && reminders.length > 0 && sections.map(([label, items]) => {
        if (label === 'Upcoming' && items.length === 0) {
          return (
            <section className="reminder-section" key={label} aria-labelledby={`reminder-section-${label}`}>
              <h2 id={`reminder-section-${label}`}>{label}</h2>
              <p className="reminder-empty">No upcoming reminders.</p>
            </section>
          )
        }

        if (items.length === 0) return null

        return (
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
      })}

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
