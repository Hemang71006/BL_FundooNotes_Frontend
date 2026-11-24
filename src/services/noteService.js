import apiClient from './apiClient'

/*
 * Project: Fundoo Notes Frontend
 * Module: Notes Service
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides API operations for authenticated note retrieval.
 */

export function getAllNotes() {
  return apiClient.get('/notes')
}

export function createNote(noteData) {
  return apiClient.post('/notes', noteData)
}

export function getNoteById(noteId) {
  return apiClient.get(`/notes/${noteId}`)
}

export function updateNote(noteId, noteData) {
  return apiClient.put(`/notes/${noteId}`, noteData)
}
