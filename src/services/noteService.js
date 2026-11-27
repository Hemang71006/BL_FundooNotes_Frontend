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

export function pinNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/pin`)
}

export function unpinNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/unpin`)
}

export function archiveNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/archive`)
}

export function unarchiveNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/unarchive`)
}

export function trashNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/trash`)
}

export function restoreNote(noteId) {
  return apiClient.patch(`/notes/${noteId}/restore`)
}

export function deleteNote(noteId) {
  return apiClient.delete(`/notes/${noteId}`)
}

export function getArchivedNotes() {
  return apiClient.get('/notes/archived')
}

export function getTrashedNotes() {
  return apiClient.get('/notes/trash')
}

export function getNotesByLabel(labelId) {
  return apiClient.get('/notes/search', {
    params: {
      labelId,
      status: 'ACTIVE',
    },
  })
}

export function searchNotes(keyword, status = 'ACTIVE', labelId) {
  return apiClient.get('/notes/search', {
    params: {
      keyword,
      status,
      ...(labelId ? { labelId } : {}),
    },
  })
}
