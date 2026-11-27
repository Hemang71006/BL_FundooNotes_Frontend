import apiClient from './apiClient'

/*
 * Project: Fundoo Notes Frontend
 * Module: Reminders Service
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Provides authenticated API operations for note reminder management.
 */

export function createReminder(noteId, reminderAt) {
  return apiClient.post(`/notes/${noteId}/reminders`, { reminderAt })
}

export function getAllReminders() {
  return apiClient.get('/notes/reminders')
}

export function getUpcomingReminders() {
  return apiClient.get('/notes/reminders/upcoming')
}

export function getNoteReminders(noteId) {
  return apiClient.get(`/notes/${noteId}/reminders`)
}

export function updateReminder(reminderId, reminderAt) {
  return apiClient.put(`/notes/reminders/${reminderId}`, { reminderAt })
}

export function cancelReminder(reminderId) {
  return apiClient.patch(`/notes/reminders/${reminderId}/cancel`)
}

export function completeReminder(reminderId) {
  return apiClient.patch(`/notes/reminders/${reminderId}/complete`)
}

export function deleteReminder(reminderId) {
  return apiClient.delete(`/notes/reminders/${reminderId}`)
}
