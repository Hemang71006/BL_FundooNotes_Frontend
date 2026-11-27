/*
 * Project: Fundoo Notes Frontend
 * Module: Reminder Time Utilities
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Converts reminder form inputs to the backend LocalDateTime format without timezone shifts.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function isCalendarDate(value) {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function getKolkataNowValue() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  const values = {}
  parts.forEach(({ type, value }) => {
    values[type] = value
  })

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
}

export function validateReminderInput(date, time) {
  if (!date) return 'Reminder date is required'
  if (!DATE_PATTERN.test(date) || !isCalendarDate(date)) return 'Enter a valid reminder date'
  if (!time) return 'Reminder time is required'
  if (!TIME_PATTERN.test(time)) return 'Enter a valid 24-hour time'

  const reminderValue = `${date}T${time}:00`
  if (reminderValue <= getKolkataNowValue()) {
    return 'Choose a future date and time in Asia/Kolkata'
  }

  return ''
}

export function formatReminderParts(value) {
  const [date = '', time = ''] = String(value || '').split('T')
  return {
    date: date || 'Unknown date',
    time: time ? time.slice(0, 5) : 'Unknown time',
  }
}
